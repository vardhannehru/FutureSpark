param(
  [Parameter(Mandatory=$true)][string]$Query,
  [Parameter(Mandatory=$true)][string]$OutFile,
  [int]$Width = 1400
)

$ErrorActionPreference = 'Stop'

$api = 'https://commons.wikimedia.org/w/api.php'
$params = @{
  action = 'query'
  format = 'json'
  prop = 'imageinfo'
  iiprop = 'url'
  iiurlwidth = $Width
  generator = 'search'
  gsrsearch = $Query
  gsrnamespace = 6
  gsrlimit = 1
}

$res = Invoke-RestMethod -Method Get -Uri $api -Body $params
if (-not $res.query -or -not $res.query.pages) {
  throw "No result for query: $Query"
}
$page = $res.query.pages.PSObject.Properties.Value | Select-Object -First 1
$ii = $page.imageinfo[0]
$url = if ($ii.thumburl) { $ii.thumburl } else { $ii.url }
Write-Host "Downloading: $url"
Invoke-WebRequest -Uri $url -OutFile $OutFile -MaximumRedirection 10
