# UpdateBuildNumber [newVersionString or newMajorVersion] [newMinorVersion]
param(
    [ValidatePattern('^\d+(.\d+)?$')]
    [Alias('Version', 'Ver')]
    [string]
    $Major,
    [ValidatePattern('^\d+$')]
    [string]
    $Minor
    )

if ($Major -match '^\d+\.\d+$') {
    # override new version setting parameter
    ($Major, $Minor) = $Major -split '\.'
}

# parse package.json
$packageJson = (get-content -Encoding UTF8 .\package.json | ConvertFrom-Json -AsHashtable )
$version = $packageJson.version -split '\.'

# set new build number
if ($Major) {
    if ($Major -gt $version[0]) {
        $Minor = '0'
    }
    $version[0] = $Major
}
if ($Minor) { $version[1] = $Minor }
$version[2] = (((Get-Date) - (Get-Date 2020-01-01)).Days).toString()

$packageJson.version = $version -join '.'

write-host 'Update version to' $packageJson.version

$packageJson | ConvertTo-Json | set-content -Encoding UTF8 .\package.json
