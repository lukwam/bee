resource "google_app_engine_application" "app" {
  project = google_project_service.services["appengine.googleapis.com"].project
  location_id = "us-central"
  database_type = "CLOUD_FIRESTORE"
}