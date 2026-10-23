resource "google_project_service_identity" "cloudbuild" {
  provider = google-beta
  project  = google_project_service.services["cloudbuild.googleapis.com"].project
  service  = "cloudbuild.googleapis.com"
}

# The lukwam.dev repo grants the Cloud Build service agent access to the GitHub
# token in lukwam-dev, which this connection needs.
module "cloudbuildv2-connection" {
  source  = "altissimo-hq/cloudbuildv2-connection/google"
  version = "1.0.5"

  github_login               = "lukwam"
  github_app_installation_id = 172559547
  project                    = google_project_service.services["cloudbuild.googleapis.com"].project
  region                     = var.region

  oauth_token_secret = "github-terraform-token"
  secret_project     = "lukwam-dev"

  repositories = [
    "bee",
  ]
}

resource "google_cloudbuild_trigger" "deploy-update-hints-function" {
  provider    = google-beta
  name        = "deploy-update-hints-function"
  description = "Deploy Update Hints Function"
  filename    = "functions/update_hints/cloudbuild.yaml"
  project     = google_project_service.services["cloudbuild.googleapis.com"].project
  location    = var.region
  # include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"

  included_files = [
    "functions/update_hints/*",
  ]

  repository_event_config {
    repository = module.cloudbuildv2-connection.repository_ids["bee"]
    push {
      branch = "^${var.branch}$"
    }
  }

  substitutions = {
    _REGION = var.region
  }

}
