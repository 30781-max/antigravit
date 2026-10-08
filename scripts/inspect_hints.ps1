# inspect_hints.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

foreach ($lvl in $levels) {
    if ($lvl.hints) {
        foreach ($h in $lvl.hints) {
            Write-Output "L$($lvl.id) [X=$($h.x)]: $($h.text)"
        }
    }
}
