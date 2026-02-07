#!/bin/bash
set -e

echo "Installing ReportGenerator global tool..."
dotnet tool install -g dotnet-reportgenerator-globaltool || true

echo "Running tests and collecting coverage..."
# Remove previous results
rm -rf TestResults

# Run tests with coverlet collector
dotnet test tests/modules/Catalogs/Catalogs.UnitTests/FoodDelivery.Modules.Catalogs.UnitTests.csproj \
    --collect:"XPlat Code Coverage" \
    --results-directory TestResults

echo "Generating HTML report..."
reportgenerator \
    -reports:"TestResults/**/coverage.cobertura.xml" \
    -targetdir:"TestResults/CoverageReport" \
    -reporttypes:Html

echo "Report generated at: TestResults/CoverageReport/index.html"
