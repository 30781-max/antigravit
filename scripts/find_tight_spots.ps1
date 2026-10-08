# find_tight_spots.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$speedTable = @{
    1 = 420; 2 = 435; 3 = 450; 4 = 470; 5 = 490
    6 = 510; 7 = 530; 8 = 550; 9 = 570; 10 = 590
}

Write-Output "=== ANALISE DE PONTOS CRITICOS E GAPS CURTOS (< 180px) ==="
foreach ($lvl in $levels) {
    $id = $lvl.id
    $speed = $speedTable[$id]
    
    # Coletar todas as entidades com x inicial e x final
    $entities = @()
    
    # 1. Spikes (agrupando spikes adjacentes <= 4px de espaco)
    $rawSpikes = @($lvl.spikes | Sort-Object x)
    $i = 0
    while ($i -lt $rawSpikes.Count) {
        $sp = $rawSpikes[$i]
        $w = if ($sp.w) { [double]$sp.w } else { 36.0 }
        $startX = [double]$sp.x
        $endX = $startX + $w
        $inverted = [bool]$sp.inverted
        $clusterCount = 1
        
        while ($i + 1 -lt $rawSpikes.Count) {
            $nextSp = $rawSpikes[$i + 1]
            $nextInverted = [bool]$nextSp.inverted
            $nextW = if ($nextSp.w) { [double]$nextSp.w } else { 36.0 }
            if ($nextInverted -eq $inverted -and ([double]$nextSp.x - $endX) -le 4.0) {
                $endX = [double]$nextSp.x + $nextW
                $clusterCount++
                $i++
            } else {
                break
            }
        }
        $name = if ($clusterCount -eq 1) { "Espinho Simples" } elseif ($clusterCount -eq 2) { "Espinho Duplo" } else { "Espinho Triplo" }
        $entities += [PSCustomObject]@{
            Type = "Spike"
            Name = $name
            StartX = $startX
            EndX = $endX
            Y = if ($inverted) { 150.0 } else { 532.0 }
            Inverted = $inverted
        }
        $i++
    }
    
    # 2. Plataformas
    if ($lvl.platforms) {
        foreach ($p in $lvl.platforms) {
            $entities += [PSCustomObject]@{
                Type = "Platform"
                Name = if ($p.h -ge 200) { "Bloco Solido" } else { "Plataforma" }
                StartX = [double]$p.x
                EndX = [double]$p.x + [double]$p.w
                Y = [double]$p.y
                Inverted = ($p.y -le 160)
            }
        }
    }
    
    # 3. Serras
    if ($lvl.saws) {
        foreach ($s in $lvl.saws) {
            $r = if ($s.radius) { [double]$s.radius } else { 24.0 }
            $entities += [PSCustomObject]@{
                Type = "Saw"
                Name = "Serra Circular"
                StartX = [double]$s.x - $r
                EndX = [double]$s.x + $r
                Y = [double]$s.y
                Inverted = ($s.y -le 250)
            }
        }
    }
    
    # 4. Trampolins
    if ($lvl.jumpPads) {
        foreach ($jp in $lvl.jumpPads) {
            $entities += [PSCustomObject]@{
                Type = "JumpPad"
                Name = "Trampolim"
                StartX = [double]$jp.x
                EndX = [double]$jp.x + 48.0
                Y = [double]$jp.y
                Inverted = ($jp.y -le 160)
            }
        }
    }
    
    # 5. Jump Orbs
    if ($lvl.jumpOrbs) {
        foreach ($jo in $lvl.jumpOrbs) {
            $entities += [PSCustomObject]@{
                Type = "JumpOrb"
                Name = "Jump Orb"
                StartX = [double]$jo.x - 22.0
                EndX = [double]$jo.x + 22.0
                Y = [double]$jo.y
                Inverted = ($jo.y -le 250)
            }
        }
    }
    
    # 6. Gravity Portals
    if ($lvl.gravityPortals) {
        foreach ($gp in $lvl.gravityPortals) {
            $entities += [PSCustomObject]@{
                Type = "Portal"
                Name = "Portal Gravidade"
                StartX = [double]$gp.x
                EndX = [double]$gp.x + 52.0
                Y = 300.0
                Inverted = $false
            }
        }
    }
    
    # Ordenar entidades por StartX
    $sorted = @($entities | Sort-Object StartX)
    
    Write-Output "`n--- FASE ${id}: $($lvl.name) (Velocidade Fixa: $speed px/s) ---"
    $tightCount = 0
    for ($k = 0; $k -lt $sorted.Count - 1; $k++) {
        $cur = $sorted[$k]
        $next = $sorted[$k + 1]
        
        # Ignora se uma entidade estah no teto e a outra no chao
        if ($cur.Inverted -ne $next.Inverted -and ($cur.Type -ne "Portal" -and $next.Type -ne "Portal")) {
            continue
        }
        
        $gap = $next.StartX - $cur.EndX
        $time = $gap / $speed
        
        if ($gap -lt 180.0) {
            $tightCount++
            $warn = if ($gap -lt 0) { "OVERLAP/COLISAO!" } elseif ($gap -lt 100) { "MUITO CURTO (<100px)!" } else { "APERTO (<180px)" }
            Write-Output "  [$warn] Gap: $([math]::Round($gap, 1))px ($([math]::Round($time, 3))s) entre $($cur.Name) [X=$($cur.StartX)..$($cur.EndX)] e $($next.Name) [X=$($next.StartX)..$($next.EndX)]"
        }
    }
    if ($tightCount -eq 0) {
        Write-Output "  [PERFEITO] Todos os intervalos sao >= 180px (reacao >= $([math]::Round(180.0/$speed, 3))s)!"
    }
}
