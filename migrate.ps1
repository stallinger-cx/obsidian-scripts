$vault = "C:\Users\mj\Obsidian\Continuum\archives\notes"

$firstAlphabet = "abcdefghijklmnopqrstuvwxyz"
$alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"

function New-NanoId {

    $id = $firstAlphabet[(Get-Random -Maximum $firstAlphabet.Length)]

    for($i = 1; $i -lt 21; $i++) {
        $id += $alphabet[(Get-Random -Maximum $alphabet.Length)]
    }

    return $id
}

Get-ChildItem $vault -Recurse -Filter *.md | ForEach-Object {

    $file = $_.FullName

    $content = [System.IO.File]::ReadAllText($file)

    # Zeilenende erkennen
    $nl = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }

    $lines = $content.Replace("`r`n","`n").Split("`n")
    $nl = if($content.Contains("`r`n")) { "`r`n" } else { "`n" }

    if($lines.Count -lt 3) { return }

    if($lines[0] -ne "---") { return }

    # Ende des Frontmatters suchen
    $end = -1

    for($i = 1; $i -lt $lines.Count; $i++) {
        if($lines[$i] -eq "---") {
            $end = $i
            break
        }
    }

    if($end -lt 0) {
        Write-Warning "$file : Kein Ende des Frontmatters gefunden."
        return
    }

    $frontmatter = @()

    for($i = 1; $i -lt $end; $i++) {
        $frontmatter += $lines[$i]
    }

    $hasId = $false
    $hasSync = $false

    foreach($line in $frontmatter) {

        if($line.StartsWith("id:")) {
            $hasId = $true
        }

        if($line.StartsWith("sync:")) {
            $hasSync = $true
        }
    }

    #
    # Sync bestimmen
    #

    $relative = $file.Substring($vault.Length).TrimStart('\')
    $parts = $relative.Split('\')

    if($parts.Length -le 1) {
        $sync = ""
    }
    elseif($parts[0].StartsWith("_")) {
        $sync = ""
    }
    else {
        $sync = $parts[0]
    }

    $newFrontmatter = @()

    if(-not $hasId) {
        $newFrontmatter += "id: $(New-NanoId)"
    }

    if(-not $hasSync) {
        $newFrontmatter += "sync: $sync"
    }

    $newFrontmatter += $frontmatter

    #
    # Datei neu zusammensetzen
    #

    $newLines = @()

    $newLines += "---"
    $newLines += $newFrontmatter
    $newLines += "---"

    for($i = $end + 1; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
    }

    $newContent = $newLines -join $nl

    if($newContent -ne $content) {

        [System.IO.File]::WriteAllText(
            $file,
            $newContent,
            [System.Text.UTF8Encoding]::new($false)
        )

        Write-Host "✔ $($_.Name)"
    }

}
