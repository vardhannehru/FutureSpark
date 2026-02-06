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

$replacements = @(
  @{ file = 'science-lab.jpg'; q = '"Graduate Chemistry Laboratory (3964339373).jpg" filemime:image/jpeg' },
  @{ file = 'library.jpg'; q = '"Pine Crest School student reading in the library" filemime:image/jpeg' },
  @{ file = 'dance.jpg'; q = '"New Zealand - Dance class - 9580.jpg" filemime:image/jpeg' }
)

foreach ($r in $replacements) {
  $url = Get-FirstCommonsImageUrl $r.q
  if (-not $url) {
    Write-Warning "No result for: $($r.q)"
    continue
  }
  $dest = Join-Path $outDir $r.file
  Write-Host "Downloading: $url"
  Invoke-WebRequest -Uri $url -OutFile $dest -MaximumRedirection 10
  Write-Host "Saved: $dest"
}
