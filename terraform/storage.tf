resource "google_storage_bucket" "hints" {
  name          = "lukwam-bee-hints"
  project       = google_project.project.project_id
  location      = var.region
  force_destroy = false
  uniform_bucket_level_access = true
  cors {
    origin          = ["*"]
    method          = ["GET"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_member" "hints-admin" {
  bucket = google_storage_bucket.hints.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.hints.email}"
}

resource "google_storage_bucket_iam_member" "hints-public-reader" {
  bucket = google_storage_bucket.hints.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
