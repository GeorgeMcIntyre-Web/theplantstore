# Google Cloud Setup Script
# Run this in a terminal where gcloud is available

Write-Host "Setting up Google Cloud project..." -ForegroundColor Green

# Create project
gcloud projects create theplantstore-app-5015 --name="The Plant Store"

# Set project as active
gcloud config set project theplantstore-app-5015

# Enable Google+ API
gcloud services enable plus.googleapis.com

# Login
gcloud auth application-default login

Write-Host "Project setup complete!" -ForegroundColor Green
Write-Host "Project ID: theplantstore-app-5015" -ForegroundColor Yellow
Write-Host "Next: Visit https://console.cloud.google.com/apis/credentials to create OAuth credentials" -ForegroundColor Cyan
