# Google OAuth Setup Script for The Plant Store
# This script helps create OAuth 2.0 credentials for Google authentication

Write-Host "Setting up Google OAuth for The Plant Store..." -ForegroundColor Green

# Step 1: Create a new project
Write-Host "Step 1: Creating new Google Cloud project..." -ForegroundColor Yellow
$projectId = "theplantstore-app-$(Get-Random -Minimum 1000 -Maximum 9999)"
$projectName = "The Plant Store"

# Note: You'll need to run these commands manually in your terminal where gcloud is available:
Write-Host "Please run these commands in your terminal where gcloud is available:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create project:" -ForegroundColor White
Write-Host "   gcloud projects create $projectId --name=`"$projectName`"" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set project as active:" -ForegroundColor White
Write-Host "   gcloud config set project $projectId" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Enable Google+ API:" -ForegroundColor White
Write-Host "   gcloud services enable plus.googleapis.com" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create OAuth consent screen:" -ForegroundColor White
Write-Host "   gcloud auth application-default login" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Create OAuth client (you'll need to do this via web console):" -ForegroundColor White
Write-Host "   Visit: https://console.cloud.google.com/apis/credentials" -ForegroundColor Gray
Write-Host "   Click 'Create Credentials' > 'OAuth 2.0 Client IDs'" -ForegroundColor Gray
Write-Host "   Application type: Web application" -ForegroundColor Gray
Write-Host "   Name: The Plant Store Web Client" -ForegroundColor Gray
Write-Host "   Authorized JavaScript origins:" -ForegroundColor Gray
Write-Host "     - https://theplantstore-bv6sa6ypx-george-mcintyres-projects.vercel.app" -ForegroundColor Gray
Write-Host "     - http://localhost:3000" -ForegroundColor Gray
Write-Host "   Authorized redirect URIs:" -ForegroundColor Gray
Write-Host "     - https://theplantstore-bv6sa6ypx-george-mcintyres-projects.vercel.app/api/auth/callback/google" -ForegroundColor Gray
Write-Host "     - http://localhost:3000/api/auth/callback/google" -ForegroundColor Gray
Write-Host ""
Write-Host "6. After creating the OAuth client, you'll get:" -ForegroundColor White
Write-Host "   - Client ID (looks like: 123456789-abcdefghijklmnop.apps.googleusercontent.com)" -ForegroundColor Gray
Write-Host "   - Client Secret (looks like: GOCSPX-abcdefghijklmnop)" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Add them to Vercel:" -ForegroundColor White
Write-Host "   vercel env add GOOGLE_CLIENT_ID production" -ForegroundColor Gray
Write-Host "   vercel env add GOOGLE_CLIENT_SECRET production" -ForegroundColor Gray
Write-Host ""
Write-Host "Project ID: $projectId" -ForegroundColor Green
Write-Host "Project Name: $projectName" -ForegroundColor Green