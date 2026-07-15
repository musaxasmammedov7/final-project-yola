# Чеклист проверки после деплоя приложения Expensy

Пожалуйста, выполните следующие шаги после применения манифестов, чтобы убедиться в работоспособности системы:

1. **Проверка готовности MongoDB Community Operator и CR**
   - Проверить `kubectl get pods -n mongodb-operator` — pod оператора должен быть в статусе `Running`.
   - Проверить `kubectl get mongodbcommunity -n yola` — должен показать `yola-mongo` с `Phase: Running`.
   - Проверить `kubectl get pods -n yola | grep yola-mongo` — должны быть 2 (или более) pod'а MongoDB ReplicaSet, все в статусе `Running` и `Ready 2/2`.

2. **Проверка готовности Redis**
   - Проверить `kubectl get pods -n yola | grep yola-redis` — pod Redis должен быть в статусе `Running` и `Ready 2/2` (основной + prometheus exporter sidecar).

3. **Проверка меток (Labels) баз данных для NetworkPolicy**
   - Выполнить `kubectl get pods -n yola --show-labels` после того, как MongoDB и Redis полностью поднялись.
   - Сверить реальные labels с тем, что указано в `networkpolicy.yaml` в правилах `allow-backend-to-mongo` и `allow-backend-to-redis`.
   - Для MongoDB Community CR оператор обычно присваивает labels типа `app=yola-mongo`, `statefulset.kubernetes.io/pod-name=yola-mongo-0` и т.д. — адаптировать селектор в NetworkPolicy при необходимости.

4. **Проверка имен сервисов баз данных для ConfigMap/Secret**
   - Выполнить `kubectl get svc -n yola` и сверить реальные имена Service MongoDB/Redis.
   - MongoDB Community CR обычно создаёт Service с именем `yola-mongo-svc` (или просто `yola-mongo`), Redis — `yola-redis-master`.
   - Убедиться, что `DATABASE_URI` в `backend-secret.yaml` и `REDIS_HOST` в `backend-configmap.yaml` указывают на правильные Service names.

5. **Проверка статуса подов и инъекции Istio**
   - Проверить `kubectl get pods -n yola` — все Pod (backend, frontend, mongodb-instances, redis) должны показывать READY `2/2` (основной контейнер + istio-proxy sidecar), а не `1/2` или зависание в Init.

6. **Проверка хелсчеков (Readiness/Liveness Probes)**
   - Если backend или frontend Pod в состоянии `CrashLoopBackOff` или долго не переходит в Ready — первым делом проверить, реализован ли в коде Express `GET /health` (возвращающий статус 200) и доступен ли Next.js на пути `/` без ошибок.

7. **Проверка сетевой связности с Istio Control Plane**
   - Если sidecar `istio-proxy` не может связаться с `istiod` — проверить через `kubectl logs -n yola <pod-name> -c istio-proxy`.
   - Проверить `kubectl describe networkpolicy allow-istio-control-plane-egress -n yola`.

8. **Проверка наличия метки (Label) на Namespace**
   - Проверить `kubectl get namespace yola --show-labels` — должна быть метка `istio-injection=enabled`.

9. **Очистка осиротевших ресурсов от старого Bitnami MongoDB (при необходимости)**
   - Если были ошибки с ErrImagePull старого Bitnami Helm release, удалить старый PVC:
     ```bash
     kubectl get pvc -n yola
     kubectl delete pvc <old-pvc-name> -n yola
     ```
   - Проверить, что диск удалился в Azure:
     ```bash
     az disk list --resource-group yola-rg --query "[?contains(name, 'yola-mongo')].{name:name, sizeGb:diskSizeGb}" -o table
     ```
   - Если диск остался, удалить вручную:
     ```bash
     az disk delete --name <disk-name> --resource-group yola-rg --yes
     ```
