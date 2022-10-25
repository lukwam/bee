resource "google_cloudbuild_trigger" "deploy-update-hints-function" {
  provider       = google-beta
  name           = "deploy-update-hints-function"
  description    = "Deploy Update Hints Function"
  filename       = "functions/deploy_hints/cloudbuild.yaml"
  project        = google_project_service.services["cloudbuild.googleapis.com"].project
  # include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"

  included_files = [
    "functions/deploy_hints/*",
  ]

  github {
    name     = "bee"
    owner    = "lukwam"
    push {
      branch = "^${var.branch}$"
    }
  }

  substitutions = {
    _REGION = var.region
  }

}