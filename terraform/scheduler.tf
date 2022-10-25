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
    uri = "https://workflowexecutions.googleapis.com/v1/projects/${var.project_id}/locations/${var.region}/workflows/workday-people-feed/executions"

    oauth_token {
      service_account_email = "${var.project_id}@appspot.gserviceaccount.com"
    }
  }

  depends_on = [
    google_app_engine_application.app,
  ]
}