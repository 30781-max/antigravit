# fix_l4_spike.ps1
$filePath = ".\js\levels.js"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText((Resolve-Path $filePath), [System.Text.Encoding]::UTF8)

$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$header = $content.Substring(0, $firstBracket)
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$lvl4 = $levels | Where-Object { $_.id -eq 4 }
$sp8750 = $lvl4.spikes | Where-Object { $_.x -eq 8750 }
if ($sp8750) {
    $sp8750.x = 8880
    Write-Output "Spike 8750 em Fase 4 movido para 8880 com sucesso!"
} else {
    Write-Output "Spike 8750 nao encontrado."
}

$jsonOut = $levels | ConvertTo-Json -Depth 12
$finalText = $header + $jsonOut + ";`n"
[System.IO.File]::WriteAllText((Resolve-Path $filePath), $finalText, $utf8NoBom)
