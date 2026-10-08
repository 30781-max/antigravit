# check_spike_saw_overlaps.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

foreach ($lvl in $levels) {
    if ($lvl.sawblades -and $lvl.spikes) {
        foreach ($saw in $lvl.sawblades) {
            $r = if ($saw.radius) { $saw.radius } else { 24 }
            $sawL = $saw.x - $r
            $sawR = $saw.x + $r
            foreach ($sp in $lvl.spikes) {
                $spL = $sp.x
                $spR = $sp.x + (if ($sp.w) { $sp.w } else { 36 })
                if ($sawR -ge $spL -and $sawL -le $spR) {
                    Write-Output "L$($lvl.id): SAW [X=$($saw.x), Y=$($saw.y)] OVERLAPS SPIKE [X=$($sp.x), Inv=$($sp.inverted)]!"
                }
            }
        }
    }
}
