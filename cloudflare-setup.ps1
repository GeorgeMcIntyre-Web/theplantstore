Write-Host "🌿 Cloudflare Setup Guide for Your Plant Store" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Your store is already LIVE at: https://plantstore-bm5.pages.dev" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Next Steps in Cloudflare Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. CUSTOM DOMAIN SETUP:" -ForegroundColor Cyan
Write-Host "   • Go to 'Custom domains' tab" -ForegroundColor White
Write-Host "   • Click 'Set up a custom domain'" -ForegroundColor White
Write-Host "   • Add: thehouseplantstore.com" -ForegroundColor White
Write-Host "   • Add: www.thehouseplantstore.com" -ForegroundColor White
Write-Host ""

Write-Host "2. DNS CONFIGURATION:" -ForegroundColor Cyan
Write-Host "   • Go to your domain's DNS settings" -ForegroundColor White
Write-Host "   • Add A record: @ → 192.0.2.1" -ForegroundColor White
Write-Host "   • Add CNAME record: www → plantstore-bm5.pages.dev" -ForegroundColor White
Write-Host ""

Write-Host "3. DATABASE SETUP:" -ForegroundColor Cyan
Write-Host "   • Go to 'Storage & Databases' → 'D1'" -ForegroundColor White
Write-Host "   • Create new database: houseplantstore-db" -ForegroundColor White
Write-Host "   • Copy the database ID" -ForegroundColor White
Write-Host ""

Write-Host "4. R2 STORAGE SETUP:" -ForegroundColor Cyan
Write-Host "   • Go to 'Storage & Databases' → 'R2'" -ForegroundColor White
Write-Host "   • Create bucket: houseplantstore-images" -ForegroundColor White
Write-Host ""

Write-Host "5. ENVIRONMENT VARIABLES:" -ForegroundColor Cyan
Write-Host "   • Go to 'Settings' tab" -ForegroundColor White
Write-Host "   • Add environment variables" -ForegroundColor White
Write-Host ""

Write-Host "🎉 After completing these steps, your store will be fully configured!" -ForegroundColor Green 