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

  if (-not $res.query -or -not $res.query.pages) {
    return $null
  }

  $page = $res.query.pages.PSObject.Properties.Value | Select-Object -First 1
  if (-not $page.imageinfo -or -not $page.imageinfo[0].url) {
    return $null
  }

  return $page.imageinfo[0].url
}

$items = @(
  @{ key = 'science';  file = 'science-lab.jpg';   q = 'classroom science laboratory students' },
  @{ key = 'sports';   file = 'sports.jpg';        q = 'school sports students playing' },
  @{ key = 'art';      file = 'art-craft.jpg';     q = 'children art class drawing craft classroom' },
  @{ key = 'dance';    file = 'dance.jpg';         q = 'children dance class school' },
  @{ key = 'music';    file = 'music.jpg';         q = 'children music class school' },
  @{ key = 'field';    file = 'field-trips.jpg';   q = 'school field trip students museum' },
  @{ key = 'library';  file = 'library.jpg';       q = 'school library books students' },
  @{ key = 'computer'; file = 'computer-lab.jpg';  q = 'computer lab students classroom' }
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
