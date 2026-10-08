# ==============================================================================
# CYBER PULSE — scripts/detailed_spacing_inspector.ps1
# Inspeção Detalhada de Cada Par de Obstáculos Consecutivos em Todas as Fases
# ==============================================================================

$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$GROUND_Y = 570.0
$CEILING_Y = 150.0

foreach ($lvl in $levels) {
    $id = $lvl.id
    $name = $lvl.name
    $speed = [double]$lvl.speed
    $jumpDist = $speed * (2.0 * 690.0 / 2150.0)

    Write-Host "`n================================================================================" -ForegroundColor Cyan
    Write-Host ("FASE " + $id + ": " + $name + " (Velocidade: " + $speed + " px/s, Salto chão: " + [math]::Round($jumpDist, 0) + " px)") -ForegroundColor Yellow
    Write-Host "================================================================================" -ForegroundColor Cyan

    # Unir obstáculos com coordenadas X, Y, W, H
    $items = @()

    foreach ($sp in $lvl.spikes) {
        $w = if ($sp.w) { [double]$sp.w } else { 36.0 }
        $h = if ($sp.h) { [double]$sp.h } else { 38.0 }
        $inv = if ($sp.inverted -eq $true) { $true } else { $false }
        $y = if ($null -ne $sp.y) { [double]$sp.y } else { if ($inv) { $CEILING_Y } else { $GROUND_Y - $h } }
        $items += [PSCustomObject]@{
            type = if ($inv) { "Espinho Teto" } else { "Espinho Chão" }
            x = [double]$sp.x
            endX = [double]$sp.x + $w
            y = $y
            endY = $y + $h
            w = $w
            h = $h
        }
    }

    foreach ($pl in $lvl.platforms) {
        $w = [double]$pl.w
        $h = [double]$pl.h
        $y = [double]$pl.y
        $isBlock = if ($pl.isBlock -eq $true) { $true } else { $false }
        $items += [PSCustomObject]@{
            type = if ($isBlock) { "Bloco Sólido" } else { "Plataforma" }
            x = [double]$pl.x
            endX = [double]$pl.x + $w
            y = $y
            endY = $y + $h
            w = $w
            h = $h
        }
    }

    foreach ($pt in $lvl.pits) {
        $items += [PSCustomObject]@{
            type = "Abismo"
            x = [double]$pt.startX
            endX = [double]$pt.endX
            y = $GROUND_Y
            endY = $GROUND_Y + 150
            w = [double]$pt.endX - [double]$pt.startX
            h = 150
        }
    }

    foreach ($sw in $lvl.sawblades) {
        $r = [double]$sw.radius
        $items += [PSCustomObject]@{
            type = "Serra Circular"
            x = [double]$sw.x - $r
            endX = [double]$sw.x + $r
            y = [double]$sw.y - $r
            endY = [double]$sw.y + $r
            w = $r * 2
            h = $r * 2
        }
    }

    foreach ($mh in $lvl.movingHazards) {
        $w = if ($mh.w) { [double]$mh.w } else { 36.0 }
        $h = if ($mh.h) { [double]$mh.h } else { 36.0 }
        $items += [PSCustomObject]@{
            type = "Obstáculo Móvel"
            x = [double]$mh.x
            endX = [double]$mh.x + $w
            y = [double]$mh.baseY
            endY = [double]$mh.baseY + $h
            w = $w
            h = $h
        }
    }

    foreach ($pd in $lvl.jumpPads) {
        $w = if ($pd.w) { [double]$pd.w } else { 48.0 }
        $h = if ($pd.h) { [double]$pd.h } else { 12.0 }
        $items += [PSCustomObject]@{
            type = "Trampolim"
            x = [double]$pd.x
            endX = [double]$pd.x + $w
            y = [double]$pd.y
            endY = [double]$pd.y + $h
            w = $w
            h = $h
        }
    }

    foreach ($ob in $lvl.jumpOrbs) {
        $r = if ($ob.radius) { [double]$ob.radius } else { 22.0 }
        $items += [PSCustomObject]@{
            type = "Orbe Amarelo"
            x = [double]$ob.x - $r
            endX = [double]$ob.x + $r
            y = [double]$ob.y - $r
            endY = [double]$ob.y + $r
            w = $r * 2
            h = $r * 2
        }
    }

    $sorted = @($items | Sort-Object x)

    for ($i = 0; $i -lt ($sorted.Count - 1); $i++) {
        $c = $sorted[$i]
        $n = $sorted[$i + 1]

        $gap = $n.x - $c.endX
        $t = $gap / $speed

        # Se for espinho adjacente colado (cluster)
        if ($gap -le 4 -and $c.type -like "*Espinho*" -and $n.type -like "*Espinho*") {
            continue
        }

        # Formatação de saída com cores por severidade
        $line = ("[{0,4} -> {1,4}] {2,-16} -> {3,-16} | Vão: {4,6:N1}px | Tempo: {5,5:N3}s" -f $c.endX, $n.x, $c.type, $n.type, $gap, $t)

        if ($gap -lt 0) {
            Write-Host ("  [SOBREPOSIÇÃO] " + $line) -ForegroundColor Red
        } elseif ($t -lt 0.15) {
            Write-Host ("  [MUITO APERTADO] " + $line) -ForegroundColor Magenta
        } elseif ($t -lt 0.28) {
            Write-Host ("  [APERTADO]       " + $line) -ForegroundColor Yellow
        } else {
            Write-Host ("  [CONFORTÁVEL]    " + $line) -ForegroundColor Gray
        }
    }
}
