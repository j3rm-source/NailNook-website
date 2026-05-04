$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"

Set-Location $PSScriptRoot
npm install
npm run dev
