$content = Get-Content -Path ".\js\levels.js" -Raw
# Encontrar o índice onde começa o array JSON '['
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')

if ($firstBracket -ge 0 -and $lastBracket -gt $firstBracket) {
    $json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
    $levels = ConvertFrom-Json $json
    Write-Host "Sucesso ao carregar JSON! Total de fases: $($levels.Count)" -ForegroundColor Green
    foreach ($lvl in $levels) {
        Write-Host "Fase $($lvl.id): $($lvl.name) - Velocidade: $($lvl.speed) px/s, Fim: $($lvl.finishX) px"
        Write-Host "  -> Espinhos: $($lvl.spikes.Count), Plataformas: $($lvl.platforms.Count), Abismos: $($lvl.pits.Count), Serras: $($lvl.sawblades.Count), Movéis: $($lvl.movingHazards.Count), Orbes: $($lvl.jumpOrbs.Count), Trampolins: $($lvl.jumpPads.Count)"
    }
} else {
    Write-Host "Falha ao encontrar colchetes JSON no arquivo." -ForegroundColor Red
}
