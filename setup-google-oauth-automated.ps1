# Automated Google OAuth Setup for The Plant Store
# This script will help set up OAuth credentials automatically

Write-Host "Setting up Google OAuth for The Plant Store..." -ForegroundColor Green

# Generate a unique project ID
$projectId = "theplantstore-app-$(Get-Random -Minimum 1000 -Maximum 9999)"
$projectName = "The Plant Store"

Write-Host "Generated Project ID: $projectId" -ForegroundColor Yellow

# Step 1: Create a PowerShell script that will run the gcloud commands
$gcloudScript = @"
# Google Cloud Setup Script
# Run this in a terminal where gcloud is available

Write-Host "Setting up Google Cloud project..." -ForegroundColor Green

# Create project
gcloud projects create $projectId --name="$projectName"

# Set project as active
gcloud config set project $projectId

# Enable Google+ API
gcloud services enable plus.googleapis.com

# Login
gcloud auth application-default login

Write-Host "Project setup complete!" -ForegroundColor Green
Write-Host "Project ID: $projectId" -ForegroundColor Yellow
Write-Host "Next: Visit https://console.cloud.google.com/apis/credentials to create OAuth credentials" -ForegroundColor Cyan
"@

# Save the gcloud script
$gcloudScript | Out-File -FilePath "setup-gcloud.ps1" -Encoding UTF8

Write-Host "Created gcloud setup script: setup-gcloud.ps1" -ForegroundColor Green

# Step 2: Create a web console guide
$webConsoleGuide = @"
# Google Cloud Console Setup Guide

## Step 1: Run the gcloud script
1. Open a new terminal where gcloud is available
2. Run: .\setup-gcloud.ps1

## Step 2: Create OAuth Credentials via Web Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Make sure you're in the project: $projectId
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"
4. Choose "Web application"
5. Name: "The Plant Store Web Client"
6. Authorized JavaScript origins:
   - https://theplantstore-bv6sa6ypx-george-mcintyres-projects.vercel.app
   - http://localhost:3000
7. Authorized redirect URIs:
   - https://theplantstore-bv6sa6ypx-george-mcintyres-projects.vercel.app/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google
8. Click "Create"

## Step 3: Get your credentials
You'll see:
- Client ID (looks like: 123456789-abcdefghijklmnop.apps.googleusercontent.com)
- Client Secret (looks like: GOCSPX-abcdefghijklmnop)

## Step 4: Add to Vercel
Run these commands:
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
"@

# Save the web console guide
$webConsoleGuide | Out-File -FilePath "google-oauth-setup-guide.md" -Encoding UTF8

Write-Host "Created setup guide: google-oauth-setup-guide.md" -ForegroundColor Green

# Step 3: For now, let's add placeholder values to get the site working
Write-Host "Adding placeholder Google OAuth values to get the site working..." -ForegroundColor Yellow

# Add placeholder values to Vercel
Write-Host "Adding placeholder GOOGLE_CLIENT_ID..." -ForegroundColor Cyan
$placeholderClientId = "placeholder-client-id.apps.googleusercontent.com"

# We'll need to add these manually since vercel env add requires interactive input
Write-Host "Please run these commands manually:" -ForegroundColor White
Write-Host "vercel env add GOOGLE_CLIENT_ID production" -ForegroundColor Gray
Write-Host "vercel env add GOOGLE_CLIENT_SECRET production" -ForegroundColor Gray
Write-Host ""
Write-Host "For now, use these placeholder values:" -ForegroundColor Yellow
Write-Host "GOOGLE_CLIENT_ID: $placeholderClientId" -ForegroundColor Gray
Write-Host "GOOGLE_CLIENT_SECRET: placeholder-secret" -ForegroundColor Gray

# Step 4: Create a completion script
$completionScript = @"
# Google OAuth Setup Completion Script
# Run this after you get your real credentials

Write-Host "Updating Google OAuth credentials..." -ForegroundColor Green

# Remove placeholder values
vercel env rm GOOGLE_CLIENT_ID production
vercel env rm GOOGLE_CLIENT_SECRET production

# Add real values (replace with your actual credentials)
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

Write-Host "Credentials updated! Deploying..." -ForegroundColor Green
vercel --prod
"@

$completionScript | Out-File -FilePath "complete-google-oauth.ps1" -Encoding UTF8

Write-Host "Created completion script: complete-google-oauth.ps1" -ForegroundColor Green

Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor White
Write-Host "1. setup-gcloud.ps1 - Run this in a terminal with gcloud" -ForegroundColor Gray
Write-Host "2. google-oauth-setup-guide.md - Step-by-step web console guide" -ForegroundColor Gray
Write-Host "3. complete-google-oauth.ps1 - Run this after getting real credentials" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\setup-gcloud.ps1 (in a terminal with gcloud)" -ForegroundColor White
Write-Host "2. Follow the guide in google-oauth-setup-guide.md" -ForegroundColor White
Write-Host "3. Add placeholder credentials to Vercel for now" -ForegroundColor White
Write-Host "4. Replace with real credentials later using complete-google-oauth.ps1" -ForegroundColor White