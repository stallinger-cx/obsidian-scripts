Get-ChildItem -Recurse -Filter *.md |
Where-Object { $_.FullName -notmatch '[\\/]\.trash([\\/]|$)' } |
ForEach-Object {

    $content = Get-Content $_.FullName -Raw

    # Nur Dateien mit Frontmatter und sync:
    if ($content -notmatch '(?s)^---\r?\n(?<fm>.*?)\r?\n---') {
        return
    }

    $frontmatter = $Matches.fm

    if ($frontmatter -notmatch '(?m)^sync:') {
        return
    }

    if ($frontmatter -match '(?m)^id:\s*(?<id>.+)$') {

        $id = $Matches.id.Trim()

        # Bereits UUID?
        if ($id -match '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$') {
            return
        }

        $uuid = [guid]::NewGuid().ToString()

        $content = $content -replace '(?m)^id:\s*.*$', "id: $uuid"

        Set-Content $_.FullName $content -Encoding UTF8

        Write-Host "$($_.FullName)"
        Write-Host "  $id -> $uuid"
    }
}
