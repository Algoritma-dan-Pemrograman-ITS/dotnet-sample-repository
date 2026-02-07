Langkah 1 

Tolong analisis struktur project .NET modular monolith ini:

1. List semua module yang ada (Catalogs, Orders, Customers, dll)
2. Cari dan identifikasi file test yang sudah ada
3. Identifikasi module mana yang belum punya unit test
4. Buatkan report sederhana dalam format markdown

Simpan hasilnya di file TESTING_ANALYSIS.md

Langkah 2.1

Buatkan test project untuk semua module yang belum punya unit test:

1. Buat folder Tests/ di root jika belum ada
2. Untuk setiap module tanpa test, buat project xUnit dengan struktur:
   - Tests/Modules/{ModuleName}/{ModuleName}.UnitTests/
   
3. Install packages berikut di setiap test project:
   - xUnit (versi terbaru)
   - xUnit.runner.visualstudio
   - NSubstitute (untuk mocking)
   - FluentAssertions (untuk assertion yang readable)
   - AutoFixture (untuk generate test data)
   
4. Setup project references ke module yang akan ditest

5. Buatkan file Directory.Build.props di folder Tests/ untuk centralized package management

Konfirmasi dulu sebelum execute, dan tunjukkan apa yang akan dibuat

Langkah 2.2

Buatkan base test classes yang reusable untuk semua test:

1. Di Tests/Common/TestBase/ buat:
   - CommandHandlerTestBase.cs - untuk test command handlers
   - QueryHandlerTestBase.cs - untuk test query handlers
   - UnitTestBase.cs - base class umum
   
2. Setup di base class:
   - AutoFixture instance untuk generate test data
   - Helper methods untuk create mocks
   - Common assertions
   
3. Gunakan pattern AAA (Arrange-Act-Assert)

4. Include XML documentation untuk setiap class

Tunjukkan preview kode sebelum dibuat

Langkah 3.1

Mulai buat unit test untuk Domain Layer di Catalogs module:

1. Fokus ke entities dan value objects di folder Domain/
2. Test business rules dan validations
3. Untuk setiap entity, test:
   - Constructor dan factory methods
   - Property validations
   - Business rule enforcement
   - Domain events yang di-raise
   
4. Gunakan theory untuk test multiple scenarios
5. Include negative test cases

Mulai dari Product entity. Tunjukkan 3-5 test cases sebagai contoh dulu

Langkah 3.2

Sekarang generate unit test yang serupa untuk semua entity lain di Catalogs module:

1. Scan folder Domain/ untuk find semua entities
2. Untuk setiap entity, buat test file dengan pattern yang sama
3. Pastikan coverage untuk:
   - Happy path scenarios
   - Edge cases
   - Validation failures
   - Domain events
   
4. Organize tests dalam folders yang mirror struktur Domain/

Eksekusi satu per satu dan tunjukkan progress

Langkah 4.1

Buat comprehensive unit tests untuk Command Handlers di Catalogs module:

1. Identify semua commands di Features/ folder
2. Untuk setiap CommandHandler, test:
   - Success scenario dengan valid input
   - Validation failures
   - Repository interactions (mock dengan NSubstitute)
   - Unit of Work commit
   - Domain events handling
   - Exception scenarios
   
3. Mock semua dependencies:
   - IRepository
   - IUnitOfWork
   - IDomainEventPublisher
   - Validators
   
4. Mulai dari CreateProductCommandHandler

Tunjukkan template test-nya dulu

Langkah 4.2

Generate unit tests untuk semua Command Handlers yang ada:

1. Scan Features/**/Commands/ untuk find semua handlers
2. Untuk setiap handler, generate test file dengan pattern yang sama
3. List handlers yang ditemukan dan konfirmasi sebelum generate
4. Create summary report setelah selesai:
   - Total handlers tested
   - Total test cases created
   - Coverage percentage estimate

Eksekusi step by step

Langkah 5

Buat unit tests untuk Query Handlers:

1. Test GetProductByIdQueryHandler dengan scenarios:
   - Product found - return product
   - Product not found - return null atau NotFound
   - Repository exception - handle gracefully
   
2. Test GetProductsQueryHandler dengan:
   - Empty list
   - Paginated results
   - Filtering
   - Sorting
   
3. Mock IProductReadRepository

Mulai dari GetProductByIdQueryHandler

Langkah 6

Buat tests untuk Integration Event Handlers:

1. Identify event handlers di IntegrationEvents/ folder
2. Test event handling logic:
   - Event deserialization
   - Business logic execution
   - Side effects (repo calls, publishing events)
   - Idempotency (jangan process event yang sama 2x)
   
3. Mock event bus dan repositories

Fokus ke ProductCreatedEventHandler dulu

Langkah 7.1

Setup code coverage reporting:

1. Install coverlet.collector di semua test projects
2. Install ReportGenerator global tool
3. Buatkan bash/powershell script untuk:
   - Run semua tests
   - Collect coverage
   - Generate HTML report
   
4. Setup GitHub Actions workflow (optional) untuk run tests di CI/CD

Simpan script di folder scripts/test-coverage.sh

Langkah 7.2

Run semua tests dan generate coverage report:

1. Execute test coverage script
2. Analyze hasil coverage
3. Buatkan summary report dengan:
   - Overall coverage percentage
   - Coverage per module
   - Files dengan coverage < 80%
   - Recommendations untuk improve coverage

Simpan report di COVERAGE_REPORT.md

Langkah 8.1

Review semua test files dan ensure naming consistency:

1. Test class names: {ClassName}Tests
2. Test method names: {MethodName}_{Scenario}_{ExpectedBehavior}
3. Refactor jika ada yang tidak konsisten
4. Buatkan dokumen guideline di TESTING_GUIDELINES.md

Langkah 8.2

Buat Test Data Builders untuk reduce test setup boilerplate:

1. Di Tests/Common/Builders/ buat builders untuk:
   - ProductBuilder
   - OrderBuilder
   - CustomerBuilder
   
2. Pattern: Fluent API dengan method chaining
3. Include both valid dan invalid data presets

Contoh:
var product = new ProductBuilder()
    .WithName("Pizza")
    .WithPrice(15.99m)
    .Build();

Langkah 9.1

Setup test watch mode untuk development:

1. Buatkan script watch-tests.sh yang:
   - Run dotnet watch test
   - Auto-run tests ketika code berubah
   - Show hasil di terminal
   
2. Configure untuk run hanya tests yang affected oleh changes

Langkah 9.2

Setup Git pre-commit hook untuk run tests:

1. Install Husky.Net atau setup manual git hooks
2. Run affected tests sebelum commit
3. Block commit jika tests fail
4. Show clear error messages

Simpan config di .husky/ folder

Langkah 10.1

Buatkan dokumentasi lengkap testing:

1. README.md di folder tests/ dengan:
   - Overview testing strategy
   - How to run tests
   - How to add new tests
   - Naming conventions
   - Best practices
   
2. Include code examples
3. Add troubleshooting section
4. Link to coverage reports

Langkah 10.2

Buatkan test checklist berdasarkan guideline:

1. Create TESTING_CHECKLIST.md
2. Include checklist untuk:
   - Unit tests untuk domain entities
   - Unit tests untuk command handlers
   - Unit tests untuk query handlers
   - Unit tests untuk validators
   - Integration event handler tests
   - Edge cases covered
   - Negative scenarios tested
   - Code coverage > 80%
   - All tests passing
   - Test names follow convention