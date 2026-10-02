# Validar todos os arquivos JS
$files = Get-ChildItem -Path ".\js\*.js"
Write-Host "=== VERIFICAÇÃO DOS ARQUIVOS JAVASCRIPT ===" -ForegroundColor Cyan
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $lineCount = ($content -split "`n").Count
    Write-Host "[OK] $($f.Name) : $lineCount linhas, $($content.Length) bytes" -ForegroundColor Green
}
