# test_parse.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

Write-Output "Parsed successfully! Level count: $($levels.Count)"
foreach ($l in $levels) {
    Write-Output "Level $($l.id): $($l.name) (Speed: $($l.speed))"
}
