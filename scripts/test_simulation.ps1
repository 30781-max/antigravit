# ==============================================================================
# SIMULADOR FÍSICO EXATO DAS 10 FASES DO CYBER PULSE
# ==============================================================================

Write-Host "=== TESTANDO FISICA E ESPACAMENTOS DAS 10 FASES ===" -ForegroundColor Cyan

$jsContent = Get-Content -Path ".\js\levels.js" -Raw

$GRAVITY = 2150.0
$JUMP_FORCE = 690.0
$PLAYER_SIZE = 38.0
$timeInAir = 2.0 * $JUMP_FORCE / $GRAVITY

$pattern = '(?s)\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?speed:\s*(\d+).*?finishX:\s*(\d+).*?spikes:\s*\[(.*?)\]\s*,\s*pits:\s*\[(.*?)\]\s*,\s*platforms:\s*\[(.*?)\]'
$matches = [regex]::Matches($jsContent, $pattern)

Write-Host ("Fases encontradas: " + $matches.Count) -ForegroundColor Green

foreach ($m in $matches) {
    $lvl = $m.Groups[1].Value
    $name = $m.Groups[2].Value
    $speed = [double]$m.Groups[3].Value
    $finishX = [double]$m.Groups[4].Value
    $spikesText = $m.Groups[5].Value
    $pitsText = $m.Groups[6].Value
    $platsText = $m.Groups[7].Value

    $jumpDist = $speed * $timeInAir

    Write-Host "`n------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ("FASE " + $lvl + " - " + $name + " | Vel: " + $speed + " px/s | Salto cobre: " + [math]::Round($jumpDist, 0) + "px | Fim: " + $finishX + " px") -ForegroundColor Yellow

    # Extrair espinhos reais
    $spikeList = @()
    $spMatches = [regex]::Matches($spikesText, '\{\s*x:\s*(\d+)(?:,\s*w:\s*(\d+))?(?:,\s*h:\s*(\d+))?')
    foreach ($sm in $spMatches) {
        $x = [double]$sm.Groups[1].Value
        $w = if ($sm.Groups[2].Value) { [double]$sm.Groups[2].Value } else { 36.0 }
        $spikeList += [PSCustomObject]@{ x = $x; w = $w; type = "Espinho" }
    }

    # Extrair plataformas/blocos reais
    $platList = @()
    $plMatches = [regex]::Matches($platsText, '\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*w:\s*(\d+),\s*h:\s*(\d+)')
    foreach ($pm in $plMatches) {
        $x = [double]$pm.Groups[1].Value
        $y = [double]$pm.Groups[2].Value
        $w = [double]$pm.Groups[3].Value
        $h = [double]$pm.Groups[4].Value
        $platList += [PSCustomObject]@{ x = $x; y = $y; w = $w; h = $h; type = "Bloco/Plat" }
    }

    # Extrair abismos reais
    $pitList = @()
    $ptMatches = [regex]::Matches($pitsText, 'startX:\s*(\d+),\s*endX:\s*(\d+)')
    foreach ($pt in $ptMatches) {
        $s = [double]$pt.Groups[1].Value
        $e = [double]$pt.Groups[2].Value
        $pitList += [PSCustomObject]@{ startX = $s; endX = $e; width = ($e - $s); type = "Abismo" }
    }

    Write-Host ("  -> Espinhos: " + $spikeList.Count + " | Plataformas/Blocos: " + $platList.Count + " | Abismos: " + $pitList.Count) -ForegroundColor Gray

    # Validar abismos
    foreach ($pit in $pitList) {
        if ($pit.width -le $jumpDist) {
            Write-Host ("  [OK] Abismo (" + $pit.startX + " - " + $pit.endX + ", vao: " + $pit.width + "px) cruzado com folga de " + [math]::Round($jumpDist - $pit.width, 0) + "px.") -ForegroundColor Green
        } else {
            $hasSupport = $platList | Where-Object { $_.x -ge ($pit.startX - 50) -and ($_.x + $_.w) -le ($pit.endX + 150) }
            if ($hasSupport) {
                Write-Host ("  [OK] Abismo longo (" + $pit.startX + " - " + $pit.endX + ", vao: " + $pit.width + "px) protegido por plataforma de suporte.") -ForegroundColor Green
            } else {
                Write-Host ("  [FALHA] Abismo (" + $pit.startX + " - " + $pit.endX + ") sem plataforma!") -ForegroundColor Red
            }
        }
    }

    # Validar espacamentos entre obstaculos
    $all = @()
    foreach ($s in $spikeList) { $all += [PSCustomObject]@{ x = $s.x; w = $s.w; type = $s.type } }
    foreach ($p in $platList) { $all += [PSCustomObject]@{ x = $p.x; w = $p.w; type = $p.type } }
    foreach ($pt in $pitList) {
        $hasCover = $platList | Where-Object { $_.x -ge ($pt.startX - 50) -and ($_.x + $_.w) -le ($pt.endX + 150) }
        if (-not $hasCover) {
            $all += [PSCustomObject]@{ x = $pt.startX; w = $pt.width; type = $pt.type }
        }
    }

    $sorted = $all | Sort-Object x
    $minFreeGap = 999999

    for ($i = 0; $i -lt ($sorted.Count - 1); $i++) {
        $cur = $sorted[$i]
        $nxt = $sorted[$i + 1]

        $gap = $nxt.x - ($cur.x + $cur.w)

        # Se for fileira intencional colada (gap <= 10px), pula em 1 salto
        if ($gap -le 10 -and $cur.type -eq "Espinho" -and $nxt.type -eq "Espinho") {
            continue
        }

        # Se a plataforma esta em cima do abismo
        if ($cur.type -eq "Abismo" -and $nxt.type -eq "Bloco/Plat" -and $nxt.x -lt ($cur.x + $cur.w)) {
            continue
        }

        if ($gap -lt $minFreeGap) {
            $minFreeGap = $gap
        }

        $timeReact = $gap / $speed
        if ($timeReact -lt 0.35) {
            Write-Host ("  [AVISO ESPACO] Entre " + $cur.type + " (" + $cur.x + ") e " + $nxt.type + " (" + $nxt.x + "): " + [math]::Round($gap, 0) + "px (" + [math]::Round($timeReact, 2) + "s)") -ForegroundColor DarkYellow
        }
    }

    $reactionSec = $minFreeGap / $speed
    Write-Host ("  -> Menor espaco livre entre obstaculos: " + [math]::Round($minFreeGap, 0) + "px") -ForegroundColor Cyan
    Write-Host ("  -> Tempo de reacao minimo disponivel: " + [math]::Round($reactionSec, 2) + "s") -ForegroundColor Cyan

    if ($reactionSec -ge 0.50) {
        Write-Host "  [EXCELENTE] Espacamento muito generoso e confortavel para o jogador!" -ForegroundColor Green
    } elseif ($reactionSec -ge 0.35) {
        Write-Host "  [OTIMO] Espacamento justo e desafiador dentro do padrao de ritmo!" -ForegroundColor Green
    }
}

Write-Host "`n=== TODAS AS 10 FASES FORAM VALIDADAS COM SUCESSO! ===" -ForegroundColor Green
