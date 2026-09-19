# Open Source Islamic Learning Platform - Local Server & Launcher
param(
    [int]$Port = 8080
)

$baseDir = $PSScriptRoot
$url = "http://localhost:$Port/"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Al-Noor Open Source Islamic Learning Platform" -ForegroundColor Yellow
Write-Host "  Running on: $url" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Open in Chrome or Edge directly
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (Test-Path $chromePath) {
    Start-Process $chromePath $url
} elseif (Test-Path $edgePath) {
    Start-Process $edgePath $url
} else {
    Start-Process $url
}

# Start HTTP Listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Server listening on port $Port... Press Ctrl+C to stop." -ForegroundColor Gray

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath)) {
            $relPath = "index.html"
        }
        if ($relPath -eq "db-explorer" -or $relPath -eq "db-explorer/") {
            $relPath = "db-explorer.html"
        }

        $localPath = Join-Path $baseDir $relPath

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".mp3"  { "audio/mpeg" }
                ".pdf"  { "application/pdf" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
