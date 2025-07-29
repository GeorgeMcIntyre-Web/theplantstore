# Google Cloud Console Setup Guide

## Step 1: Run the gcloud script
1. Open a new terminal where gcloud is available
2. Run: .\setup-gcloud.ps1

## Step 2: Create OAuth Credentials via Web Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Make sure you're in the project: theplantstore-app-5015
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
