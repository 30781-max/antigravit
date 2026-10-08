# inspect_level_details.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

function Check-Level($lvl) {
    Write-Output "=========================================="
    Write-Output "FASE $($lvl.id): $($lvl.name)"
    Write-Output "Platforms:"
    foreach ($p in $lvl.platforms) {
        Write-Output "  Plat [X=$($p.x)..$(($p.x + $p.w)), Y=$($p.y), W=$($p.w), H=$($p.h)]"
    }
    Write-Output "Spikes:"
    $sortedSpikes = $lvl.spikes | Sort-Object x
    foreach ($s in $sortedSpikes) {
        Write-Output "  Spike [X=$($s.x), W=$($s.w), H=$($s.h), Inv=$($s.inverted)]"
    }
    Write-Output "Saws:"
    if ($lvl.saws) {
        foreach ($s in $lvl.saws) {
            Write-Output "  Saw [X=$($s.x), Y=$($s.y), R=$($s.radius)]"
        }
    }
    Write-Output "Pads & Orbs:"
    if ($lvl.jumpPads) {
        foreach ($jp in $lvl.jumpPads) {
            Write-Output "  Pad [X=$($jp.x), Y=$($jp.y)]"
        }
    }
    if ($lvl.jumpOrbs) {
        foreach ($jo in $lvl.jumpOrbs) {
            Write-Output "  Orb [X=$($jo.x), Y=$($jo.y)]"
        }
    }
    if ($lvl.gravityPortals) {
        foreach ($gp in $lvl.gravityPortals) {
            Write-Output "  GravPortal [X=$($gp.x), targetGrav=$($gp.targetGravity)]"
        }
    }
}

foreach ($l in $levels) {
    Check-Level $l
}
