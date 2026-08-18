# rename-audio-video-folders.ps1
#
# Renames sample-files/audio/<ext>/ and sample-files/video/<ext>/ subfolders
# to the sample-<ext>-file/ convention the Manager/site expects everywhere
# else (see builder.py's format_dirname()). Safe to run more than once —
# it skips anything already renamed or already missing.
#
# USAGE
#   Easiest: right-click this file in File Explorer -> "Run with PowerShell"
#   (make sure it's saved inside/next to your project folder first, or edit
#   the $SampleFilesPath line below to point at it).
#
#   Or from a PowerShell terminal:
#     cd D:\getsampledata3
#     powershell -ExecutionPolicy Bypass -File .\rename-audio-video-folders.ps1
#
#   To point it at a different location instead of editing the script:
#     powershell -ExecutionPolicy Bypass -File .\rename-audio-video-folders.ps1 -SampleFilesPath "D:\getsampledata3\sample-files"

param(
    [string]$SampleFilesPath = "D:\getsampledata3\sample-files"
)

$AudioExts = @("aac","aiff","alac","flac","m4a","mp3","ogg","opus","wav","wma")
$VideoExts = @("avi","m2ts","m4v","mkv","mov","mp4","mpeg","mpg","mts","mxf","ts","vob","webm","wmv")

function Rename-FormatFolders {
    param([string]$CategoryPath, [string[]]$Exts, [string]$CategoryName)

    if (-not (Test-Path $CategoryPath)) {
        Write-Host "SKIP: $CategoryPath not found" -ForegroundColor Yellow
        return
    }

    foreach ($ext in $Exts) {
        $old = Join-Path $CategoryPath $ext
        $new = Join-Path $CategoryPath "sample-$ext-file"

        if (Test-Path $new) {
            Write-Host "OK (already renamed): $CategoryName/$ext -> sample-$ext-file" -ForegroundColor Green
            continue
        }
        if (-not (Test-Path $old)) {
            Write-Host "MISSING: $CategoryName/$ext not found - skipped (nothing to rename)" -ForegroundColor Yellow
            continue
        }
        Rename-Item -Path $old -NewName "sample-$ext-file"
        Write-Host "RENAMED: $CategoryName/$ext -> sample-$ext-file" -ForegroundColor Cyan
    }
}

Write-Host "Sample-files path: $SampleFilesPath"
Write-Host ""

Rename-FormatFolders -CategoryPath (Join-Path $SampleFilesPath "audio") -Exts $AudioExts -CategoryName "audio"
Rename-FormatFolders -CategoryPath (Join-Path $SampleFilesPath "video") -Exts $VideoExts -CategoryName "video"

Write-Host ""
Write-Host "Done. Now run a Data Integrity 'Scan Now' in the Manager to confirm everything's clean." -ForegroundColor White
