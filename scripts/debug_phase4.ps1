$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$lvl4 = $levels[3]
Write-Host "Obstaculos de Fase 4:"
$items = @()
foreach ($s in $lvl4.spikes) { $items += [PSCustomObject]@{ type = "Spike"; x = [double]$s.x; endX = [double]$s.x + 36 } }
foreach ($p in $lvl4.platforms) { $items += [PSCustomObject]@{ type = "Plat"; x = [double]$p.x; endX = [double]$p.x + [double]$p.w } }
foreach ($w in $lvl4.sawblades) { $items += [PSCustomObject]@{ type = "Saw"; x = [double]$w.x - 24; endX = [double]$w.x + 24 } }
foreach ($pt in $lvl4.pits) { $items += [PSCustomObject]@{ type = "Pit"; x = [double]$pt.startX; endX = [double]$pt.endX } }

$sorted = @($items | Sort-Object x)
for ($i = 0; $i -lt ($sorted.Count - 1); $i++) {
    $c = $sorted[$i]
    $n = $sorted[$i + 1]
    $gap = $n.x - $c.endX
    if ($gap -lt 0) {
        Write-Host ("Overlap: " + $c.type + " [" + $c.x + ".." + $c.endX + "] -> " + $n.type + " [" + $n.x + ".." + $n.endX + "] gap=" + $gap) -ForegroundColor Red
    }
}
