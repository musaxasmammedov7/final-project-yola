Все политики сейчас в режиме Audit — они логируют нарушения, но НЕ блокируют деплой. Это сделано намеренно, чтобы сначала проверить, что существующие манифесты проекта (yola backend/frontend, Bitnami MongoDB/Redis, Istio, observability) не вызывают неожиданных нарушений.

Как проверить нарушения:
kubectl get policyreport -n yola
kubectl get clusterpolicyreport

Как посмотреть детали конкретного нарушения:
kubectl describe policyreport <report-name> -n yola

После того как убедились, что отчётов о нарушениях нет (или все найденные нарушения осознанно исправлены), переключить режим вручную в каждом файле ClusterPolicy: изменить validationFailureAction: Audit на validationFailureAction: Enforce, закоммитить изменение — Argo CD applies автоматически благодаря selfHeal: true.

ВАЖНО про verify-image-signature.yaml: проект использует Cosign keyless. Публичный ключ `cosign.pub` и секреты `COSIGN_PRIVATE_KEY`/`COSIGN_PASSWORD` больше не нужны. Перед переключением на Enforce проверьте policy reports и убедитесь, что backend/frontend CI подписывают образы GitHub Actions identity из соответствующих workflow-файлов на ветке `main`.
