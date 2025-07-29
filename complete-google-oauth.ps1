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
