# ==============================================================================
# CYBER PULSE — scripts/simulate_player_trajectory.ps1
# Simulador de Voo e Pouso do Jogador em Cada Obstaculo
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
Write-Host "           SIMULADOR CINEMATICO DE TRAJETORIA DE SALTO (ARC SIMULATION)         " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$trapCount = 0

foreach ($lvl in $levels) {
    $id = $lvl.id
    $name = $lvl.name
    $speed = [double]$lvl.speed
    $jumpDist = $speed * (2.0 * $JUMP_FORCE / $GRAVITY)

    Write-Host ""
    Write-Host ("[FASE " + $id + ": " + $name + "] Velocidade: " + $speed + " px/s") -ForegroundColor Yellow

    $spikes = @($lvl.spikes)
    $plats = @($lvl.platforms)
    $saws = @($lvl.sawblades)
    $pits = @($lvl.pits)

    foreach ($pl in $plats) {
        $plRight = [double]$pl.x + [double]$pl.w
        $ply = [double]$pl.y

        $takeoffX = $plRight - 20
        $takeoffY = $ply - $PLAYER_SIZE
        $dt = 0.01667

        $simX = $takeoffX
        $simY = $takeoffY
        $simVy = -$JUMP_FORCE

        $landed = $false
        $crashed = $false
        $crashDetails = ""

        while (-not $landed -and $simX -lt ($takeoffX + $jumpDist + 200)) {
            $simX += $speed * $dt
            $simVy += $GRAVITY * $dt
            $simY += $simVy * $dt

            if ($simY + $PLAYER_SIZE -ge $GROUND_Y) {
                $simY = $GROUND_Y - $PLAYER_SIZE
                $landed = $true
            }

            foreach ($otherPl in $plats) {
                if ($otherPl.x -ne $pl.x) {
                    $otherRight = [double]$otherPl.x + [double]$otherPl.w
                    if ($simX + $PLAYER_SIZE -ge [double]$otherPl.x -and $simX -le $otherRight) {
                        if ($simVy -ge 0 -and [math]::Abs(($simY + $PLAYER_SIZE) - [double]$otherPl.y) -le 15) {
                            $landed = $true
                            break
                        }
                    }
                }
            }

            foreach ($sp in $spikes) {
                $spx = [double]$sp.x
                $spw = if ($sp.w) { [double]$sp.w } else { 36.0 }
                $sph = if ($sp.h) { [double]$sp.h } else { 38.0 }
                $inv = if ($sp.inverted -eq $true) { $true } else { $false }
                $spy = if ($inv) { $CEILING_Y } else { $GROUND_Y - $sph }

                if (($simX + $PLAYER_SIZE - 4 -gt $spx) -and ($simX + 4 -lt ($spx + $spw)) -and
                    ($simY + $PLAYER_SIZE - 4 -gt $spy) -and ($simY + 4 -lt ($spy + $sph))) {
                    $crashed = $true
                    $crashDetails = ("Salto no final da plataforma X=" + $pl.x + ".." + $plRight + " colidiu no ar/pouso com Espinho em X=" + $spx + " (X_impacto: " + [math]::Round($simX, 0) + ")")
                    break
                }
            }
            if ($crashed) { break }

            foreach ($sw in $saws) {
                $swx = [double]$sw.x
                $swy = [double]$sw.y
                $swr = [double]$sw.radius * 0.82

                $cubeCenterX = $simX + $PLAYER_SIZE / 2.0
                $cubeCenterY = $simY + $PLAYER_SIZE / 2.0
                $distSq = ($cubeCenterX - $swx) * ($cubeCenterX - $swx) + ($cubeCenterY - $swy) * ($cubeCenterY - $swy)

                if ($distSq -le ($swr * $swr)) {
                    $crashed = $true
                    $crashDetails = ("Salto no final da plataforma X=" + $pl.x + ".." + $plRight + " colidiu com Serra em X=" + $swx + " (X_impacto: " + [math]::Round($simX, 0) + ")")
                    break
                }
            }
            if ($crashed) { break }
        }

        if ($crashed) {
            $trapCount++
            Write-Host ("  [ARMADILHA DETECTADA] " + $crashDetails) -ForegroundColor Red
        }
    }
}

$finalColor = if ($trapCount -eq 0) { "Green" } else { "Red" }
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ("TOTAL DE ARMADILHAS DE VOO/POUSO ENCONTRADAS: " + $trapCount) -ForegroundColor $finalColor
Write-Host "================================================================================" -ForegroundColor Cyan
