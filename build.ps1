param(
    [string]$Configuration = "Release",
    [string]$OutputDir = "publish"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JAV Movie Manager v2 - Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$publishDir = Join-Path $root $OutputDir
$apiPublishDir = Join-Path $publishDir "api"

function Clear-Directory {
    param([string]$Path)
    if (Test-Path $Path) {
        Remove-Item -Recurse -Force $Path
    }
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

Write-Host "[1/3] Building frontend..." -ForegroundColor Yellow
$webDir = Join-Path $root "jav-manager-web"
Push-Location $webDir
try {
    npm install --no-audit --no-fund
    npm run build
    Write-Host "  Frontend built successfully." -ForegroundColor Green
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "[2/3] Publishing API..." -ForegroundColor Yellow
$apiDir = Join-Path $root "jav-manager-api"
Push-Location $apiDir
try {
    Clear-Directory $apiPublishDir
    dotnet publish -c $Configuration -o $apiPublishDir --self-contained true
    Write-Host "  API published to $apiPublishDir" -ForegroundColor Green
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "[3/3] Publishing TrayApp..." -ForegroundColor Yellow
$trayDir = Join-Path $root "jav-manager-tray"
Push-Location $trayDir
try {
    dotnet publish -c $Configuration -o $publishDir --self-contained true
    Write-Host "  TrayApp published to $publishDir" -ForegroundColor Green
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "  Output: $publishDir" -ForegroundColor Cyan
Write-Host "  Run:   jav-manager-tray.exe" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
