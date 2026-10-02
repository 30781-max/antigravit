# Inspecionar plataformas e sua acessibilidade
$content = Get-Content -Path ".\js\levels.js" -Raw
$regex = New-Object System.Text.RegularExpressions.Regex('\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?speed:\s*(\d+).*?platforms:\s*\[(.*?)\]\s*,\s*jumpPads', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$matches = $regex.Matches($content)

Write-Host "Total de fases encontradas: $($matches.Count)" -ForegroundColor Green

foreach ($m in $matches) {
    $lvlId = $m.Groups[1].Value
    $name = $m.Groups[2].Value
    $speed = [double]$m.Groups[3].Value
    $platsRaw = $m.Groups[4].Value
    
    $pRegex = New-Object System.Text.RegularExpressions.Regex('\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*w:\s*(\d+),\s*h:\s*(\d+)(?:,\s*isBlock:\s*(true))?')
    $pMatches = $pRegex.Matches($platsRaw)
    
    Write-Host "`n=== FASE ${lvlId}: $name (Velocidade: $speed px/s) ===" -ForegroundColor Yellow
    foreach ($pm in $pMatches) {
        $px = [int]$pm.Groups[1].Value
        $py = [int]$pm.Groups[2].Value
        $pw = [int]$pm.Groups[3].Value
        $ph = [int]$pm.Groups[4].Value
        $isBlock = ($pm.Groups[5].Value -eq 'true')
        $diffFromGround = 570 - $py
        
        $status = "OK"
        if ($diffFromGround -gt 110 -and -not $isBlock) {
            # Se for mais alto que 110px do chão (570 - 110 = 460)
            $status = "ALTO DEMAIS DO CHAO (altura: $diffFromGround px, limite de salto do chao: 110px)"
        }
        Write-Host "  Plat x=$px, y=$py (diffGround: ${diffFromGround}px, w=$pw, h=$ph, isBlock=$isBlock) -> $status"
    }
}
