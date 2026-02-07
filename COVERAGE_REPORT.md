# Code Coverage Report

## Executive Summary
**Generated on:** 2/7/2026
**Overall Line Coverage:** 4.3%
**Note:** This report reflects a **partial test run** (focusing on `Catalogs` module) due to environment limitations (disk space). The coverage infrastructure is fully functional and can generate complete reports when run in an environment with sufficient resources.

## Module Coverage

| Module | Line Coverage | Branch Coverage | Notes |
| :--- | :--- | :--- | :--- |
| **FoodDelivery.Modules.Catalogs** | **14.3%** | **6.7%** | Primary focus of current testing suite. |
| BuildingBlocks.Core | 3.1% | 2.4% | Covered incidentally by Catalogs tests. |
| FoodDelivery.Modules.Orders | 0% | 0% | Tests not executed in this run. |
| FoodDelivery.Modules.Customers | 0% | 0% | Tests not executed in this run. |

## Key Files with Low Coverage (< 80%)

### Catalogs Module
- `CreateProductHandler`: 20.4% - Needs more scenario tests (validation failures, etc).
- `GetProductsHandler`: 35.7% - Pagination and filtering logic validation needed.
- `Product`: 50% - Domain logic needs deeper testing.
- `ProductBuilder`: 0% - Test helpers should be tested or excluded from coverage.

### Infrastructure (BuildingBlocks)
- Most infrastructure code is uncovered. This is expected in unit tests but should be covered by Integration Tests.

## Recommendations

1.  **Environment Optimization**:
    - Ensure sufficient disk space (> 2GB free) to run the full `dotnet test` suite and generate comprehensive reports.
    - Use `dotnet clean` regularly in CI environments.

2.  **Test Expansion**:
    - **Catalogs**: Focus on `CommandHandlers` and `Domain Events`.
    - **Orders & Customers**: Implement corresponding unit tests (currently 0% in this report).

3.  **Tooling usage**:
    - Use the provided `scripts/test-coverage.ps1` (or `.sh`) to generate this report.
    - View `TestResults/CoverageReport/index.html` for line-by-line analysis.
