# Testar sintaxe dos arquivos JavaScript usando o engine ScriptControl ou Edge/PowerShell
$files = Get-ChildItem -Path ".\js\*.js"
Write-Host "=== TESTE DE SINTAXE JAVASCRIPT ===" -ForegroundColor Cyan

foreach ($f in $files) {
    $code = Get-Content $f.FullName -Raw
    # Verificar parênteses, colchetes e chaves balanceados
    $parenOpen = ($code.ToCharArray() | Where-Object { $_ -eq '(' }).Count
    $parenClose = ($code.ToCharArray() | Where-Object { $_ -eq ')' }).Count
    $braceOpen = ($code.ToCharArray() | Where-Object { $_ -eq '{' }).Count
    $braceClose = ($code.ToCharArray() | Where-Object { $_ -eq '}' }).Count
    $bracketOpen = ($code.ToCharArray() | Where-Object { $_ -eq '[' }).Count
    $bracketClose = ($code.ToCharArray() | Where-Object { $_ -eq ']' }).Count
    
    $ok = ($parenOpen -eq $parenClose) -and ($braceOpen -eq $braceClose) -and ($bracketOpen -eq $bracketClose)
    if ($ok) {
        Write-Host "  [SYNTAX OK] $($f.Name): () = $parenOpen, {} = $braceOpen, [] = $bracketOpen" -ForegroundColor Green
    } else {
        Write-Host "  [SYNTAX ERRO] $($f.Name): ()$parenOpen/$parenClose, {}$braceOpen/$braceClose, []$bracketOpen/$bracketClose" -ForegroundColor Red
    }
}
