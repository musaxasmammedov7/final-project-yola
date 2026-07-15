data "azurerm_client_config" "current" {}

data "azurerm_resource_group" "yola" {
  name = var.resource_group_name
}

data "azurerm_user_assigned_identity" "github_ci" {
  name                = var.github_ci_identity_name
  resource_group_name = data.azurerm_resource_group.yola.name
}

data "azurerm_user_assigned_identity" "external_secrets" {
  name                = var.external_secrets_identity_name
  resource_group_name = data.azurerm_resource_group.yola.name
}

resource "azurerm_container_registry" "yola" {
  name                = var.acr_name
  resource_group_name = data.azurerm_resource_group.yola.name
  location            = data.azurerm_resource_group.yola.location
  sku                 = var.acr_sku
  admin_enabled       = false

  tags = var.tags
}

resource "azurerm_kubernetes_cluster" "yola" {
  name                = var.aks_name
  location            = data.azurerm_resource_group.yola.location
  resource_group_name = data.azurerm_resource_group.yola.name
  dns_prefix          = var.aks_dns_prefix
  kubernetes_version  = var.kubernetes_version

  oidc_issuer_enabled       = true
  workload_identity_enabled = true

  default_node_pool {
    name                        = "system"
    vm_size                     = var.aks_node_vm_size
    node_count                  = var.aks_node_count
    os_disk_size_gb             = var.aks_os_disk_size_gb
    type                        = "VirtualMachineScaleSets"
    temporary_name_for_rotation = "tempsystem"
    enable_auto_scaling         = true
    min_count                   = var.aks_node_min_count
    max_count                   = var.aks_node_max_count
  }

  identity {
    type = "SystemAssigned"
  }

  storage_profile {
    disk_driver_enabled = true
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    load_balancer_sku = "standard"
  }

  lifecycle {
    ignore_changes = [default_node_pool[0].node_count]
  }

  tags = var.tags
}

resource "azurerm_key_vault" "yola" {
  name                       = var.key_vault_name
  location                   = data.azurerm_resource_group.yola.location
  resource_group_name        = data.azurerm_resource_group.yola.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = var.key_vault_sku
  soft_delete_retention_days = var.key_vault_soft_delete_retention_days
  purge_protection_enabled   = var.key_vault_purge_protection_enabled
  enable_rbac_authorization  = true

  tags = var.tags
}

resource "azurerm_role_assignment" "terraform_key_vault_secrets_officer" {
  scope                = azurerm_key_vault.yola.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "external_secrets_key_vault_secrets_user" {
  scope                = azurerm_key_vault.yola.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = data.azurerm_user_assigned_identity.external_secrets.principal_id
}

resource "azurerm_public_ip" "istio_ingress" {
  name                = var.public_ip_name
  resource_group_name = data.azurerm_resource_group.yola.name
  location            = data.azurerm_resource_group.yola.location
  allocation_method   = "Static"
  sku                 = "Standard"
  domain_name_label   = var.public_ip_domain_name_label

  tags = var.tags
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.yola.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.yola.kubelet_identity[0].object_id
}


resource "azurerm_role_assignment" "github_ci_acr_push" {
  scope                = azurerm_container_registry.yola.id
  role_definition_name = "AcrPush"
  principal_id         = data.azurerm_user_assigned_identity.github_ci.principal_id
}

resource "azurerm_federated_identity_credential" "external_secrets" {
  name                = "fic-eso-yola"
  resource_group_name = data.azurerm_resource_group.yola.name
  parent_id           = data.azurerm_user_assigned_identity.external_secrets.id
  issuer              = azurerm_kubernetes_cluster.yola.oidc_issuer_url
  subject             = "system:serviceaccount:external-secrets:external-secrets"
  audience            = ["api://AzureADTokenExchange"]
}
