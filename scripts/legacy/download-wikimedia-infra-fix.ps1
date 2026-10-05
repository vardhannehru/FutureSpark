$ErrorActionPreference = 'Stop'

$outDir = 'C:\Users\vardh\OneDrive\Desktop\School WEBBY\components\images\infrastructure\photos'

function Get-FirstCommonsImageUrl([string]$query) {
  $api = 'https://commons.wikimedia.org/w/api.php'
  $params = @{
    action = 'query'
    format = 'json'
    prop = 'imageinfo'
    iiprop = 'url'
    generator = 'search'
    gsrsearch = $query
    gsrnamespace = 6
    gsrlimit = 1
  }

  $res = Invoke-RestMethod -Method Get -Uri $api -Body $params

  if (-not $res.query -or -not $res.query.pages) { return $null }
  $page = $res.query.pages.PSObject.Properties.Value | Select-Object -First 1
  if (-not $page.imageinfo -or -not $page.imageinfo[0].url) { return $null }
  return $page.imageinfo[0].url
}

$artUrl = Get-FirstCommonsImageUrl 'children art class painting filemime:image/jpeg'
$musicUrl = Get-FirstCommonsImageUrl 'children music class school filemime:image/jpeg'

if ($artUrl) {
  Write-Host "Downloading art: $artUrl"
  Invoke-WebRequest -Uri $artUrl -OutFile (Join-Path $outDir 'art-craft.jpg') -MaximumRedirection 10
}

if ($musicUrl) {
  Write-Host "Downloading music: $musicUrl"
  Invoke-WebRequest -Uri $musicUrl -OutFile (Join-Path $outDir 'music.jpg') -MaximumRedirection 10
}
