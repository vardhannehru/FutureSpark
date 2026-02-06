$ErrorActionPreference = 'Stop'

$dir = "C:\Users\vardh\OneDrive\Desktop\School WEBBY\components\images\gallery\annual-day-2026"

if (-not (Test-Path -LiteralPath $dir)) {
  throw "Folder not found: $dir"
}

$files = Get-ChildItem -LiteralPath $dir -Filter 'ad2026-*.webp' -File | Sort-Object Name

# First pass: rename to temporary names to avoid collisions
$i = 1
foreach ($f in $files) {
  $newName = ('ad2026-{0}.webp' -f $i.ToString('00'))
  $tmpName = ('__tmp__' + $newName)
  Rename-Item -LiteralPath $f.FullName -NewName $tmpName -Force
  $i++
}

# Second pass: remove temp prefix
$tmpFiles = Get-ChildItem -LiteralPath $dir -Filter '__tmp__ad2026-*.webp' -File | Sort-Object Name
foreach ($t in $tmpFiles) {
  $finalName = $t.Name -replace '^__tmp__', ''
  Rename-Item -LiteralPath $t.FullName -NewName $finalName -Force
}

Get-ChildItem -LiteralPath $dir -Filter 'ad2026-*.webp' -File | Sort-Object Name | Select-Object -ExpandProperty Name
