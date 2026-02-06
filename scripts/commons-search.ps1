param(
  [Parameter(Mandatory=$true)][string]$Query,
  [int]$Limit = 8
)

$api = 'https://commons.wikimedia.org/w/api.php'
$params = @{
  action = 'query'
  format = 'json'
  prop = 'imageinfo'
  iiprop = 'url|size'
  generator = 'search'
  gsrsearch = $Query
  gsrnamespace = 6
  gsrlimit = $Limit
}

$res = Invoke-RestMethod -Method Get -Uri $api -Body $params
if (-not $res.query -or -not $res.query.pages) {
  Write-Host 'No results'
  exit 0
}

$pages = $res.query.pages.PSObject.Properties.Value
$rows = foreach ($p in $pages) {
  $ii = $p.imageinfo[0]
  [pscustomobject]@{
    title = $p.title
    width = $ii.width
    height = $ii.height
    url = $ii.url
  }
}
$rows | Sort-Object width -Descending | Format-Table -AutoSize
