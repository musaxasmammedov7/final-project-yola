output "resource_group_name" {
  description = "Resource group used by Expensy."
  value       = data.azurerm_resource_group.yola.name
}

output "acr_name" {
  description = "Azure Container Registry name."
  value       = azurerm_container_registry.yola.name
}

output "acr_login_server" {
  description = "ACR login server used by backend/frontend CI."
  value       = azurerm_container_registry.yola.login_server
}

output "aks_name" {
  description = "AKS cluster name."
  value       = azurerm_kubernetes_cluster.yola.name
}

output "aks_oidc_issuer_url" {
  description = "AKS OIDC issuer URL for workload identity federation."
  value       = azurerm_kubernetes_cluster.yola.oidc_issuer_url
}

output "key_vault_name" {
  description = "Key Vault name."
  value       = azurerm_key_vault.yola.name
}

output "key_vault_url" {
  description = "Key Vault URL used by External Secrets Operator."
  value       = azurerm_key_vault.yola.vault_uri
}

output "external_secrets_client_id" {
  description = "Azure Workload Identity client ID for External Secrets Operator."
  value       = data.azurerm_user_assigned_identity.external_secrets.client_id
}

output "istio_ingress_public_ip" {
  description = "Static public IP reserved for Istio ingress."
  value       = azurerm_public_ip.istio_ingress.ip_address
}

output "istio_ingress_fqdn" {
  description = "Azure DNS FQDN for the Istio ingress public IP."
  value       = azurerm_public_ip.istio_ingress.fqdn
}

output "tenant_id" {
  description = "Azure tenant ID."
  value       = data.azurerm_client_config.current.tenant_id
}
