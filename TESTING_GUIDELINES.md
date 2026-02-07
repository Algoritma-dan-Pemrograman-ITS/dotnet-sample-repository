# Testing Guidelines

## 1. General Principles
- **Unit Tests Only**: Domain and Application layer tests should not depend on external infrastructure or databases (use In-Memory or Mocks).
- **Naming Conventions**: Strict adherence to the `Method_Scenario_Behavior` pattern is required for consistency.

## 2. Naming Conventions

### 2.1 Test Classes
- **Format**: `{ClassName}Tests`
- **Example**: `ProductTests`, `CreateProductCommandHandlerTests`

### 2.2 Test Methods
- **Format**: `{MethodName}_{Scenario}_{ExpectedBehavior}`
- **Components**:
  - `MethodName`: The name of the method being tested (e.g., `Handle`, `Create`, `DebitStock`).
  - `Scenario`: The condition or state under which the test is running (e.g., `WhenRequestIsValid`, `WhenStockInsufficient`). Prepend with `When` or use descriptive adjectives.
  - `ExpectedBehavior`: What the method implies or returns. Start with verbs or `Should` (e.g., `ShouldReturnId`, `ShouldThrowException`).

#### Examples:
| Current/Bad | **Correct Standard** |
|-------------|----------------------|
| `Handle_ShouldReturnId_WhenRequestIsValid` | `Handle_WhenRequestIsValid_ShouldReturnId` |
| `Create_ValidInput_ReturnsProduct` | `Create_WhenInputIsValid_ShouldReturnProduct` |
| `DebitStock_Insufficient_Exception` | `DebitStock_WhenStockIsInsufficient_ShouldThrowException` |

## 3. Structure (AAA Pattern)
All tests must follow the Arrange-Act-Assert structure:
```csharp
[Fact]
public void Method_Scenario_Behavior()
{
    // Arrange
    var input = ...;

    // Act
    var result = _sut.Method(input);

    // Assert
    result.Should().Be(...);
}
```

## 4. Tools & Libraries
- **Framework**: xUnit
- **Assertions**: FluentAssertions
- **Mocking**: NSubstitute
- **Data Generation**: AutoFixture (optional but recommended for complex objects)
