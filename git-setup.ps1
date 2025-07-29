# Git Setup Script for The House Plant Store
# This script configures Git for the GeorgeMcIntyre-Web/theplantstore repository

Write-Host "🌿 Setting up Git configuration for The House Plant Store..." -ForegroundColor Green

# Set up remote origin
Write-Host "📡 Configuring remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/GeorgeMcIntyre-Web/theplantstore.git

# Set up branch tracking
Write-Host "🌿 Setting up branch tracking..." -ForegroundColor Yellow
git branch --set-upstream-to=origin/main main

# Configure local Git settings
Write-Host "⚙️  Configuring local Git settings..." -ForegroundColor Yellow
git config --local user.name "George McIntyre"
git config --local user.email "george@thehouseplantstore.com"
git config --local push.default simple
git config --local pull.rebase false

# Verify configuration
Write-Host "✅ Verifying configuration..." -ForegroundColor Yellow
Write-Host "Remote origin:" -ForegroundColor Cyan
git remote -v

Write-Host "`nBranch tracking:" -ForegroundColor Cyan
git branch -vv

Write-Host "`nLocal user config:" -ForegroundColor Cyan
Write-Host "Name: $(git config --local user.name)"
Write-Host "Email: $(git config --local user.email)"

Write-Host "`n🎉 Git configuration complete!" -ForegroundColor Green
Write-Host "You can now use simple commands like:" -ForegroundColor Cyan
Write-Host "  git push    (pushes to origin/main)" -ForegroundColor White
Write-Host "  git pull    (pulls from origin/main)" -ForegroundColor White
Write-Host "  git status  (shows current status)" -ForegroundColor White