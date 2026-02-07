
#!/bin/bash
echo "Starting Dotnet Watch Test..."
echo "This will auto-run tests when files change."
echo "Press Ctrl+C to stop."

# Run dotnet watch test on the solution
dotnet watch test --project "tests/modules/Catalogs/Catalogs.UnitTests/FoodDelivery.Modules.Catalogs.UnitTests.csproj"
