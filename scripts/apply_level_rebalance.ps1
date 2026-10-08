# apply_level_rebalance.ps1
$filePath = ".\js\levels.js"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText((Resolve-Path $filePath), [System.Text.Encoding]::UTF8)

$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$header = $content.Substring(0, $firstBracket)
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$speedTable = @{
    1 = 420; 2 = 435; 3 = 450; 4 = 470; 5 = 490
    6 = 510; 7 = 530; 8 = 550; 9 = 570; 10 = 590
}

Write-Output "Iniciando rebalanceamento completo das fases..."

foreach ($lvl in $levels) {
    $id = $lvl.id
    # 1. Definir velocidade fixa calibrada
    $lvl.speed = $speedTable[$id]
    
    # 2. Remover todas as moedas secretas
    $lvl.secretCoins = @()
    
    # 3. Remover todos os portais de velocidade (speed portals)
    $lvl.speedPortals = @()
    
    # 4. Atualizar textos de dicas (hints)
    if ($lvl.hints) {
        foreach ($h in $lvl.hints) {
            if ($h.text -match "MOEDA") {
                $h.text = "MANTENHA O RITMO E PRECISÃO!"
            }
            if ($h.text -match "SPEED BOOST") {
                $h.text = "CADÊNCIA PURA: DOMINE O AR!"
            }
            if ($h.text -match "SOBRECARGA DE VELOCIDADE") {
                $h.text = "FASE 5: OVERCLOCK SPRINT - VELOCIDADE 490"
            }
            if ($h.text -match "MANOPLA DE PLASMA") {
                $h.text = "FASE 8: MANOPLA DE PLASMA - VELOCIDADE 550"
            }
        }
    }
}

# --- AJUSTES GEOMÉTRICOS ESPECÍFICOS POR FASE ---

# FASE 1: Neon Dawn
$lvl1 = $levels | Where-Object { $_.id -eq 1 }
# Mover spike 3750 para 3920 para dar folga de pouso após plataforma 3150..3430
($lvl1.spikes | Where-Object { $_.x -eq 3750 }).x = 3920

# FASE 2: Cyber Chasm
$lvl2 = $levels | Where-Object { $_.id -eq 2 }
# Remover spike colado sob a plataforma (x=4650)
$lvl2.spikes = @($lvl2.spikes | Where-Object { $_.x -ne 4650 })
# Remover spike 4000/4080 (armadilha de pouso logo após o pit 3500..3900 e plat 3550..3830)
$lvl2.spikes = @($lvl2.spikes | Where-Object { $_.x -ne 4000 -and $_.x -ne 4080 })
# Ajustar degraus de plataformas para vãos perfeitos
($lvl2.platforms | Where-Object { $_.x -eq 4350 }).x = 4300
($lvl2.platforms | Where-Object { $_.x -eq 4600 -or $_.x -eq 4630 }).x = 4660
# Mover spike após bloco 5650 de 5850 para 5920
($lvl2.spikes | Where-Object { $_.x -eq 5850 }).x = 5920

# FASE 3: Kinetic Wave
$lvl3 = $levels | Where-Object { $_.id -eq 3 }
# Mover spike 2300 para 2150 (para dar 250px antes da plataforma 2400)
($lvl3.spikes | Where-Object { $_.x -eq 2300 }).x = 2150
# Remover spike 4200 (estava embaixo da plataforma 4100..4340)
$lvl3.spikes = @($lvl3.spikes | Where-Object { $_.x -ne 4200 })
# Mover serra 4500 para 4560
($lvl3.sawblades | Where-Object { $_.x -eq 4500 }).x = 4560
# Mover portal de inversão 4950 para 5020
($lvl3.gravityPortals | Where-Object { $_.x -eq 4950 }).x = 5020
# Teto: spike 5350 -> 5380; plataforma 5500 -> 5660 (W=240, folga de 244px do spike!)
($lvl3.spikes | Where-Object { $_.x -eq 5350 }).x = 5380
($lvl3.platforms | Where-Object { $_.x -eq 5500 }).x = 5660
# Teto: spike 5850/6140 -> 6280 (folga de 380px após plataforma 5660..5900, zero armadilha!)
($lvl3.spikes | Where-Object { $_.x -eq 5850 -or $_.x -eq 6140 }).x = 6280
# Mover portal retorno de 6400 para 6480
($lvl3.gravityPortals | Where-Object { $_.x -eq 6400 }).x = 6480
# Chão: spike 6960 -> 7080; spike 7280 -> 7340
($lvl3.spikes | Where-Object { $_.x -eq 6960 }).x = 7080
($lvl3.spikes | Where-Object { $_.x -eq 7280 }).x = 7340

# FASE 4: Gravity Nexus
$lvl4 = $levels | Where-Object { $_.id -eq 4 }
# Mover espinho duplo 2350, 2386 para 2220, 2256 (folga de 244px antes da plataforma 2500)
($lvl4.spikes | Where-Object { $_.x -eq 2350 }).x = 2220
($lvl4.spikes | Where-Object { $_.x -eq 2386 }).x = 2256
# Mover spike 3100/2980 para 3120 (folga de pouso após plataforma 2500..2700!)
($lvl4.spikes | Where-Object { $_.x -eq 3100 -or $_.x -eq 2980 }).x = 3120
# Mover plataforma 3200 para 3420..3640
($lvl4.platforms | Where-Object { $_.x -eq 3200 -or $_.x -eq 3260 }).x = 3420
# Mover espinho duplo 3550, 3586 para 3880, 3916 (folga de 240px após plataforma 3640)
($lvl4.spikes | Where-Object { $_.x -eq 3550 -or $_.x -eq 3720 }).x = 3880
($lvl4.spikes | Where-Object { $_.x -eq 3586 -or $_.x -eq 3756 }).x = 3916
# Teto: double spike 6200, 6236 -> 6150, 6186
($lvl4.spikes | Where-Object { $_.x -eq 6200 }).x = 6150
($lvl4.spikes | Where-Object { $_.x -eq 6236 }).x = 6186
# Teto: plataforma 6350 -> 6460..6700 (folga de 238px do spike!)
($lvl4.platforms | Where-Object { $_.x -eq 6350 }).x = 6460
# Serra 6720 no teto -> mover para 6940 (fora da plataforma!)
($lvl4.sawblades | Where-Object { $_.x -eq 6720 }).x = 6940
# Spike teto 6860 -> remover para evitar aperto com a serra
$lvl4.spikes = @($lvl4.spikes | Where-Object { $_.x -ne 6860 })
# Portal retorno 7000 -> 7200
($lvl4.gravityPortals | Where-Object { $_.x -eq 7000 }).x = 7200
# Orb 7300 -> 7440
($lvl4.jumpOrbs | Where-Object { $_.x -eq 7300 }).x = 7440
# Spike 7550 -> 7650
($lvl4.spikes | Where-Object { $_.x -eq 7550 }).x = 7650
# Final: double spike 8000, 8036 -> 7940, 7976
($lvl4.spikes | Where-Object { $_.x -eq 8000 -or $_.x -eq 7800 }).x = 7940
($lvl4.spikes | Where-Object { $_.x -eq 8036 -or $_.x -eq 7836 }).x = 7976
# Plataforma final: 8100 -> 8250..8450
($lvl4.platforms | Where-Object { $_.x -eq 8100 }).x = 8250

# FASE 5: Overclock Sprint
$lvl5 = $levels | Where-Object { $_.id -eq 5 }
# Double spike 2500, 2536 -> 2440, 2476 (folga de 224px antes de plat 2700)
($lvl5.spikes | Where-Object { $_.x -eq 2500 }).x = 2440
($lvl5.spikes | Where-Object { $_.x -eq 2536 }).x = 2476
# Spike 3200 após plat 2700..2920 -> 3360 (folga de pouso completa!)
($lvl5.spikes | Where-Object { $_.x -eq 3200 }).x = 3360
# Spike 4880 após plat 4500..4740 -> 4980 (folga 240px)
($lvl5.spikes | Where-Object { $_.x -eq 4880 }).x = 4980
# Spike 7780 após plat 7400..7660 -> 7900 (folga 240px)
($lvl5.spikes | Where-Object { $_.x -eq 7780 }).x = 7900

# FASE 6: Dual Flux
$lvl6 = $levels | Where-Object { $_.id -eq 6 }
# Double spike 2700, 2736 -> 2540, 2576 (folga de 224px antes de plat 2800)
($lvl6.spikes | Where-Object { $_.x -eq 2700 }).x = 2540
($lvl6.spikes | Where-Object { $_.x -eq 2736 }).x = 2576
# Teto: double spike 5700, 5736 -> 5640, 5676 (folga de 224px antes de plat 5900)
($lvl6.spikes | Where-Object { $_.x -eq 5700 }).x = 5640
($lvl6.spikes | Where-Object { $_.x -eq 5736 }).x = 5676
# Spike 9380 após plat 9000..9240 -> 9480 (folga 240px)
($lvl6.spikes | Where-Object { $_.x -eq 9380 }).x = 9480

# FASE 7: Skyline Corridor
$lvl7 = $levels | Where-Object { $_.id -eq 7 }
# Double spike 2800, 2836 -> 2740, 2776 (folga de 224px antes de plat 3000)
($lvl7.spikes | Where-Object { $_.x -eq 2800 }).x = 2740
($lvl7.spikes | Where-Object { $_.x -eq 2836 }).x = 2776
# Spike 5700 após plat 5300..5560 -> 5800 (folga 240px)
($lvl7.spikes | Where-Object { $_.x -eq 5700 }).x = 5800

# FASE 8: Plasma Gauntlet
$lvl8 = $levels | Where-Object { $_.id -eq 8 }
# Double spike 3000, 3036 -> 2940, 2976 (folga de 224px antes de plat 3200)
($lvl8.spikes | Where-Object { $_.x -eq 3000 }).x = 2940
($lvl8.spikes | Where-Object { $_.x -eq 3036 }).x = 2976
# Spike 3800 após plat 3200..3440 -> 3960 (folga de pouso perfeita!)
($lvl8.spikes | Where-Object { $_.x -eq 3800 }).x = 3960
# Teto: double spike 7200, 7236 -> 7140, 7176 (folga de 224px antes de plat 7400)
($lvl8.spikes | Where-Object { $_.x -eq 7200 }).x = 7140
($lvl8.spikes | Where-Object { $_.x -eq 7236 }).x = 7176
# Teto: spike 8000/8060 após plat 7400..7660 -> 8180 (folga de pouso no teto!)
($lvl8.spikes | Where-Object { $_.x -eq 8000 -or $_.x -eq 8060 }).x = 8180
# Spike 8600 antes de trampolim 8800 -> 8540
($lvl8.spikes | Where-Object { $_.x -eq 8600 }).x = 8540
# Spike 10800 após plat 10400..10660 -> 10900 (folga 240px)
($lvl8.spikes | Where-Object { $_.x -eq 10800 }).x = 10900

# FASE 9: Chrono Vortex
$lvl9 = $levels | Where-Object { $_.id -eq 9 }
# Double spike 3200, 3236 -> 3140, 3176 (folga de 224px antes de plat 3400)
($lvl9.spikes | Where-Object { $_.x -eq 3200 }).x = 3140
($lvl9.spikes | Where-Object { $_.x -eq 3236 }).x = 3176
# Teto: double spike 7700, 7736 -> 7640, 7676 (folga de 224px antes de plat 7900)
($lvl9.spikes | Where-Object { $_.x -eq 7700 }).x = 7640
($lvl9.spikes | Where-Object { $_.x -eq 7736 }).x = 7676
# Teto: spike 8600 após plat 7900..8180 -> 8740 (folga de pouso no teto!)
($lvl9.spikes | Where-Object { $_.x -eq 8600 }).x = 8740
# Teto: portal retorno 9000 -> 9060
($lvl9.gravityPortals | Where-Object { $_.x -eq 9000 }).x = 9060

# FASE 10: Singularity Overdrive
$lvl10 = $levels | Where-Object { $_.id -eq 10 }
# Double spike 3500, 3536 -> 3440, 3476 (folga de 224px antes de plat 3700)
($lvl10.spikes | Where-Object { $_.x -eq 3500 }).x = 3440
($lvl10.spikes | Where-Object { $_.x -eq 3536 }).x = 3476
# Teto: double spike 8600, 8636 -> 8540, 8576 (folga de 224px antes de plat 8800)
($lvl10.spikes | Where-Object { $_.x -eq 8600 }).x = 8540
($lvl10.spikes | Where-Object { $_.x -eq 8636 }).x = 8576
# Spike 10300 antes de trampolim 10500 -> 10240
($lvl10.spikes | Where-Object { $_.x -eq 10300 }).x = 10240


# Serialização e Escrita no Arquivo
$jsonOut = $levels | ConvertTo-Json -Depth 12
$finalText = $header + $jsonOut + ";`n"
[System.IO.File]::WriteAllText((Resolve-Path $filePath), $finalText, $utf8NoBom)
Write-Output "js/levels.js atualizado com sucesso com codificação UTF-8 sem BOM!"
