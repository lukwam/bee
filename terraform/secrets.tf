resource "google_secret_manager_secret" "zyte_api_key" {
  secret_id = "zyte-api-key"
  project   = google_project_service.services["secretmanager.googleapis.com"].project

  replication {
    auto {}
  }
}

