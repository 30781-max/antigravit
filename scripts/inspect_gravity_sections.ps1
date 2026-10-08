# inspect_gravity_sections.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

foreach ($lvl in $levels) {
    if ($lvl.gravityPortals -and $lvl.gravityPortals.Count -gt 0) {
        Write-Output "=== FASE $($lvl.id): $($lvl.name) ==="
        foreach ($gp in $lvl.gravityPortals) {
            Write-Output "  Portal em X=$($gp.x), targetGrav=$($gp.targetGravity)"
        }
        # Inverted spikes and ceiling platforms:
        $invSpikes = @($lvl.spikes | Where-Object { $_.inverted -eq $true })
        Write-Output "  Espinhos Invertidos (Teto): $($invSpikes.Count)"
        foreach ($is in $invSpikes) {
            Write-Output "    Spike Invertido X=$($is.x)"
        }
        $ceilPlats = @($lvl.platforms | Where-Object { $_.y -le 250 })
        Write-Output "  Plataformas no Teto (Y<=250): $($ceilPlats.Count)"
        foreach ($cp in $ceilPlats) {
            Write-Output "    Plat Teto X=$($cp.x), Y=$($cp.y), W=$($cp.w), H=$($cp.h)"
        }
    }
}
