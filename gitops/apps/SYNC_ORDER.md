# Argo CD Application Sync Order (Sync Waves)

Этот документ описывает порядок автоматической синхронизации (sync waves) приложений в нашем Argo CD App-of-Apps. 

Порядок синхронизации определяется аннотацией `argocd.argoproj.io/sync-wave` в манифестах приложений. Argo CD применяет ресурсы волнами, начиная с наименьшего номера. Переход к следующей волне происходит только после успешного завершения и готовности (healthy status) ресурсов предыдущей волны.

## Таблица порядка синхронизации

| Wave (Волна) | Manifest (Манифест) | Application Name (Имя в Argo) | Описание / Зависимости |
| :---: | :--- | :--- | :--- |
| **-2** | [cert-manager-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/cert-manager-app.yaml) | `cert-manager` | Устанавливает cert-manager и CRD для `ClusterIssuer`/`Certificate`. |
| **-1** | [istio-base-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/istio-base-app.yaml) | `istio-base` | Устанавливает базовые Istio CRD. |
| **0** | [istiod-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/istiod-app.yaml) | `istiod` | Устанавливает Istio control plane. |
| **0** | [kyverno-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/kyverno-app.yaml) | `kyverno` | Контроллер Kyverno для валидации политик безопасности. Должен быть готов к работе, чтобы избежать отказов при создании ClusterPolicy. |
| **0** | [external-secrets-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/external-secrets-app.yaml) | `external-secrets` | External Secrets Operator (ESO). Необходим для регистрации CRD `ClusterSecretStore` и `ExternalSecret`. |
| **0** | [storage-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/storage-app.yaml) | `storage` | Azure Disk CSI `StorageClass` для PVC MongoDB, Redis и observability. |
| **0** | [mongodb-operator-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/mongodb-operator-app.yaml) | `mongodb-operator` | MongoDB Community Operator. Регистрирует CRD `MongoDBCommunity` для создания ReplicaSet'ов. |
| **1** | [istio-ingressgateway-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/istio-ingressgateway-app.yaml) | `istio-ingressgateway` | Устанавливает Istio ingressgateway и привязывает Azure Public IP. |
| **1** | [kyverno-policies-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/kyverno-policies-app.yaml) | `kyverno-policies` | Ограничивающие политики безопасности Kyverno (ClusterPolicy), применяются после запуска контроллера. |
| **1** | [external-secrets-store-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/external-secrets-store-app.yaml) | `external-secrets-store` | Подключение источника секретов (ClusterSecretStore) к Azure Key Vault. |
| **1** | [kiali-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/kiali-app.yaml) | `kiali` | Визуализатор сервис-меша Kiali. |
| **1** | [prometheus-grafana-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/prometheus-grafana-app.yaml) | `prometheus-grafana` | Базовый стек мониторинга Prometheus & Grafana. |
| **1** | [loki-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/loki-stack` | `loki-stack` | Сборщик логов Loki Stack. |
| **1** | [jaeger-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/jaeger` | `jaeger` | Распределенная трассировка Jaeger. |
| **2** | [istio-config-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/istio-config-app.yaml) | `istio-config` | Gateway, VirtualService, mTLS, AuthorizationPolicy и Let's Encrypt сертификат поверх установленного Istio. |
| **2** | [yola-secrets-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/yola-secrets-app.yaml) | `yola-secrets` | ExternalSecret ресурсы приложения. Создают Kubernetes Secrets для MongoDB, Redis и backend до запуска workload'ов. |
| **2** | [falco-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/falco-app.yaml) | `falco` | Система аудита безопасности Falco. Начинает работу после Kyverno и ESO. |
| **3** | [yola-mongodb-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/yola-mongodb-app.yaml) | `yola-mongodb` | MongoDB Community CR (ReplicaSet). Использует уже созданный `mongodb-root-password-secret`. Требует работающего оператора (wave 0). |
| **3** | [yola-redis-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/yola-redis-app.yaml) | `yola-redis` | Хранилище Redis. Использует уже созданный `redis-password-secret`. |
| **4** | [yola-app.yaml](file:///Users/musaxasmammedov/devops/final-project-yola/gitops/apps/yola-app.yaml) | `yola-apps` | Микросервисы приложения Expensy (backend, frontend). Разворачиваются в последнюю очередь после готовности баз данных и секретов. |
