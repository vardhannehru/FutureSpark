$ErrorActionPreference = 'Stop'

$outDir = 'C:\Users\vardh\OneDrive\Desktop\School WEBBY\components\images\infrastructure\photos'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

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

$items = @(
  @{ file = 'science-lab.jpg';  q = 'modern school science laboratory students filemime:image/jpeg' },
  @{ file = 'sports.jpg';       q = 'school sports students playing 2019 filemime:image/jpeg' },
  @{ file = 'art-craft.jpg';    q = 'children art class painting 2018 filemime:image/jpeg' },
  @{ file = 'dance.jpg';        q = 'school dance class students 2019 filemime:image/jpeg' },
  @{ file = 'music.jpg';        q = 'school music class students 2019 filemime:image/jpeg' },
  @{ file = 'field-trips.jpg';  q = 'students field trip museum 2019 filemime:image/jpeg' },
  @{ file = 'library.jpg';      q = 'modern school library students filemime:image/jpeg' },
  @{ file = 'computer-lab.jpg'; q = 'modern computer lab students filemime:image/jpeg' }
)

foreach ($it in $items) {
  Write-Host "Searching: $($it.q)"
  $url = Get-FirstCommonsImageUrl -query $it.q
  if (-not $url) {
    Write-Warning "No result for: $($it.q)"
    continue
  }
  $dest = Join-Path $outDir $it.file
  Write-Host "Downloading: $url"
  Invoke-WebRequest -Uri $url -OutFile $dest -MaximumRedirection 10
  Write-Host "Saved: $dest"
}
