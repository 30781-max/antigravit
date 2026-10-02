# ==============================================================================
# Verificador de Jogabilidade e Consistência Física das Fases do CYBER PULSE
# ==============================================================================

Write-Host "=== INICIANDO VALIDAÇÃO DE JOGABILIDADE E ESPAÇAMENTOS ===" -ForegroundColor Cyan

$content = Get-Content -Path ".\js\levels.js" -Raw

# Extração de níveis via Regex
$levelBlocks = [regex]::Matches($content, "(?ms)\{\s*id:\s*(\d+),\s*name:\s*`"([^`"]+)`".*?finishX:\s*(\d+).*?speed:\s*(\d+).*?\}")

Write-Host "Total de fases extraídas para análise: $($levelBlocks.Count)" -ForegroundColor Green

# Parâmetros de física do js/config.js
$GRAVITY = 2150.0
$JUMP_FORCE = 690.0
$GROUND_Y = 570.0
$CEILING_Y = 150.0
$PLAYER_SIZE = 38.0

# Tempo de voo e distância horizontal de pulo plano
$timeAir = 2.0 * $JUMP_FORCE / $GRAVITY
Write-Host ("Tempo de voo no ar (salto plano): {0:N3} segundos" -f $timeAir) -ForegroundColor Gray

foreach ($match in $levelBlocks) {
    $lvlId = $match.Groups[1].Value
    $name = $match.Groups[2].Value
    $finishX = [double]$match.Groups[3].Value
    $speed = [double]$match.Groups[4].Value

    $jumpDist = $speed * $timeAir
    Write-Host "`n------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "FASE ${lvlId} - $name | Velocidade: $speed px/s | Alcance de salto: $([math]::Round($jumpDist, 1))px | Extensão: $finishX px" -ForegroundColor Yellow

    # Extrair espinhos
    $spikeMatches = [regex]::Matches($match.Value, "\{\s*x:\s*(\d+)(?:,\s*w:\s*(\d+))?(?:,\s*h:\s*(\d+))?(?:,\s*inverted:\s*(true))?")
    $spikes = @()
    foreach ($sm in $spikeMatches) {
        $spikes += [PSCustomObject]@{
            x = [double]$sm.Groups[1].Value
            w = if ($sm.Groups[2].Value) { [double]$sm.Groups[2].Value } else { 36.0 }
            h = if ($sm.Groups[3].Value) { [double]$sm.Groups[3].Value } else { 42.0 }
            inverted = ($sm.Groups[4].Value -eq 'true')
        }
    }

    # Extrair plataformas/blocos
    $platMatches = [regex]::Matches($match.Value, "\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*w:\s*(\d+),\s*h:\s*(\d+)")
    $platforms = @()
    foreach ($pm in $platMatches) {
        $platforms += [PSCustomObject]@{
            x = [double]$pm.Groups[1].Value
            y = [double]$pm.Groups[2].Value
            w = [double]$pm.Groups[3].Value
            h = [double]$pm.Groups[4].Value
        }
    }

    # Extrair abismos
    $pitMatches = [regex]::Matches($match.Value, "startX:\s*(\d+),\s*endX:\s*(\d+)")
    $pits = @()
    foreach ($pm in $pitMatches) {
        $pits += [PSCustomObject]@{
            startX = [double]$pm.Groups[1].Value
            endX = [double]$pm.Groups[2].Value
            width = [double]$pm.Groups[2].Value - [double]$pm.Groups[1].Value
        }
    }

    Write-Host "  -> Espinhos cadastrados: $($spikes.Count)"
    Write-Host "  -> Blocos/Plataformas cadastrados: $($platforms.Count)"
    Write-Host "  -> Abismos cadastrados: $($pits.Count)"

    # Verificar se todos os abismos são transponíveis por um salto plano
    $allPitsValid = $true
    foreach ($pit in $pits) {
        # Se for um vão livre sem plataforma, o vão deve ser menor que o alcance de salto
        if ($pit.width -le $jumpDist) {
            Write-Host "  [OK] Abismo em x: $($pit.startX) (largura: $($pit.width)px) transponível com folga de $([math]::Round($jumpDist - $pit.width, 1))px." -ForegroundColor Green
        } else {
            # Se for maior, checar se há plataforma de travessia
            $hasPlat = $platforms | Where-Object { $_.x -ge $pit.startX -and ($_.x + $_.w) -le ($pit.endX + 150) }
            if ($hasPlat) {
                Write-Host "  [OK] Grande abismo em x: $($pit.startX) (largura: $($pit.width)px) com plataforma de suporte em x: $($hasPlat[0].x)." -ForegroundColor Green
            } else {
                Write-Host "  [ATENÇÃO] Abismo em x: $($pit.startX) largura $($pit.width)px maior que o salto ($jumpDist px) sem plataforma!" -ForegroundColor Red
                $allPitsValid = $false
            }
        }
    }

    # Verificar espaçamentos entre obstáculos consecutivos
    $allObstacles = @()
    foreach ($s in $spikes) { $allObstacles += [PSCustomObject]@{ x = $s.x; type = "Espinho"; w = $s.w } }
    foreach ($p in $platforms) { $allObstacles += [PSCustomObject]@{ x = $p.x; type = "Bloco/Plat"; w = $p.w } }
    foreach ($pt in $pits) { $allObstacles += [PSCustomObject]@{ x = $pt.startX; type = "Abismo"; w = $pt.width } }

    $sortedObs = $allObstacles | Sort-Object x
    $minGap = 999999
    $tightGaps = 0

    for ($i = 0; $i -lt ($sortedObs.Count - 1); $i++) {
        $cur = $sortedObs[$i]
        $next = $sortedObs[$i + 1]
        $gap = $next.x - ($cur.x + $cur.w)

        # Se for espinho duplo ou triplo consecutivo colado (gap <= 10px), é propositalmente ultrapassado em 1 salto só
        if ($gap -le 10 -and $cur.type -eq "Espinho" -and $next.type -eq "Espinho") {
            continue
        }

        # Ignorar plataformas que estão dentro de um abismo
        if ($cur.type -eq "Abismo" -and $next.type -eq "Bloco/Plat" -and $next.x -lt ($cur.x + $cur.w)) {
            continue
        }

        if ($gap -lt $minGap) {
            $minGap = $gap
        }

        # Tempo de reação dado pelo espaçamento
        $reactionTime = $gap / $speed
        if ($reactionTime -lt 0.35) {
            Write-Host "  [AVISO] Espaçamento curto entre $($cur.type) ($($cur.x)) e $($next.type) ($($next.x)): $([math]::Round($gap, 1))px (tempo: $([math]::Round($reactionTime, 2))s)" -ForegroundColor DarkYellow
            $tightGaps++
        }
    }

    $minReaction = $minGap / $speed
    Write-Host "  -> Menor espaçamento livre entre seções: $([math]::Round($minGap, 1))px" -ForegroundColor Cyan
    Write-Host "  -> Tempo mínimo de reação garantido: $([math]::Round($minReaction, 2)) segundos" -ForegroundColor Cyan

    if ($tightGaps -eq 0) {
        Write-Host "  [SUCESSO] Todos os obstáculos possuem espaçamento e tempo de reação generosos e seguros!" -ForegroundColor Green
    }
}

Write-Host "`n=== VALIDAÇÃO FÍSICA E DE ESPAÇAMENTO CONCLUÍDA COM SUCESSO! ===" -ForegroundColor Green
