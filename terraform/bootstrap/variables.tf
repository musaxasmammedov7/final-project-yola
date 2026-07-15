variable "resource_group_name" {
  description = "Resource group created once during identity bootstrap."
  type        = string
  default     = "yola-rg"
}

variable "location" {
  description = "Azure region."
  type        = string
  default     = "swedencentral"
}

variable "github_owner" {
  description = "GitHub repository owner or organization."
  type        = string
  default     = "musaxasmammedov7"
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "final-project-yola"
}

variable "github_branch" {
  description = "Branch allowed to use Azure federated identities."
  type        = string
  default     = "main"
}

variable "terraform_identity_name" {
  description = "User-assigned identity used by terraform.yml and terraform-bootstrap.yml."
  type        = string
  default     = "yola-terraform"
}

variable "github_ci_identity_name" {
  description = "User-assigned identity used by backend/frontend CI to push to ACR."
  type        = string
  default     = "yola-github-ci"
}

variable "external_secrets_identity_name" {
  description = "User-assigned identity used by External Secrets Operator through AKS Workload Identity."
  type        = string
  default     = "yola-external-secrets"
}

variable "tags" {
  description = "Tags to apply to bootstrap resources."
  type        = map(string)
  default = {
    Project     = "Yola"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Layer       = "IdentityBootstrap"
  }
}
