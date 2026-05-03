param(
    [Parameter(Mandatory=$true)]
    [string]$NewVersionPath
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$newApi = Join-Path $NewVersionPath "api"
if (-not (Test-Path $newApi)) {
    Write-Host "ERROR: $newApi not found" -ForegroundColor Red
    Write-Host "Usage: .\update.ps1 -NewVersionPath D:\path\to\new\publish" -ForegroundColor Yellow
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JAV Movie Manager v2 - Update Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will replace all program files while keeping your data." -ForegroundColor Yellow
Write-Host "Database and logs in api\Data\ and api\Logs\ will NOT be touched." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'yes' to continue"
if ($confirm -ne "yes") {
    Write-Host "Update cancelled." -ForegroundColor Gray
    exit 0
}

$preserveFolders = @("Data", "Logs")
$currentApi = Join-Path $root "api"

Write-Host "[1/3] Preserving data..." -ForegroundColor Yellow
$backupDir = Join-Path $env:TEMP "jav-manager-backup"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
foreach ($folder in $preserveFolders) {
    $src = Join-Path $currentApi $folder
    if (Test-Path $src) {
        Copy-Item -Recurse -Force $src "$backupDir\$folder"
        Write-Host "  Saved $folder" -ForegroundColor Green
    }
}

Write-Host "[2/3] Replacing program files..." -ForegroundColor Yellow
Get-ChildItem $root -Exclude "update.ps1" | Remove-Item -Recurse -Force
Copy-Item -Recurse -Force "$NewVersionPath\*" $root

Write-Host "[3/3] Restoring data..." -ForegroundColor Yellow
foreach ($folder in $preserveFolders) {
    $src = Join-Path $backupDir $folder
    $dest = Join-Path $currentApi $folder
    if (Test-Path $src) {
        if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
        Copy-Item -Recurse -Force $src $dest
        Write-Host "  Restored $folder" -ForegroundColor Green
    }
}
Remove-Item -Recurse -Force $backupDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Update Complete!" -ForegroundColor Green
Write-Host "  Your data has been preserved." -ForegroundColor Green
Write-Host "  Run jav-manager-tray.exe to start." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
