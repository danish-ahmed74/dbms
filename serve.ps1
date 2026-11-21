# Lightweight static server using built-in .NET HttpListener
$port = 5500
$path = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "====================================================" -ForegroundColor Red
Write-Host " RedPulse Web Server running at http://localhost:$port/" -ForegroundColor Green
Write-Host " Press Ctrl+C in this window to stop the server." -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Red

Start-Process "http://localhost:$port/"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($urlPath)) { $urlPath = "index.html" }
    $localFile = Join-Path $path $urlPath

    if (Test-Path $localFile -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($localFile)
        $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
        $contentType = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".json" { "application/json; charset=utf-8" }
            ".png"  { "image/png" }
            ".jpg"  { "image/jpeg" }
            ".svg"  { "image/svg+xml" }
            ".pdf"  { "application/pdf" }
            Default { "application/octet-stream" }
        }
        $response.ContentType = $contentType
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $notFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($notFoundMsg, 0, $notFoundMsg.Length)
    }
    $response.Close()
}
