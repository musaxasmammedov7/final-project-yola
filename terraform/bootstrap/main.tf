data "azurerm_client_config" "current" {}

locals {
  repo_ref_subject = "repo:${var.github_owner}/${var.github_repo}:ref:refs/heads/${var.github_branch}"
}

resource "azurerm_resource_group" "yola" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_user_assigned_identity" "terraform" {
  name                = var.terraform_identity_name
  resource_group_name = azurerm_resource_group.yola.name
  location            = azurerm_resource_group.yola.location
  tags                = var.tags
}

resource "azurerm_user_assigned_identity" "github_ci" {
  name                = var.github_ci_identity_name
  resource_group_name = azurerm_resource_group.yola.name
  location            = azurerm_resource_group.yola.location
  tags                = var.tags
}

resource "azurerm_user_assigned_identity" "external_secrets" {
  name                = var.external_secrets_identity_name
  resource_group_name = azurerm_resource_group.yola.name
  location            = azurerm_resource_group.yola.location
  tags                = var.tags
}

resource "azurerm_federated_identity_credential" "terraform_infra" {
  name                = "fic-github-terraform"
  resource_group_name = azurerm_resource_group.yola.name
  parent_id           = azurerm_user_assigned_identity.terraform.id
  issuer              = "https://token.actions.githubusercontent.com"
  subject             = local.repo_ref_subject
  audience            = ["api://AzureADTokenExchange"]
}

resource "azurerm_federated_identity_credential" "backend_ci" {
  name                = "fic-github-app-ci"
  resource_group_name = azurerm_resource_group.yola.name
  parent_id           = azurerm_user_assigned_identity.github_ci.id
  issuer              = "https://token.actions.githubusercontent.com"
  subject             = local.repo_ref_subject
  audience            = ["api://AzureADTokenExchange"]
}

resource "azurerm_role_assignment" "terraform_contributor" {
  scope                = azurerm_resource_group.yola.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.terraform.principal_id
}

resource "azurerm_role_assignment" "terraform_user_access_admin" {
  scope                = azurerm_resource_group.yola.id
  role_definition_name = "User Access Administrator"
  principal_id         = azurerm_user_assigned_identity.terraform.principal_id
}
