# Add Placeholder Environment Variables for The Plant Store
# This script adds placeholder values for all missing environment variables

Write-Host "Adding placeholder environment variables to Vercel..." -ForegroundColor Green

# List of environment variables to add with placeholder values
$envVars = @{
    "YOCO_SECRET_KEY" = "sk_test_placeholder_yoco_secret_key"
    "YOCO_PUBLIC_KEY" = "pk_test_placeholder_yoco_public_key"
    "COURIER_GUY_API_KEY" = "placeholder_courier_guy_api_key"
    "ARAMEX_API_KEY" = "placeholder_aramex_api_key"
    "POSTNET_API_KEY" = "placeholder_postnet_api_key"
    "SENDGRID_API_KEY" = "SG.placeholder_sendgrid_api_key"
    "PAYSTACK_SECRET_KEY" = "sk_test_placeholder_paystack_secret_key"
    "EMAIL_SERVER_HOST" = "smtp.gmail.com"
    "EMAIL_SERVER_PORT" = "587"
    "EMAIL_SERVER_USER" = "placeholder_email_user@gmail.com"
    "EMAIL_SERVER_PASSWORD" = "placeholder_email_password"
    "EMAIL_FROM" = "noreply@theplantstore.com"
}

Write-Host "The following environment variables will be added with placeholder values:" -ForegroundColor Yellow
$envVars.GetEnumerator() | ForEach-Object {
    Write-Host "  $($_.Key) = $($_.Value)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Please run these commands manually in your terminal:" -ForegroundColor Cyan
Write-Host ""

foreach ($envVar in $envVars.GetEnumerator()) {
    Write-Host "vercel env add $($envVar.Key) production" -ForegroundColor White
    Write-Host "  Value: $($envVar.Value)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "After adding all environment variables, deploy with:" -ForegroundColor Green
Write-Host "vercel --prod" -ForegroundColor White

Write-Host ""
Write-Host "Note: These are placeholder values. Replace them with real values when you have:" -ForegroundColor Yellow
Write-Host "1. Yoco account and API keys" -ForegroundColor Gray
Write-Host "2. Shipping provider API keys" -ForegroundColor Gray
Write-Host "3. Email service credentials" -ForegroundColor Gray
Write-Host "4. Paystack account (if using)" -ForegroundColor Gray