resource "azurerm_cognitive_account" "openai" {
  name                = "yola-openai"
  location            = data.azurerm_resource_group.yola.location
  resource_group_name = data.azurerm_resource_group.yola.name
  kind                = "OpenAI"
  sku_name            = "S0"

  tags = var.tags
}

resource "azurerm_cognitive_deployment" "gpt5nano" {
  name                 = "gpt-5-nano"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-5-nano"
    version = "2025-08-07"
  }

  scale {
    type     = "GlobalStandard"
    capacity = 10
  }
}

resource "azurerm_key_vault_secret" "azure_openai_key" {
  name         = "azure-openai-key"
  value        = azurerm_cognitive_account.openai.primary_access_key
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
}

resource "azurerm_key_vault_secret" "azure_openai_endpoint" {
  name         = "azure-openai-endpoint"
  value        = azurerm_cognitive_account.openai.endpoint
  key_vault_id = azurerm_key_vault.yola.id
  depends_on   = [azurerm_role_assignment.terraform_key_vault_secrets_officer]
}
