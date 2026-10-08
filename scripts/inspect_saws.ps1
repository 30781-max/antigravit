# inspect_saws.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

Write-Output "=== AUDITORIA DE SERRAS CIRCULARES (SAWS) ==="
foreach ($lvl in $levels) {
    if ($lvl.sawblades) {
        Write-Output "`nFase $($lvl.id): $($lvl.name)"
        foreach ($saw in $lvl.sawblades) {
            $r = if ($saw.radius) { $saw.radius } else { 24 }
            $left = $saw.x - $r
            $right = $saw.x + $r
            Write-Output "  Saw [X=$($saw.x), Y=$($saw.y), R=$r, Span=$left..$right]"
            
            # Check overlap with any platform
            if ($lvl.platforms) {
                foreach ($p in $lvl.platforms) {
                    $pLeft = $p.x
                    $pRight = $p.x + $p.w
                    $pTop = $p.y
                    $pBottom = $p.y + $p.h
                    if ($right -ge $pLeft -and $left -le $pRight) {
                        Write-Output "    -> AVISO: Saw proxima/sobreposta com Plataforma [X=$pLeft..$pRight, Y=$pTop..$pBottom]"
                    }
                }
            }
        }
    }
}
