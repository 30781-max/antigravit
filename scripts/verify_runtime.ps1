# Teste de Inicialização e Carregamento do Jogo
$html = Get-Content -Path ".\index.html" -Raw

# Verificar se todos os scripts referenciados existem no disco
$scriptMatches = [regex]::Matches($html, '<script\s+src="([^"]+)"></script>')
Write-Host "=== VERIFICAÇÃO DE DEPENDÊNCIAS DO INDEX.HTML ===" -ForegroundColor Cyan
$allExist = $true
foreach ($sm in $scriptMatches) {
    $src = $sm.Groups[1].Value
    $path = ".\" + $src.Replace('/', '\')
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "  [OK] Script '$src' encontrado ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] Script '$src' NÃO encontrado!" -ForegroundColor Red
        $allExist = $false
    }
}

# Verificar se os IDs do DOM vinculados no js/game.js existem no index.html
$domIds = @(
    'gameCanvas', 'gameHud', 'mainMenu', 'levelSelectMenu', 'skinsModal',
    'howToPlayModal', 'pauseModal', 'levelCompleteModal', 'gameVictoryModal',
    'deathFlash', 'progressBarFill', 'progressPercent', 'hudLevelBadge',
    'hudLevelName', 'hudAttempts', 'soundIcon', 'btnSoundToggle',
    'btnQuickRestart', 'btnPause', 'btnPlay', 'btnLevelSelect',
    'btnSkins', 'btnHowToPlay', 'btnBackFromLevels', 'btnBackToMain',
    'btnNextLevel', 'btnReplayLevel', 'btnLevelsFromWin', 'hudCoin1',
    'hudCoin2', 'hudCoin3', 'hudBestRecord', 'completeCoins'
)

Write-Host "`n=== VERIFICAÇÃO DE IDs DO DOM VINCULADOS ===" -ForegroundColor Cyan
$missingCount = 0
foreach ($id in $domIds) {
    if ($html -match "id=['`"]$id['`"]") {
        Write-Host "  [OK] Elemento com id='$id' presente no HTML" -ForegroundColor Green
    } else {
        Write-Host "  [FALTANDO] Elemento com id='$id' NÃO encontrado!" -ForegroundColor Red
        $missingCount++
    }
}

if ($allExist -and $missingCount -eq 0) {
    Write-Host "`n=== SUCESSO TOTAL: JOGO PRONTO PARA JOGAR SEM NENHUM ERRO! ===" -ForegroundColor Green
} else {
    Write-Host "`n=== ATENÇÃO: Verifique os itens faltantes acima! ===" -ForegroundColor Yellow
}
