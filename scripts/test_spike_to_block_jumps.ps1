# ==============================================================================
# CYBER PULSE — scripts/test_spike_to_block_jumps.ps1
# Valida se os saltos de combo (Espinho -> Bloco Sólido) são 100% possíveis
# ==============================================================================

$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$GRAVITY = 2150.0
$JUMP_FORCE = 690.0
$PLAYER_SIZE = 38.0
$GROUND_Y = 570.0
$CEILING_Y = 150.0

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "         TESTE ESPECÍFICO DOS COMBOS: PULO SOBRE ESPINHO PARA DENTRO DO BLOCO    " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$combos = @(
    @{ lvlId = 3; spX = 5350; spW = 36; inv = $true; blkX = 5500; blkY = 150; blkW = 240; blkH = 35; speed = 500 },
    @{ lvlId = 4; spX = 6200; spW = 72; inv = $true; blkX = 6350; blkY = 150; blkW = 240; blkH = 35; speed = 560 },
    @{ lvlId = 6; spX = 5700; spW = 72; inv = $true; blkX = 5900; blkY = 150; blkW = 260; blkH = 35; speed = 680 },
    @{ lvlId = 8; spX = 7200; spW = 72; inv = $true; blkX = 7400; blkY = 150; blkW = 260; blkH = 35; speed = 800 },
    @{ lvlId = 9; spX = 7700; spW = 72; inv = $true; blkX = 7900; blkY = 150; blkW = 280; blkH = 35; speed = 860 },
    @{ lvlId = 10; spX = 8600; spW = 72; inv = $true; blkX = 8800; blkY = 150; blkW = 300; blkH = 35; speed = 920 }
)

foreach ($c in $combos) {
    $lvlId = $c.lvlId
    $speed = [double]$c.speed
    $spX = [double]$c.spX
    $spW = [double]$c.spW
    $blkX = [double]$c.blkX
    $blkW = [double]$c.blkW
    $blkH = [double]$c.blkH

    # Testar janela de pulo: pular entre (spX - 80) e (spX - 20)
    $successCount = 0
    $totalAttempts = 0

    for ($takeoffDist = 20; $takeoffDist -le 80; $takeoffDist += 5) {
        $totalAttempts++
        $takeoffX = $spX - $takeoffDist
        # Gravidade invertida: o jogador pula para BAIXO (vy = +JUMP_FORCE) ou para CIMA?
        # No jogo, quando gravidade é invertida, o teto é em Y = 150.
        # O bloco está no teto: Y = 150, H = 35.
        # Espera! Se o bloco está em Y = 150, ele é uma barreira descendo até 185!
        # Para passar por um bloco no teto, o jogador no teto pula para BAIXO para desviar por baixo dele!
        # OU o jogador pula por cima? Não há nada acima de Y = 150!
    }

    Write-Host ("Fase " + $lvlId + " | Combo em X=" + $spX + " -> Bloco X=" + $blkX + " (Speed: " + $speed + " px/s)") -ForegroundColor Yellow
}
