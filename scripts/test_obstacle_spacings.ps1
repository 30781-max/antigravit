# ==============================================================================
# CYBER PULSE — scripts/test_obstacle_spacings.ps1
# Análise Completa de Espaçamentos, Reação Humana e Viabilidade Física
# ==============================================================================

$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')

if ($firstBracket -lt 0 -or $lastBracket -le $firstBracket) {
    Write-Host "Erro: Arquivo js/levels.js não contém array JSON válido." -ForegroundColor Red
    exit 1
}

$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$GRAVITY = 2150.0
$JUMP_FORCE = 690.0
$PLAYER_SIZE = 38.0
$GROUND_Y = 570.0
$CEILING_Y = 150.0
$MAX_JUMP_HEIGHT = ($JUMP_FORCE * $JUMP_FORCE) / (2.0 * $GRAVITY) # ~110.72px
$TIME_AIR = (2.0 * $JUMP_FORCE) / $GRAVITY                       # ~0.64186s

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "           RELATÓRIO DE ESPAÇAMENTOS E FÍSICA DE OBSTÁCULOS — CYBER PULSE        " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Constantes Físicas:"
Write-Host ("  Gravidade: " + $GRAVITY + " px/s² | Força do Salto: " + $JUMP_FORCE + " px/s")
Write-Host ("  Tempo no ar (salto chão-a-chão): " + [math]::Round($TIME_AIR, 3) + "s")
Write-Host ("  Altura máxima do salto: " + [math]::Round($MAX_JUMP_HEIGHT, 1) + "px")
Write-Host ("  Tamanho do Jogador: " + $PLAYER_SIZE + "px")
Write-Host "--------------------------------------------------------------------------------"

$totalAlerts = 0
$totalObstacles = 0
$levelSummaries = @()

foreach ($lvl in $levels) {
    $id = $lvl.id
    $name = $lvl.name
    $speed = [double]$lvl.speed
    $finishX = [double]$lvl.finishX
    $jumpDist = $speed * $TIME_AIR
    
    Write-Host ""
    Write-Host ("[FASE " + $id + " - " + $name + "] | Velocidade: " + $speed + " px/s | Alcance Salto: " + [math]::Round($jumpDist, 1) + " px | Fim: " + $finishX + " px") -ForegroundColor Yellow
    
    # 1. Agrupar espinhos colados em "clusters" (ex: espinho duplo ou triplo)
    $rawSpikes = @($lvl.spikes | Sort-Object x)
    $spikeClusters = @()
    $i = 0
    while ($i -lt $rawSpikes.Count) {
        $sp = $rawSpikes[$i]
        $w = if ($sp.w) { [double]$sp.w } else { 36.0 }
        $h = if ($sp.h) { [double]$sp.h } else { 38.0 }
        $inverted = if ($sp.inverted -eq $true) { $true } else { $false }
        $y = if ($null -ne $sp.y) { [double]$sp.y } else { if ($inverted) { $CEILING_Y } else { $GROUND_Y - $h } }
        
        $clusterX = [double]$sp.x
        $clusterEndX = $clusterX + $w
        $clusterCount = 1
        $clusterInverted = $inverted
        
        # Verificar se os próximos espinhos estão colados (gap <= 4px) e mesma orientação
        while (($i + 1) -lt $rawSpikes.Count) {
            $nextSp = $rawSpikes[$i + 1]
            $nextX = [double]$nextSp.x
            $nextW = if ($nextSp.w) { [double]$nextSp.w } else { 36.0 }
            $nextInv = if ($nextSp.inverted -eq $true) { $true } else { $false }
            
            if (($nextX -le ($clusterEndX + 4)) -and ($nextInv -eq $clusterInverted)) {
                $clusterEndX = [math]::Max($clusterEndX, $nextX + $nextW)
                $clusterCount++
                $i++
            } else {
                break
            }
        }
        
        $spikeClusters += [PSCustomObject]@{
            type = if ($clusterCount -eq 1) { "Espinho Simples" } elseif ($clusterCount -eq 2) { "Espinho Duplo" } elseif ($clusterCount -eq 3) { "Espinho Triplo" } else { ("Espinho Múltiplo " + $clusterCount) }
            category = "Hazard"
            x = $clusterX
            endX = $clusterEndX
            w = $clusterEndX - $clusterX
            y = $y
            h = $h
            inverted = $clusterInverted
            count = $clusterCount
        }
        $i++
    }
    
    # 2. Coletar Plataformas e Blocos
    $platformItems = @()
    foreach ($plat in $lvl.platforms) {
        $px = [double]$plat.x
        $py = [double]$plat.y
        $pw = [double]$plat.w
        $ph = [double]$plat.h
        $isBlock = if ($plat.isBlock -eq $true) { $true } else { $false }
        
        $platformItems += [PSCustomObject]@{
            type = if ($isBlock) { "Bloco Sólido" } else { "Plataforma" }
            category = if ($isBlock) { "Block" } else { "Platform" }
            x = $px
            endX = $px + $pw
            w = $pw
            y = $py
            h = $ph
            isBlock = $isBlock
        }
    }
    
    # 3. Coletar Abismos (Pits)
    $pitItems = @()
    foreach ($pit in $lvl.pits) {
        $sx = [double]$pit.startX
        $ex = [double]$pit.endX
        $pw = $ex - $sx
        $pitItems += [PSCustomObject]@{
            type = "Abismo (Pit)"
            category = "Pit"
            x = $sx
            endX = $ex
            w = $pw
            y = $GROUND_Y
            h = 150
        }
    }
    
    # 4. Coletar Serras Circulares
    $sawItems = @()
    foreach ($saw in $lvl.sawblades) {
        $sx = [double]$saw.x
        $sy = [double]$saw.y
        $sr = [double]$saw.radius
        $sawItems += [PSCustomObject]@{
            type = ("Serra Circular (r=" + $sr + ")")
            category = "Saw"
            x = $sx - $sr
            endX = $sx + $sr
            w = $sr * 2
            y = $sy - $sr
            h = $sr * 2
        }
    }
    
    # 5. Coletar Moving Hazards
    $movItems = @()
    foreach ($mh in $lvl.movingHazards) {
        $mx = [double]$mh.x
        $mw = if ($mh.w) { [double]$mh.w } else { 36.0 }
        $mhHeight = if ($mh.h) { [double]$mh.h } else { 36.0 }
        $movItems += [PSCustomObject]@{
            type = "Obstáculo Móvel"
            category = "Hazard"
            x = $mx
            endX = $mx + $mw
            w = $mw
            y = [double]$mh.baseY
            h = $mhHeight
        }
    }
    
    # 6. Coletar Trampolins e Orbes (Mecânicas Auxiliares)
    $padItems = @()
    foreach ($pad in $lvl.jumpPads) {
        $px = [double]$pad.x
        $pw = if ($pad.w) { [double]$pad.w } else { 48.0 }
        $padItems += [PSCustomObject]@{
            type = "Trampolim Amarelo"
            category = "Helper"
            x = $px
            endX = $px + $pw
            w = $pw
            y = [double]$pad.y
            h = if ($pad.h) { [double]$pad.h } else { 12.0 }
        }
    }
    
    $orbItems = @()
    foreach ($orb in $lvl.jumpOrbs) {
        $ox = [double]$orb.x
        $or = if ($orb.radius) { [double]$orb.radius } else { 22.0 }
        $orbItems += [PSCustomObject]@{
            type = "Orbe Amarelo"
            category = "Helper"
            x = $ox - $or
            endX = $ox + $or
            w = $or * 2
            y = [double]$orb.y - $or
            h = $or * 2
        }
    }

    # Unificar todos os obstáculos interativos do percurso para checagem sequencial
    $allObstacles = @()
    $allObstacles += $spikeClusters
    $allObstacles += $platformItems
    $allObstacles += $pitItems
    $allObstacles += $sawItems
    $allObstacles += $movItems
    $allObstacles += $padItems
    $allObstacles += $orbItems
    
    $sorted = @($allObstacles | Sort-Object x)
    $totalObstacles += $sorted.Count
    
    Write-Host "  Contagem de Entidades:"
    Write-Host ("    Espinhos/Clusters: " + $spikeClusters.Count + " | Plataformas: " + $platformItems.Count + " | Abismos: " + $pitItems.Count)
    Write-Host ("    Serras: " + $sawItems.Count + " | Móveis: " + $movItems.Count + " | Trampolins: " + $padItems.Count + " | Orbes: " + $orbItems.Count)
    Write-Host ("    Total de seções interativas: " + $sorted.Count)
    
    # 7. VALIDAÇÃO DE ABISMOS
    foreach ($pit in $pitItems) {
        $pitWidth = $pit.w
        # Verificar se há plataforma ou trampolim ou orbe cobrindo
        $covers = $platformItems | Where-Object { ($_.x -le ($pit.endX + 20)) -and ($_.endX -ge ($pit.x - 20)) }
        $hasPad = $padItems | Where-Object { ($_.x -ge ($pit.x - 200)) -and ($_.x -le $pit.x) }
        
        if ($pitWidth -le ($jumpDist - 20)) {
            Write-Host ("    [OK PIT] Abismo em X=" + $pit.x + " (largura: " + $pitWidth + " px) transponível por salto direto (alcance: " + [math]::Round($jumpDist, 0) + " px, folga: " + [math]::Round($jumpDist - $pitWidth, 0) + " px)") -ForegroundColor Green
        } elseif ($covers.Count -gt 0) {
            Write-Host ("    [OK PIT] Abismo amplo em X=" + $pit.x + " (largura: " + $pitWidth + " px) protegido por " + $covers.Count + " plataforma(s)") -ForegroundColor Green
        } elseif ($hasPad.Count -gt 0) {
            Write-Host ("    [OK PIT] Abismo amplo em X=" + $pit.x + " (largura: " + $pitWidth + " px) equipado com trampolim prévio") -ForegroundColor Green
        } else {
            Write-Host ("    [CRÍTICO PIT] Abismo em X=" + $pit.x + " (largura: " + $pitWidth + " px) excede alcance de salto (" + [math]::Round($jumpDist, 0) + " px) sem plataforma!") -ForegroundColor Red
            $totalAlerts++
        }
    }
    
    # 8. VALIDAÇÃO DE ALTURA DE PLATAFORMAS (Acessibilidade)
    foreach ($p in $platformItems) {
        $diffFromGround = $GROUND_Y - $p.y
        if ($diffFromGround -gt $MAX_JUMP_HEIGHT) {
            # Verificar se há plataforma anterior funcionando como degrau ou trampolim/orbe
            $stepBefore = $platformItems | Where-Object { ($_.endX -le ($p.x + 20)) -and ($_.endX -ge ($p.x - 350)) -and ([math]::Abs($p.y - $_.y) -le $MAX_JUMP_HEIGHT) }
            $padBefore = $padItems | Where-Object { ($_.x -ge ($p.x - 300)) -and ($_.x -le $p.x) }
            $orbNearby = $orbItems | Where-Object { [math]::Abs($_.x - $p.x) -le 250 }
            
            if ($stepBefore.Count -gt 0) {
                Write-Host ("    [OK PLAT] Plataforma alta em X=" + $p.x + ", Y=" + $p.y + " (" + [math]::Round($diffFromGround, 0) + " px do chão) acessível via degrau prévio") -ForegroundColor Green
            } elseif ($padBefore.Count -gt 0) {
                Write-Host ("    [OK PLAT] Plataforma alta em X=" + $p.x + ", Y=" + $p.y + " acessível via Trampolim") -ForegroundColor Green
            } elseif ($orbNearby.Count -gt 0) {
                Write-Host ("    [OK PLAT] Plataforma alta em X=" + $p.x + ", Y=" + $p.y + " acessível via Orbe") -ForegroundColor Green
            } else {
                Write-Host ("    [ALERTA PLAT] Plataforma em X=" + $p.x + ", Y=" + $p.y + " está a " + [math]::Round($diffFromGround, 0) + " px do chão (limite salto do chão: " + [math]::Round($MAX_JUMP_HEIGHT, 0) + " px) sem degrau/auxílio!") -ForegroundColor DarkYellow
                $totalAlerts++
            }
        }
    }
    
    # 9. ANÁLISE DE ESPAÇAMENTOS ENTRE OBSTÁCULOS CONSECUTIVOS
    Write-Host "  Análise de Espaçamento entre Obstáculos Consecutivos:"
    $minGap = 999999
    $minReactTime = 999999
    $tightGaps = @()
    $overlapGaps = @()
    
    for ($idx = 0; $idx -lt ($sorted.Count - 1); $idx++) {
        $cur = $sorted[$idx]
        $next = $sorted[$idx + 1]
        
        $gap = $next.x - $cur.endX
        $reactTime = $gap / $speed
        
        # Ignorar sobreposições intencionais (ex: espinho EM CIMA de plataforma ou orbe SOBRE abismo)
        $isSpikeOnPlat = ($cur.category -eq "Platform" -and $next.category -eq "Hazard" -and $next.x -ge $cur.x -and $next.endX -le $cur.endX)
        $isPlatOverPit = ($cur.category -eq "Pit" -and $next.category -eq "Platform" -and $next.x -ge $cur.x -and $next.x -le $cur.endX)
        $isHelperOnSurface = ($next.category -eq "Helper" -and $next.x -ge $cur.x -and $next.x -le $cur.endX)
        $isInside = ($next.x -ge $cur.x -and $next.endX -le $cur.endX)
        
        if ($isSpikeOnPlat -or $isPlatOverPit -or $isHelperOnSurface -or $isInside) {
            # Elemento contido dentro de outro por design arquitetural da fase
            continue
        }
        
        if ($gap -lt 0) {
            $overlapGaps += [PSCustomObject]@{
                cur = ($cur.type + " [X: " + $cur.x + " - " + $cur.endX + "]")
                next = ($next.type + " [X: " + $next.x + " - " + $next.endX + "]")
                overlap = [math]::Abs($gap)
            }
        } else {
            if ($gap -lt $minGap) {
                $minGap = $gap
                $minReactTime = $reactTime
            }
            if ($reactTime -lt 0.28) {
                $tightGaps += [PSCustomObject]@{
                    cur = ($cur.type + " [X: " + $cur.x + "]")
                    next = ($next.type + " [X: " + $next.x + "]")
                    gap = [math]::Round($gap, 1)
                    reactTime = [math]::Round($reactTime, 3)
                }
            }
        }
    }
    
    if ($overlapGaps.Count -gt 0) {
        Write-Host ("    [ALERTA SOBREPOSIÇÃO] Foram detectadas " + $overlapGaps.Count + " sobreposições:") -ForegroundColor Red
        foreach ($ov in $overlapGaps) {
            Write-Host ("      - " + $ov.cur + " invade " + $ov.next + " em " + $ov.overlap + " px") -ForegroundColor Red
        }
        $totalAlerts += $overlapGaps.Count
    } else {
        Write-Host "    [OK] Nenhuma sobreposição indevida entre obstáculos." -ForegroundColor Green
    }
    
    Write-Host ("    Menor vão livre: " + [math]::Round($minGap, 1) + " px | Menor tempo de reação: " + [math]::Round($minReactTime, 3) + "s")
    
    if ($tightGaps.Count -gt 0) {
        Write-Host "    Intervalos com reação rápida (< 0.28s):" -ForegroundColor Magenta
        foreach ($tg in $tightGaps) {
            Write-Host ("      - " + $tg.cur + " -> " + $tg.next + " | Vão: " + $tg.gap + " px | Tempo: " + $tg.reactTime + "s") -ForegroundColor Magenta
        }
    } else {
        Write-Host "    [EXCELENTE] Todos os intervalos concedem tempo de reação confortável (>= 0.28s)!" -ForegroundColor Green
    }
    
    $levelSummaries += [PSCustomObject]@{
        Fase = $id
        Nome = $name
        Vel = $speed
        Obstaculos = $sorted.Count
        MinGapPx = [math]::Round($minGap, 1)
        MinTempoS = [math]::Round($minReactTime, 3)
        Status = if ($overlapGaps.Count -gt 0) { "Atenção" } else { "Aprovado" }
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                           TABELA RESUMO DAS 10 FASES                           " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
$levelSummaries | Format-Table -AutoSize

Write-Host ("Total de obstáculos analisados: " + $totalObstacles)
Write-Host ("Total de alertas críticos encontrados: " + $totalAlerts)

if ($totalAlerts -eq 0) {
    Write-Host "`n[SUCESSO COMPLETO] Todos os espaçamentos entre obstáculos são consistentes, justos e jogáveis!" -ForegroundColor Green
} else {
    Write-Host ("`n[ATENÇÃO] Foram encontrados " + $totalAlerts + " pontos para análise ou ajuste.") -ForegroundColor Yellow
}
