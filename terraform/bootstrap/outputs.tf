output "resource_group_name" {
  value       = azurerm_resource_group.yola.name
  description = "Resource group created by bootstrap."
}

output "terraform_client_id" {
  value       = azurerm_user_assigned_identity.terraform.client_id
  description = "Use this as AZURE_CLIENT_ID for terraform.yml and terraform-bootstrap.yml."
}

output "terraform_principal_id" {
  value       = azurerm_user_assigned_identity.terraform.principal_id
  description = "Use this as the service principal object id for role assignment creation."
}

output "github_ci_client_id" {
  value       = azurerm_user_assigned_identity.github_ci.client_id
  description = "Use this as AZURE_CLIENT_ID for backend-ci.yml and frontend-ci.yml."
}

output "external_secrets_client_id" {
  value       = azurerm_user_assigned_identity.external_secrets.client_id
  description = "Used by External Secrets Operator service account annotation."
}
