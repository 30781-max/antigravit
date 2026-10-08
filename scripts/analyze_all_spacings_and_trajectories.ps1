# ==============================================================================
# CYBER PULSE — scripts/analyze_all_spacings_and_trajectories.ps1
# Simulador de Trajetoria, Zonas de Pouso e Zonas Mortas
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
$TIME_AIR = (2.0 * $JUMP_FORCE) / $GRAVITY

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "       DIAGNOSTICO AVANCADO DE TRAJETORIA, ESPACAMENTOS E ZONAS DE POUSO        " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$allIssues = @()

foreach ($lvl in $levels) {
    $id = $lvl.id
    $name = $lvl.name
    $speed = [double]$lvl.speed
    $finishX = [double]$lvl.finishX
    $jumpDist = $speed * $TIME_AIR

    Write-Host ""
    Write-Host ("[FASE " + $id + ": " + $name + "] Speed: " + $speed + " px/s | Salto: " + [math]::Round($jumpDist, 0) + "px") -ForegroundColor Yellow

    # Mapear secoes de gravidade
    $portals = @($lvl.gravityPortals | Sort-Object x)
    
    $getGravityAtX = {
        param($px)
        $curGrav = 1
        foreach ($gp in $portals) {
            if ($px -ge [double]$gp.x) {
                $curGrav = [int]$gp.targetGravity
            }
        }
        return $curGrav
    }

    # 1. Checar cada serra circular
    foreach ($saw in $lvl.sawblades) {
        $sx = [double]$saw.x
        $sy = [double]$saw.y
        $sr = [double]$saw.radius
        $sawGrav = & $getGravityAtX $sx

        # Checar se serra sobrepoe plataforma ou bloco
        foreach ($pl in $lvl.platforms) {
            $plx = [double]$pl.x
            $ply = [double]$pl.y
            $plw = [double]$pl.w
            $plh = [double]$pl.h

            $sawLeft = $sx - $sr
            $sawRight = $sx + $sr
            $sawTop = $sy - $sr
            $sawBottom = $sy + $sr

            $plRight = $plx + $plw
            $plBottom = $ply + $plh

            $overlapX = ($sawRight -gt $plx) -and ($sawLeft -lt $plRight)
            $overlapY = ($sawBottom -gt $ply) -and ($sawTop -lt $plBottom)

            if ($overlapX -and $overlapY) {
                $dx = [math]::Round([math]::Min($sawRight - $plx, $plRight - $sawLeft), 1)
                $issue = [PSCustomObject]@{
                    Fase = $id
                    Tipo = "COLISAO SERRA COM BLOCO"
                    X = $sx
                    Detalhes = ("Serra em X=" + $sx + ", Y=" + $sy + " sobrepoe plataforma/bloco X=" + $plx + ".." + $plRight + ", Y=" + $ply + ".." + $plBottom + " (invasao: " + $dx + "px)")
                    Gravidade = $sawGrav
                }
                $allIssues += $issue
                Write-Host ("  [PROBLEMA] " + $issue.Detalhes) -ForegroundColor Red
            }

            # Checar se serra esta perigosamente perto da saida do bloco (< 120px)
            if (($sawLeft -ge $plRight) -and (($sawLeft - $plRight) -lt 120)) {
                $gap = $sawLeft - $plRight
                $timeToHit = $gap / $speed
                $issue = [PSCustomObject]@{
                    Fase = $id
                    Tipo = "SERRA MUITO PERTO DO FINAL DO BLOCO"
                    X = $sx
                    Detalhes = ("Serra em X=" + $sx + " fica a apenas " + $gap + "px (" + [math]::Round($timeToHit, 3) + "s) do fim da plataforma X=" + $plRight)
                    Gravidade = $sawGrav
                }
                $allIssues += $issue
                Write-Host ("  [ALERTA] " + $issue.Detalhes) -ForegroundColor Magenta
            }
        }
    }

    # 2. Checar espacamento entre Espinhos e Blocos Solidos
    $spikes = @($lvl.spikes | Sort-Object x)
    foreach ($sp in $spikes) {
        $spx = [double]$sp.x
        $spw = if ($sp.w) { [double]$sp.w } else { 36.0 }
        $spRight = $spx + $spw
        $spInv = if ($sp.inverted -eq $true) { $true } else { $false }

        foreach ($pl in $lvl.platforms) {
            if ($pl.isBlock -eq $true) {
                $plx = [double]$pl.x
                $ply = [double]$pl.y
                $isSameZone = if ($spInv) { $ply -lt 300 } else { $ply -gt 300 }

                if ($isSameZone -and ($plx -gt $spRight)) {
                    $dist = $plx - $spRight
                    if ($dist -lt 140) {
                        $timeGap = $dist / $speed
                        $issue = [PSCustomObject]@{
                            Fase = $id
                            Tipo = "ESPINHO MUITO PROXIMO DE BLOCO SOLIDO"
                            X = $spx
                            Detalhes = ("Espinho em X=" + $spx + " fica a apenas " + $dist + "px (" + [math]::Round($timeGap, 3) + "s) antes do bloco solido X=" + $plx)
                            Gravidade = if ($spInv) { -1 } else { 1 }
                        }
                        $allIssues += $issue
                        Write-Host ("  [ALERTA TIGHT] " + $issue.Detalhes) -ForegroundColor Yellow
                    }
                }
            }
        }
    }

    # 3. Checar plataformas que saem diretamente em espinhos (Landing Danger)
    foreach ($pl in $lvl.platforms) {
        $plRight = [double]$pl.x + [double]$pl.w
        $ply = [double]$pl.y
        $isCeiling = ($ply -lt 300)

        foreach ($sp in $spikes) {
            $spx = [double]$sp.x
            $spInv = if ($sp.inverted -eq $true) { $true } else { $false }

            if ($spInv -eq $isCeiling -and ($spx -ge $plRight) -and (($spx - $plRight) -lt 80)) {
                $dist = $spx - $plRight
                $timeGap = $dist / $speed
                $issue = [PSCustomObject]@{
                    Fase = $id
                    Tipo = "ESPINHO NA SAIDA DA PLATAFORMA"
                    X = $plRight
                    Detalhes = ("Plataforma X=" + [double]$pl.x + ".." + $plRight + " termina a apenas " + $dist + "px (" + [math]::Round($timeGap, 3) + "s) antes do espinho em X=" + $spx)
                    Gravidade = if ($isCeiling) { -1 } else { 1 }
                }
                $allIssues += $issue
                Write-Host ("  [ALERTA POUSO] " + $issue.Detalhes) -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ("TOTAL DE ANOMALIAS DETECTADAS: " + $allIssues.Count) -ForegroundColor $(if ($allIssues.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "================================================================================" -ForegroundColor Cyan

$allIssues | Format-Table -AutoSize
