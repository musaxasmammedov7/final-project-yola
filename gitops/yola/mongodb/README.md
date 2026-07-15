# MongoDB Community Operator Deployment

Этот директорий содержит конфигурацию для развёртывания MongoDB через **MongoDB Community Operator** вместо устаревшего Bitnami Helm chart.

## Структура

- `mongodb-community.yaml` — CustomResource (CR) `MongoDBCommunity`, описывающий желаемое состояние MongoDB ReplicaSet.
- `kustomization.yaml` — Kustomize конфигурация для применения манифестов.

## Почему Community Operator вместо Bitnami?

1. **Официальный оператор** — MongoDB Community Operator разработан самой MongoDB и обновляется синхронно с новыми версиями.
2. **Лучшая поддержка ReplicaSet** — нативная поддержка различных типов развёртывания (ReplicaSet, Sharded).
3. **Управление SCRAM учётными данными** — оператор автоматически синхронизирует пароли из Kubernetes Secret в MongoDB.
4. **Lifecycle** — оператор управляет обновлениями, хелсчеками, автоматическими восстановлениями.

## Поток синхронизации (Sync Waves)

1. **Wave 0** — `mongodb-operator-app.yaml` (ArgoCD Application) установит сам оператор в namespace `mongodb-operator` и зарегистрирует CRD.
2. **Wave 2** — `yola-secrets-app.yaml` (ExternalSecret) создаст `mongodb-root-password-secret` в namespace `yola`.
3. **Wave 3** — `yola-mongodb-app.yaml` (Application pointing to этот директорий) применит `mongodb-community.yaml`.

> Это гарантирует, что к моменту применения CR пароль уже будет существовать в namespace.

## Конфигурация CR

```yaml
spec:
  members: 2                           # Количество членов ReplicaSet (2 = 1 primary + 1 secondary)
  type: ReplicaSet                     # Тип кластера
  version: "7.0.11"                    # Версия MongoDB
  security.authentication.modes:       # SCRAM для авторизации
  users:                               # Два пользователя:
    - root (db: admin)                 #   root — для админ операций
    - yola (db: yola)            #   yola — для приложения
  storage:
    storageClassName: managed-csi-premium  # Azure managed disks
    size: 5Gi                          # Размер PVC на каждый член
```

## Проверка после деплоя

```bash
# 1. Проверить оператор
kubectl get pods -n mongodb-operator
kubectl logs -n mongodb-operator deployment/mongodb-kubernetes-operator -f

# 2. Проверить CR и StatefulSet
kubectl get mongodbcommunity -n yola
kubectl get statefulset -n yola
kubectl get pods -n yola | grep yola-mongo

# 3. Проверить Service
kubectl get svc -n yola | grep mongo

# 4. Проверить логи pod'ов MongoDB
kubectl logs -n yola yola-mongo-0
kubectl logs -n yola yola-mongo-1

# 5. Проверить SCRAM учётные данные в кластере
kubectl get secret -n yola | grep scram
```

## Удаление и восстановление

```bash
# Удалить CR (pod'ы будут удалены, PVC останутся для сохранения данных)
kubectl delete mongodbcommunity yola-mongo -n yola

# Удалить оператор (CRD останется, поэтому нужно удалить CR перед удалением оператора)
kubectl delete application mongodb-operator -n argocd

# Восстановление: просто ре-синхронизировать через ArgoCD
# или явно: kubectl apply -f gitops/yola/mongodb/
```

## Переход с Bitnami

Если вы переходите со старого Bitnami chart:

1. Убедитесь, что новый MongoDB Community CR успешно развернулся (все pod'ы `Running`).
2. Удалите старый Bitnami release или Application.
3. Очистите PVC от старого Bitnami:
   ```bash
   kubectl get pvc -n yola | grep mongo
   kubectl delete pvc <old-pvc> -n yola
   ```
4. Проверьте в Azure, что диск удалился:
   ```bash
   az disk list --resource-group yola-rg --query "[?contains(name, 'mongo')]" -o table
   ```
