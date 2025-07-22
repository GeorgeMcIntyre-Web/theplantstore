# PowerShell script to help set up GitHub repository
Write-Host "🌿 Setting up GitHub repository for your plant store..." -ForegroundColor Green

Write-Host ""
Write-Host "📋 Follow these steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Repository name: theplantstore" -ForegroundColor Cyan
Write-Host "3. Description: Plant store built with Next.js and Cloudflare" -ForegroundColor Cyan
Write-Host "4. Make it PUBLIC" -ForegroundColor Cyan
Write-Host "5. DON'T initialize with README (you already have files)" -ForegroundColor Cyan
Write-Host "6. Click 'Create repository'" -ForegroundColor Cyan

Write-Host ""
Write-Host "⏳ After creating the repository, press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🚀 Pushing your code to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host ""
Write-Host "✅ Done! Your plant store is now:" -ForegroundColor Green
Write-Host "   🌐 Live at: https://plantstore-bm5.pages.dev" -ForegroundColor Cyan
Write-Host "   📦 Code at: https://github.com/GeorgeMcIntyre-Web/theplantstore" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test your store at the live URL" -ForegroundColor White
Write-Host "   2. Add custom domain in Cloudflare Pages dashboard" -ForegroundColor White
Write-Host "   3. Set up D1 database and R2 storage" -ForegroundColor White 