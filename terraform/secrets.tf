resource "random_password" "mongodb_root_password" {
  length  = 32
  special = false
}

resource "random_password" "redis_password" {
  length  = 32
  special = false
}

resource "random_password" "falco_smtp_password" {
  length  = 32
  special = false
}

resource "random_password" "grafana_admin_password" {
  length           = 32
  special          = true
  override_special = "!@#$%&*"
}

locals {
  mongo_database     = "yola"
  mongo_service_fqdn = "yola-mongo.yola.svc.cluster.local:27017"

  backend_database_uri = "mongodb://root:${urlencode(random_password.mongodb_root_password.result)}@${local.mongo_service_fqdn}/${local.mongo_database}?authSource=admin"
}

resource "azurerm_key_vault_secret" "mongodb_root_password" {
  name         = "mongodb-root-password"
  value        = random_password.mongodb_root_password.result
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "redis_password" {
  name         = "redis-password"
  value        = random_password.redis_password.result
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "backend_database_uri" {
  name         = "backend-database-uri"
  value        = local.backend_database_uri
  key_vault_id = azurerm_key_vault.yola.id
  depends_on = [
    azurerm_role_assignment.terraform_key_vault_secrets_officer,
    azurerm_key_vault_secret.mongodb_root_password,
  ]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "falco_smtp_password" {
  name         = "falco-smtp-password"
  value        = random_password.falco_smtp_password.result
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "grafana_admin_password" {
  name         = "grafana-admin-password"
  value        = random_password.grafana_admin_password.result
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "groq_api_key" {
  count        = var.groq_api_key != "" ? 1 : 0
  name         = "groq-api-key"
  value        = var.groq_api_key
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "alertmanager_smtp_password" {
  count        = var.alertmanager_smtp_password != "" ? 1 : 0
  name         = "alertmanager-smtp-password"
  value        = var.alertmanager_smtp_password
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "alertmanager_telegram_token" {
  count        = var.alertmanager_telegram_token != "" ? 1 : 0
  name         = "alertmanager-telegram-token"
  value        = var.alertmanager_telegram_token
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
  lifecycle {
    ignore_changes = [value]
  }
}
