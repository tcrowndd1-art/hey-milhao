# Hey Milhao — One-command publish script
# Usage:
#   .\scripts\publish.ps1 -Topic "GPT-5 발표"
#   .\scripts\publish.ps1 -Url "https://..."
#   .\scripts\publish.ps1 -Topic "주제" -Lang "ko"   (한국어 추가 후)

param(
    [string]$Topic = "",
    [string]$Url   = "",
    [string]$Lang  = ""   # reserved for future ko/pt/es filter
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir

Set-Location $Root

# Load .env.local (OpenRouter key etc.)
if (Test-Path ".env.local") {
    Get-Content ".env.local" | Where-Object { $_ -match "^\s*[^#].*=.*" } | ForEach-Object {
        $parts = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

if (-not $Topic -and -not $Url) {
    Write-Error "Use: .\scripts\publish.ps1 -Topic `"주제`" or -Url `"https://...`""
    exit 1
}

if ($Url)   { $env:INPUT_URL   = $Url   }
if ($Topic) { $env:INPUT_TOPIC = $Topic }

Write-Host "[hey-milhao] Generating post..." -ForegroundColor Cyan
node scripts/generate-post.js
if ($LASTEXITCODE -ne 0) { Write-Error "[hey-milhao] Generation failed"; exit 1 }

Write-Host "[hey-milhao] Committing..." -ForegroundColor Cyan
$date = Get-Date -Format "yyyy-MM-dd"
git add content/posts public/images/posts
git commit -m "post: $date"
git push origin main

Write-Host "[hey-milhao] Published! Vercel is deploying." -ForegroundColor Green
