# test_convert_json.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$output = "const LEVELS = " + ($levels | ConvertTo-Json -Depth 10) + ";"
$testPath = "scripts/test_levels_out.js"
Set-Content -Path $testPath -Value $output -Encoding UTF8
Write-Output "Written to test_levels_out.js! Size: $((Get-Item $testPath).Length)"
