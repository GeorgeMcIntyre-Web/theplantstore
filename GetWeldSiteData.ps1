# Complete Code Export for The Plant Store
$outputFile = "complete-app-export.txt"

@"
================================================================================
🌱 THE PLANT STORE - COMPLETE CODE EXPORT FOR DEPLOYMENT
================================================================================
Generated: $(Get-Date)

================================================================================
📦 PACKAGE.JSON
================================================================================
$(if (Test-Path "package.json") { Get-Content "package.json" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
⚙️ NEXT.CONFIG.JS
================================================================================
$(if (Test-Path "next.config.js") { Get-Content "next.config.js" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
🗄️ PRISMA SCHEMA
================================================================================
$(if (Test-Path "prisma\schema.prisma") { Get-Content "prisma\schema.prisma" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
🔗 DATABASE CONNECTION (lib/db.ts)
================================================================================
$(if (Test-Path "lib\db.ts") { Get-Content "lib\db.ts" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
📱 APP LAYOUT (app/layout.tsx)
================================================================================
$(if (Test-Path "app\layout.tsx") { Get-Content "app\layout.tsx" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
🏠 HOME PAGE (app/page.tsx)
================================================================================
$(if (Test-Path "app\page.tsx") { Get-Content "app\page.tsx" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
🌍 ENVIRONMENT VARIABLES (.env)
================================================================================
$(if (Test-Path ".env") { 
    "# Showing structure only (sensitive data hidden)"
    Get-Content ".env" | ForEach-Object { 
        if ($_ -match "^([^=]+)=") { 
            "$($matches[1])=***HIDDEN***" 
        } else { 
            $_ 
        }
    }
} else { "❌ FILE NOT FOUND" })

================================================================================
⚡ TYPESCRIPT CONFIG (tsconfig.json)
================================================================================
$(if (Test-Path "tsconfig.json") { Get-Content "tsconfig.json" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
🎨 TAILWIND CONFIG (tailwind.config.ts)
================================================================================
$(if (Test-Path "tailwind.config.ts") { Get-Content "tailwind.config.ts" -Raw } else { "❌ FILE NOT FOUND" })

================================================================================
🔌 API ROUTES
================================================================================
"@ | Out-File -FilePath $outputFile -Encoding UTF8

# Add API routes
if (Test-Path "app\api") {
    Get-ChildItem "app\api" -Recurse -Filter "route.ts" | ForEach-Object {
        $relativePath = $_.FullName.Replace((Get-Location).Path, "").Replace("\", "/")
        Add-Content -Path $outputFile -Value @"

--- API ROUTE: $relativePath ---
$(Get-Content $_.FullName -Raw)

"@
    }
}

# Add final section
Add-Content -Path $outputFile -Value @"

================================================================================
📁 PROJECT STRUCTURE
================================================================================
$(Get-ChildItem -Recurse -File | Where-Object { 
    $_.Extension -in @('.ts', '.tsx', '.js', '.jsx', '.json') -and 
    $_.FullName -notmatch 'node_modules|\.next|\.git' 
} | Select-Object @{Name='File'; Expression={$_.FullName.Replace((Get-Location).Path, "").Replace("\", "/")}} | 
Format-Table -AutoSize | Out-String)

================================================================================
🚀 DEPLOYMENT SUMMARY
================================================================================
- Project Type: Next.js 14 with App Router
- Database: Prisma with PostgreSQL
- Authentication: NextAuth.js
- API Routes: $(if (Test-Path "app\api") { (Get-ChildItem "app\api" -Recurse -Filter "route.ts").Count } else { 0 })
- Ready for DigitalOcean App Platform: $(if ((Test-Path "package.json") -and (Test-Path "next.config.js") -and (Test-Path "prisma\schema.prisma")) { "✅ YES" } else { "❌ NO" })

================================================================================
END OF EXPORT
================================================================================
"@

Write-Host "✅ Complete code export saved to: $outputFile"
Write-Host "📄 File size: $((Get-Item $outputFile).Length / 1KB) KB"
Write-Host ""
Write-Host "This file contains:"
Write-Host "  - All configuration files"
Write-Host "  - Database schema"
Write-Host "  - API routes"
Write-Host "  - Environment structure"
Write-Host "  - Project layout"