$ErrorActionPreference = "Continue"

Write-Host "Installing ReportGenerator global tool..."
try {
    dotnet tool install -g dotnet-reportgenerator-globaltool
} catch {
    Write-Host "ReportGenerator might already be installed."
}

$ErrorActionPreference = "Stop"

Write-Host "Running tests and collecting coverage..."
if (Test-Path "TestResults") { Remove-Item "TestResults" -Recurse -Force }

# Run tests for the entire solution
dotnet test food-delivery-modular-monolith.sln --collect:"XPlat Code Coverage" --results-directory "TestResults"

# Find report files
$reports = Get-ChildItem -Path "TestResults" -Recurse -Filter "coverage.cobertura.xml" | Select-Object -ExpandProperty FullName

if ($reports) {
    Write-Host "Generating Coverage Reports..."
    
    $targetDir = "TestResults/CoverageReport"
    
    # Check if reportgenerator is in PATH, if not try default location
    $rg = "reportgenerator"
    $rgPath = $rg
    
    if (-not (Get-Command $rg -ErrorAction SilentlyContinue)) {
        $userProfile = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::UserProfile)
        $rgPath = "$userProfile\.dotnet\tools\reportgenerator.exe"
    }

    if (Test-Path $rgPath -PathType Leaf -ErrorAction SilentlyContinue -Or (Get-Command $rgPath -ErrorAction SilentlyContinue)) {
         & $rgPath -reports:"$reports" -targetdir:"$targetDir" -reporttypes:"Html;TextSummary;MarkdownSummary"
         
         Write-Host "Report generated at: $targetDir/index.html"
         Write-Host "Summary text generated at: $targetDir/Summary.txt"
    } else {
        Write-Error "ReportGenerator not found in PATH or ~/.dotnet/tools."
    }

} else {
    Write-Host "No coverage files found."
}
