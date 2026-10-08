# analyze_levels_status.ps1
$content = Get-Content 'js/levels.js' -Raw
$jsonStr = $content -replace '^\s*const\s+LEVELS\s*=\s*', '' -replace ';\s*$', ''
$levels = $jsonStr | ConvertFrom-Json

Write-Output "=== STATUS DOS NIVEIS EM LEVELS.JS ==="
foreach ($lvl in $levels) {
    $cCount = if ($lvl.secretCoins) { $lvl.secretCoins.Count } else { 0 }
    $spCount = if ($lvl.speedPortals) { $lvl.speedPortals.Count } else { 0 }
    $gpCount = if ($lvl.gravityPortals) { $lvl.gravityPortals.Count } else { 0 }
    $obsCount = if ($lvl.obstacles) { $lvl.obstacles.Count } else { 0 }
    $platCount = if ($lvl.platforms) { $lvl.platforms.Count } else { 0 }
    Write-Output "Fase $($lvl.id) ($($lvl.name)) | Vel: $($lvl.speed) | Obs: $obsCount | Plat: $platCount | Coins: $cCount | SpeedPortals: $spCount | GravPortals: $gpCount"
}

Write-Output "`n=== VERIFICACAO DE HINTS COM COIN/MOEDA ==="
foreach ($lvl in $levels) {
    if ($lvl.hints) {
        foreach ($h in $lvl.hints) {
            if ($h.text -match "moeda|coin") {
                Write-Output "Fase $($lvl.id) hint em X=$($h.x): $($h.text)"
            }
        }
    }
}
