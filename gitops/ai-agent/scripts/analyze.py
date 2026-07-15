import os
import json
import requests
from datetime import datetime, timedelta, timezone
from kubernetes import client, config

PROMETHEUS_URL = os.environ.get("PROMETHEUS_URL", "http://prometheus-grafana-kube-pr-prometheus.monitoring:9090")
LOKI_URL = os.environ.get("LOKI_URL", "http://loki-stack.monitoring:3100")
JAEGER_URL = os.environ.get("JAEGER_URL", "http://jaeger-query.monitoring:16686")
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_ENDPOINT = os.environ["OPENAI_ENDPOINT"]
TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "7538711142")
OPENAI_DEPLOYMENT = os.environ.get("OPENAI_DEPLOYMENT", "gpt-5-nano")

config.load_incluster_config()
v1 = client.CoreV1Api()
apps_v1 = client.AppsV1Api()


def prometheus_query_range(query, hours=168):
    try:
        end = datetime.now(timezone.utc)
        start = end - timedelta(hours=hours)
        resp = requests.get(
            PROMETHEUS_URL + "/api/v1/query_range",
            params={"query": query, "start": start.isoformat() + "Z", "end": end.isoformat() + "Z", "step": "1h"},
            timeout=10,
        )
        data = resp.json()
        if data.get("status") == "success":
            values = data["data"]["result"]
            if values:
                return [float(v[1]) for v in values[0]["values"]]
        return []
    except Exception as e:
        print("Prometheus range error: " + str(e))
        return []


def prometheus_query(query):
    try:
        resp = requests.get(PROMETHEUS_URL + "/api/v1/query", params={"query": query}, timeout=10)
        data = resp.json()
        if data.get("status") == "success":
            result = data["data"]["result"]
            if result:
                return float(result[0]["value"][1])
        return 0
    except Exception as e:
        print("Prometheus query error: " + str(e))
        return 0


def loki_query(query):
    try:
        resp = requests.get(LOKI_URL + "/loki/api/v1/query", params={"query": query}, timeout=10)
        data = resp.json()
        if data.get("status") == "success":
            result = data["data"]["result"]
            if result:
                return float(result[0]["value"][1])
        return 0
    except Exception as e:
        print("Loki query error: " + str(e))
        return 0


def jaeger_traces(service="backend", hours=24):
    try:
        resp = requests.get(
            JAEGER_URL + "/api/traces",
            params={"service": service, "lookback": str(hours) + "h", "limit": 500},
            timeout=10,
        )
        data = resp.json()
        traces = data.get("data", [])
        latencies = []
        errors = 0
        for trace in traces:
            for span in trace.get("spans", []):
                duration_ms = span["duration"] / 1000
                latencies.append(duration_ms)
                if any(tag["key"] == "error" and tag["value"] is True for tag in span.get("tags", [])):
                    errors += 1
        latencies.sort()
        p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0
        return {"p95": round(p95, 2), "total": len(latencies), "errors": errors}
    except Exception as e:
        print("Jaeger error: " + str(e))
        return {"p95": 0, "total": 0, "errors": 0}


def get_k8s_data():
    data = {"nodes": [], "pending_pods": 0, "events": []}
    try:
        nodes = v1.list_node()
        for node in nodes.items:
            conditions = node.status.conditions or []
            ready = "Unknown"
            for c in conditions:
                if c.type == "Ready":
                    ready = c.status
            allocatable = node.status.allocatable or {}
            data["nodes"].append({
                "name": node.metadata.name,
                "ready": ready,
                "cpu": allocatable.get("cpu", "N/A"),
                "memory": allocatable.get("memory", "N/A"),
            })
        pods = v1.list_pod_for_all_namespaces(field_selector="status.phase=Pending")
        data["pending_pods"] = len(pods.items)
        events = v1.list_event_for_all_namespaces(
            field_selector="reason=Failed,type=Warning", limit=20
        )
        for event in events.items[:10]:
            data["events"].append({
                "object": event.involved_object.kind + "/" + event.involved_object.name,
                "message": (event.message[:200] if event.message else ""),
                "namespace": event.metadata.namespace,
            })
    except Exception as e:
        print("K8s API error: " + str(e))
    return data


def collect_metrics():
    cpu_trend = prometheus_query_range('avg(rate(container_cpu_usage_seconds_total{namespace!="kube-system"}[5m]))')
    ram_trend = prometheus_query_range('avg(container_memory_working_set_bytes{namespace!="kube-system"})')
    cpu_current = prometheus_query('avg(rate(container_cpu_usage_seconds_total{namespace!="kube-system"}[5m])) * 100')
    ram_current_gb = prometheus_query('avg(container_memory_working_set_bytes{namespace!="kube-system"}) / 1024 / 1024 / 1024')
    pod_restarts = prometheus_query('sum(increase(kube_pod_container_status_restarts_total{namespace!="kube-system"}[24h]))')
    disk_usage_pct = prometheus_query('avg(kubelet_volume_stats_used_bytes / kubelet_volume_stats_capacity_bytes) * 100')

    error_logs_24h = loki_query('sum(count_over_time({job=~".+"} |~ "error|exception|fatal|Error|ERROR" [24h]))')
    warn_logs_24h = loki_query('sum(count_over_time({job=~".+"} |~ "warn|warning|Warn|WARN" [24h]))')

    jaeger_data = jaeger_traces("backend", 24)
    k8s_data = get_k8s_data()

    return {
        "cpu_trend": cpu_trend[-24:] if cpu_trend else [],
        "cpu_current": round(cpu_current, 1),
        "ram_trend": [round(r / 1024 / 1024 / 1024, 2) for r in (ram_trend[-24:] if ram_trend else [])],
        "ram_current_gb": round(ram_current_gb, 2),
        "pod_restarts_24h": int(pod_restarts),
        "disk_usage_pct": round(disk_usage_pct, 1),
        "error_logs_24h": int(error_logs_24h),
        "warn_logs_24h": int(warn_logs_24h),
        "jaeger_p95": jaeger_data["p95"],
        "jaeger_traces_total": jaeger_data["total"],
        "jaeger_errors": jaeger_data["errors"],
        "nodes": k8s_data["nodes"],
        "pending_pods": k8s_data["pending_pods"],
        "recent_events": k8s_data["events"],
    }


def build_prompt(metrics):
    nodes_lines = []
    for n in metrics["nodes"]:
        nodes_lines.append("  - " + n["name"] + ": Ready=" + n["ready"] + ", CPU=" + n["cpu"] + ", RAM=" + n["memory"])
    nodes_info = "\n".join(nodes_lines)

    events_lines = []
    for e in metrics["recent_events"]:
        events_lines.append("  - [" + e["namespace"] + "] " + e["object"] + ": " + e["message"])
    events_info = "\n".join(events_lines) if events_lines else "  None"

    return (
        "You are a Kubernetes infrastructure analyst. Analyze this cluster data and provide a concise report.\n\n"
        "CLUSTER: yola-aks (3 nodes: 2x Standard_D2s_v3, 1x Standard_B2s_v2)\n\n"
        "METRICS (last 24h, trend from 7d):\n"
        "- CPU usage: " + str(metrics["cpu_current"]) + "% (trend: " + str(metrics["cpu_trend"][:7]) + ")\n"
        "- RAM usage: " + str(metrics["ram_current_gb"]) + "GB (trend: " + str(metrics["ram_trend"][:7]) + ")\n"
        "- Disk usage: " + str(metrics["disk_usage_pct"]) + "%\n"
        "- Pod restarts (24h): " + str(metrics["pod_restarts_24h"]) + "\n\n"
        "LOGS (24h):\n"
        "- Error logs: " + str(metrics["error_logs_24h"]) + "\n"
        "- Warning logs: " + str(metrics["warn_logs_24h"]) + "\n\n"
        "JAEGER TRACES (24h):\n"
        "- Latency p95: " + str(metrics["jaeger_p95"]) + "ms\n"
        "- Total traces: " + str(metrics["jaeger_traces_total"]) + "\n"
        "- Error traces: " + str(metrics["jaeger_errors"]) + "\n\n"
        "CLUSTER STATE:\n"
        "- Pending pods: " + str(metrics["pending_pods"]) + "\n"
        "- Nodes:\n" + nodes_info + "\n"
        "- Recent warning events:\n" + events_info + "\n\n"
        "Provide your analysis in this EXACT format. Plain text only, no HTML, no markdown.\n"
        "Use these section headers exactly as written:\n\n"
        "HEALTH\n"
        "[One line: overall status with emoji ok/warn/crit]\n\n"
        "TRENDS\n"
        "[3-5 lines with emoji arrows: CPU, RAM, Restarts, Errors]\n\n"
        "PREDICTIONS\n"
        "[2-3 bullet points with timeframes]\n\n"
        "ACTIONS\n"
        "[3-4 numbered items with priority emoji]\n\n"
        "HEALTHY\n"
        "[Short list of working services]\n\n"
        "Keep it under 1500 characters. Be concise and actionable."
    )


def send_to_llm(prompt):
    headers = {
        "Content-Type": "application/json",
        "api-key": OPENAI_API_KEY,
    }
    body = {
        "messages": [{"role": "user", "content": prompt}],
        "max_completion_tokens": 8000,
        "reasoning_effort": "low",
    }
    endpoint = OPENAI_ENDPOINT.rstrip("/")
    url = endpoint + "/openai/deployments/" + OPENAI_DEPLOYMENT + "/chat/completions?api-version=2025-04-01-preview"
    try:
        resp = requests.post(url, headers=headers, json=body, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        finish = data["choices"][0].get("finish_reason", "unknown")
        usage = data.get("usage", {})
        print("  LLM finish_reason: " + str(finish))
        print("  LLM usage: " + str(usage))
        print("  LLM content length: " + str(len(content)) + " chars")
        print("  LLM content preview: " + content[:300])
        return content
    except Exception as e:
        return "LLM Error: " + str(e) + "\n\nRaw metrics collected but analysis failed."


def send_to_telegram(text):
    max_len = 4000
    chunks = [text[i : i + max_len] for i in range(0, len(text), max_len)]
    for chunk in chunks:
        try:
            requests.post(
                "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage",
                json={"chat_id": TELEGRAM_CHAT_ID, "text": chunk, "parse_mode": "HTML"},
                timeout=10,
            )
        except Exception as e:
            print("Telegram error: " + str(e))


def format_report_header(metrics, now):
    cpu = metrics["cpu_current"]
    ram = metrics["ram_current_gb"]
    disk = metrics["disk_usage_pct"]
    errors = metrics["error_logs_24h"]
    restarts = metrics["pod_restarts_24h"]
    p95 = metrics["jaeger_p95"]
    traces = metrics["jaeger_traces_total"]
    jaeger_err = metrics["jaeger_errors"]
    warn = metrics["warn_logs_24h"]
    nodes = metrics["nodes"]
    ready_count = sum(1 for n in nodes if n["ready"] == "True")

    if restarts > 50 or errors > 10000:
        status = "CRITICAL"
        status_emoji = "\U0001f534"
    elif restarts > 10 or errors > 5000:
        status = "WARNING"
        status_emoji = "\U0001f7e1"
    else:
        status = "HEALTHY"
        status_emoji = "\U0001f7e2"

    cpu_bar = "▓" * max(1, int(cpu / 10)) + "░" * (10 - max(1, int(cpu / 10)))
    ram_val = int(ram)
    ram_bar = "▓" * max(1, int(ram_val * 2)) + "░" * max(0, 10 - int(ram_val * 2))

    return (
        "\U0001f916 <b>EXPENSY INFRASTRUCTURE REPORT</b>\n"
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
        "\n"
        "\U0001f4c5 <i>" + now + "</i>\n"
        "\n"
        status_emoji + " <b>" + status + "</b>  \u2022  "
        "\U0001f3e2 <code>" + str(ready_count) + "/" + str(len(nodes)) + "</code> nodes\n"
        "\n"
        "\U0001f4ca <b>RESOURCES</b>\n"
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
        "  \U0001f4bb CPU    <code>" + str(cpu) + "%</code>  <code>" + cpu_bar + "</code>\n"
        "  \U0001f9ea RAM    <code>" + str(ram) + " GB</code>  <code>" + ram_bar + "</code>\n"
        "  \U0001f4be Disk   <code>" + str(disk) + "%</code>\n"
        "\n"
        "\U0001f50d <b>HEALTH</b>\n"
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
        "  \u26a0\ufe0f  Errors    <code>" + str(errors) + "</code>  \u2022  Warn <code>" + str(warn) + "</code>\n"
        "  \U0001f504 Restarts <code>" + str(restarts) + "</code>\n"
        "  \u23f1\ufe0f  P95       <code>" + str(p95) + " ms</code>\n"
        "  \U0001f4e1 Traces   <code>" + str(traces) + "</code>  \u2022  Err <code>" + str(jaeger_err) + "</code>\n"
        "\n"
        "\U0001f4c8 <b>AI ANALYSIS</b>\n"
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
    )


def format_report_footer():
    return (
        "\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
        "\U0001f916 <i>Powered by Azure OpenAI GPT-5-nano</i>\n"
        "\U0001f310 <code>yola-aks</code> \u2022 Swedencentral \u2022 \U0001f4ca 7 dashboards\n"
        "\U0001f512 7-layer security \u2022 \U0001f6e1\ufe0f Kyverno Enforce \u2022 \U0001f4e1 14 alerts\n"
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"
    )


def main():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print("[" + now + "] Starting AI infrastructure analysis...")

    print("Collecting metrics from Prometheus...")
    metrics = collect_metrics()
    print("  CPU: " + str(metrics["cpu_current"]) + "%, RAM: " + str(metrics["ram_current_gb"]) + "GB")
    print("  Errors: " + str(metrics["error_logs_24h"]) + ", Restarts: " + str(metrics["pod_restarts_24h"]))

    print("Building prompt...")
    prompt = build_prompt(metrics)

    print("Sending to Azure OpenAI...")
    analysis = send_to_llm(prompt)

    header = format_report_header(metrics, now)
    footer = format_report_footer()

    report = header + analysis + footer
    print("Report length: " + str(len(report)) + " chars")

    print("Sending to Telegram...")
    send_to_telegram(report)

    print("Done!")


if __name__ == "__main__":
    main()
