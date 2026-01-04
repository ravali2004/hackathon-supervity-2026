# Environment Variables Validation Script
# Run this to check if your .env.local file is configured correctly

Write-Host "`n=== Environment Variables Validation ===" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env.local"
$errors = @()
$warnings = @()

if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "   Create it in the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env.local file found" -ForegroundColor Green

# Read the file
$envContent = Get-Content $envFile

# Check for required variables
$requiredVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "Supabase Project URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "Supabase Anon Key"
    "SUPABASE_SERVICE_ROLE_KEY" = "Supabase Service Role Key"
}

foreach ($var in $requiredVars.Keys) {
    $line = $null
    foreach ($l in $envContent) {
        if ($l -like "$var=*") {
            $line = $l
            break
        }
    }
    
    if (-not $line) {
        $errors += "Missing: $var ($($requiredVars[$var]))"
    } else {
        $value = $line.Substring($var.Length + 1).Trim()
        
        if ($value -like "*your_*" -or $value -eq "") {
            $errors += "Placeholder value found: $var - Replace with your actual $($requiredVars[$var])"
        } else {
            if ($var -eq "NEXT_PUBLIC_SUPABASE_URL") {
                if ($value -notlike "https://*.supabase.co*") {
                    $errors += "Invalid URL format for $var - Should be like: https://xxxxx.supabase.co"
                } else {
                    Write-Host "✓ $var is set and looks valid" -ForegroundColor Green
                }
            } else {
                Write-Host "✓ $var is set" -ForegroundColor Green
            }
        }
    }
}

# Check optional variables
$optionalVars = @{
    "GROQ_API_KEY" = "Groq API Key (optional but required for AI features)"
}

foreach ($var in $optionalVars.Keys) {
    $line = $null
    foreach ($l in $envContent) {
        if ($l -like "$var=*") {
            $line = $l
            break
        }
    }
    if (-not $line) {
        $warnings += "Optional: $var - $($optionalVars[$var])"
    } else {
        $value = $line.Substring($var.Length + 1).Trim()
        if ($value -like "*your_*" -or $value -eq "") {
            $warnings += "$var has placeholder value - Set it if you want AI report generation"
        }
    }
}

# Display results
Write-Host "`n=== Results ===" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n✅ All required environment variables are configured!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Found $($errors.Count) error(s):" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   • $error" -ForegroundColor Red
    }
    Write-Host "`n📝 How to fix:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "   2. Select your project → Settings → API" -ForegroundColor White
    Write-Host "   3. Copy your Project URL, anon key, and service_role key" -ForegroundColor White
    Write-Host "   4. Replace the placeholder values in .env.local" -ForegroundColor White
    Write-Host "   5. Restart your dev server (pnpm dev)" -ForegroundColor White
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  Warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
}

Write-Host ""

if ($errors.Count -gt 0) {
    exit 1
} else {
    exit 0
}
