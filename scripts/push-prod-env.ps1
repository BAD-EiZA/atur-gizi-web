# Push production env to Vercel from a local env file (defaults: .env.production.local then .env.example)
param(
  [string]$EnvFile = ""
)

if (-not $EnvFile) {
  if (Test-Path ".env.production.local") { $EnvFile = ".env.production.local" }
  elseif (Test-Path ".env.example") { $EnvFile = ".env.example" }
  else { Write-Error "No env file"; exit 1 }
}

Write-Host "Using $EnvFile"

$overrides = @{
  'NEXT_PUBLIC_APP_URL' = 'https://atur-gizi-web.vercel.app'
  'NEXT_PUBLIC_API_BASE_URL' = 'https://atur-gizi-api.vercel.app'
  'NEXT_PUBLIC_DEV_AUTH' = 'false'
  'KINDE_SITE_URL' = 'https://atur-gizi-web.vercel.app'
  'KINDE_POST_LOGIN_REDIRECT_URL' = 'https://atur-gizi-web.vercel.app/dashboard'
  'KINDE_POST_LOGOUT_REDIRECT_URL' = 'https://atur-gizi-web.vercel.app'
}

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { return }
  $key = $line.Substring(0, $idx).Trim()
  $val = $line.Substring($idx + 1).Trim().Trim('"')
  if ($overrides.ContainsKey($key)) { $val = $overrides[$key] }
  if ([string]::IsNullOrWhiteSpace($val)) {
    Write-Host "skip empty $key"
    return
  }
  Write-Host "set $key"
  & vercel env rm $key production -y 2>$null | Out-Null
  $val | & vercel env add $key production 2>&1 | Out-Null
}

Write-Host "Done"
