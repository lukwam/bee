resource "google_cloud_scheduler_job" "update_hints" {
  name             = "run_update_hints_function"
  description      = "Run \"update_hints\" function"
  schedule         = "5 3 * * *"
  time_zone        = "America/New_York"
  attempt_deadline = "60s"
  project          = google_project_service.services["cloudscheduler.googleapis.com"].project
  region           = var.region
  http_target {
    http_method = "POST"
    uri = "https://us-central1-lukwam-bee.cloudfunctions.net/update_hints"

    oidc_token {
      audience = "https://us-central1-lukwam-bee.cloudfunctions.net/update_hints"
      service_account_email = "${var.project_id}@appspot.gserviceaccount.com"
    }

  }

  depends_on = [
    google_app_engine_application.app,
  ]
}