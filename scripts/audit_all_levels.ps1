# audit_all_levels.ps1
$content = Get-Content -Path ".\js\levels.js" -Raw
$firstBracket = $content.IndexOf('[')
$lastBracket = $content.LastIndexOf(']')
$json = $content.Substring($firstBracket, $lastBracket - $firstBracket + 1)
$levels = ConvertFrom-Json $json

$speedTable = @{
    1 = 420; 2 = 435; 3 = 450; 4 = 470; 5 = 490
    6 = 510; 7 = 530; 8 = 550; 9 = 570; 10 = 590
}

Write-Output "=== AUDITORIA COMPLETA DE PITS (ABISMOS) ==="
foreach ($lvl in $levels) {
    $id = $lvl.id
    $speed = $speedTable[$id]
    $maxJump = $speed * (2.0 * 690.0 / 2150.0)
    
    if ($lvl.pits) {
        foreach ($pit in $lvl.pits) {
            $w = $pit.endX - $pit.startX
            $hasPadOrOrb = $false
            if ($lvl.jumpOrbs) {
                foreach ($jo in $lvl.jumpOrbs) {
                    if ($jo.x -ge ($pit.startX - 100) -and $jo.x -le ($pit.endX + 100)) { $hasPadOrOrb = $true }
                }
            }
            if ($lvl.jumpPads) {
                foreach ($jp in $lvl.jumpPads) {
                    if ($jp.x -ge ($pit.startX - 100) -and $jp.x -le ($pit.endX + 100)) { $hasPadOrOrb = $true }
                }
            }
            $status = if ($w -le ($maxJump - 40.0) -or $hasPadOrOrb) { "OK" } else { "PERIGO: LARGURA $w px > SALTO MAX $([math]::Round($maxJump, 1)) px SEM AUXILIO!" }
            Write-Output "L${id}: Pit [X=$($pit.startX)..$($pit.endX)] Largura: $w px | Salto Max: $([math]::Round($maxJump, 1)) px | Auxilio: $hasPadOrOrb | Status: $status"
        }
    }
}
