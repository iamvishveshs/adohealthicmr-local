# Disk Space Cleanup Script
# Run: powershell -ExecutionPolicy Bypass -File free-disk-space.ps1

Write-Host ""
Write-Host "Disk Space Cleanup Tool" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

# Check disk space
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
$usedGB = [math]::Round($drive.Used / 1GB, 2)

Write-Host "Current Disk Space:" -ForegroundColor Yellow
Write-Host "   Free: $freeGB GB" -ForegroundColor $(if ($freeGB -lt 1) { "Red" } else { "Green" })
Write-Host "   Used: $usedGB GB" -ForegroundColor Yellow

if ($freeGB -lt 1) {
    Write-Host ""
    Write-Host "WARNING: Less than 1GB free space!" -ForegroundColor Red
    Write-Host "   You need to free up space before continuing." -ForegroundColor Yellow
    Write-Host ""
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "   npm cache cleaned" -ForegroundColor Green
} catch {
    Write-Host "   npm cache cleanup failed (may need admin)" -ForegroundColor Yellow
}

# Clean temp files older than 7 days
Write-Host ""
Write-Host "Cleaning temporary files..." -ForegroundColor Cyan
$tempPath = $env:TEMP
$cutoffDate = (Get-Date).AddDays(-7)

try {
    $tempFiles = Get-ChildItem $tempPath -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    if ($tempFiles.Count -gt 0) {
        $tempSize = ($tempFiles | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   Found $($tempFiles.Count) old temp files (~$([math]::Round($tempSize, 2)) MB)" -ForegroundColor Gray
        $tempFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "   Temporary files cleaned" -ForegroundColor Green
    } else {
        Write-Host "   No old temp files found" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Could not clean temp files" -ForegroundColor Yellow
}

# Clean npm cache directory
Write-Host ""
Write-Host "Cleaning npm cache directory..." -ForegroundColor Cyan
$npmCachePath = "$env:LOCALAPPDATA\npm-cache"
if (Test-Path $npmCachePath) {
    try {
        $cacheFiles = Get-ChildItem $npmCachePath -Recurse -ErrorAction SilentlyContinue
        if ($cacheFiles.Count -gt 0) {
            $npmCacheSize = ($cacheFiles | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "   npm cache size: ~$([math]::Round($npmCacheSize, 2)) MB" -ForegroundColor Gray
            Remove-Item "$npmCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   npm cache directory cleaned" -ForegroundColor Green
        }
    } catch {
        Write-Host "   Could not clean npm cache directory" -ForegroundColor Yellow
    }
}

# Check node_modules size
Write-Host ""
Write-Host "Checking node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    try {
        $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   node_modules size: ~$([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Gray
        Write-Host "   Tip: Delete node_modules and run npm install again to reduce size" -ForegroundColor Yellow
    } catch {
        Write-Host "   Could not check node_modules size" -ForegroundColor Yellow
    }
}

# Final disk space check
$driveAfter = Get-PSDrive C
$freeGBAfter = [math]::Round($driveAfter.Free / 1GB, 2)
$freedGB = $freeGBAfter - $freeGB

Write-Host ""
Write-Host "Disk Space After Cleanup:" -ForegroundColor Yellow
Write-Host "   Free: $freeGBAfter GB" -ForegroundColor Green
if ($freedGB -gt 0) {
    Write-Host "   Freed: $freedGB GB" -ForegroundColor Green
}

Write-Host ""
Write-Host "Additional Tips:" -ForegroundColor Cyan
Write-Host "   1. Empty Recycle Bin" -ForegroundColor White
Write-Host "   2. Run Windows Disk Cleanup (cleanmgr)" -ForegroundColor White
Write-Host "   3. Delete old downloads" -ForegroundColor White
Write-Host "   4. Uninstall unused programs" -ForegroundColor White
Write-Host "   5. Move files to external drive" -ForegroundColor White

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
