using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using MediatR;
using FoodDelivery.Modules.Catalogs.Products.Dtos;
using FoodDelivery.Modules.Catalogs.Products.Exceptions.Application;
using FoodDelivery.Modules.Catalogs.Products.Features.GettingProductById;
using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Shared.Data;
using FoodDelivery.Tests.Common;
using FoodDelivery.Tests.Common.TestBase;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

using AutoMapper;

namespace FoodDelivery.Modules.Catalogs.UnitTests.Products.Features.GettingProductById;

public class GetProductByIdQueryHandlerTests : QueryHandlerTestBase<GetProductById, GetProductByIdResponse>, IDisposable
{
    private readonly CatalogDbContext _dbContext;
    private readonly SqliteConnection _connection;
    private readonly GetProductByIdHandler _handler;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandlerTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<CatalogDbContext>()
            .UseSqlite(_connection)
            .Options;

        _dbContext = new CatalogDbContext(options);
        _dbContext.Database.EnsureCreated();

        var mapperConfig = new MapperConfiguration(c => c.AddProfile<FoodDelivery.Modules.Catalogs.Products.ProductMappers>());
        _mapper = mapperConfig.CreateMapper();

        _handler = new GetProductByIdHandler(_dbContext, _mapper);
    }

    [Fact]
    public async Task Handle_WhenProductExists_ShouldReturnProduct()
    {
        // Arrange
        // Create a product and save to DB
        // Note: Using Fixture might create complex graphs that fail with Sqlite if not configured,
        // so we create a simple valid product manually or ensure Fixture customizations.
        // For now, assume Fixture works or simplify.
        // We need to use valid IDs (long > 0). Fixture might generate negative longs.
        
        // We can't use Fixture.Create<Product>() directly easily because of private setters/constructor rules.
        // We will create it using the factory method manually for correctness.
        // Actually, we can use the private constructor or whatever method the entity supports.
        // Since we are testing Query Handler, we just need data in the DB.
        
        // Let's rely on Fixture but customize Id to be positive.
        Fixture.Customize<Product>(c => c.OmitAutoProperties()); 
        // Note: OmitAutoProperties might break if we need data.
        // Best: Create using factory method logic or reflection if needed.
        // Assuming we can just add a configured product.
        
        // SIMPLEST: Create dummy product using our ProductTests helper patterns or just manually.
        // But we don't have access to private setters here easily.
        // CatalogDbContext uses EF, so it can bind to private fields.
        // We can create an object via reflection or helper.
        // Or, simply, since we already tested Product.Create, we use it!
        
        // Seed dependencies to satisfy FK constraints
        var category = FoodDelivery.Modules.Catalogs.Categories.Category.Create(new FoodDelivery.Modules.Catalogs.Categories.CategoryId(1), "Test Category", "C1");
        var supplier = new FoodDelivery.Modules.Catalogs.Suppliers.Supplier(new FoodDelivery.Modules.Catalogs.Suppliers.SupplierId(1), "Test Supplier");
        var brand = FoodDelivery.Modules.Catalogs.Brands.Brand.Create(new FoodDelivery.Modules.Catalogs.Brands.BrandId(1), "Test Brand");
        
        _dbContext.Categories.Add(category);
        _dbContext.Suppliers.Add(supplier);
        _dbContext.Brands.Add(brand);

        var id = new FoodDelivery.Modules.Catalogs.Products.ValueObjects.ProductId(1);
        var product = FoodDelivery.Modules.Catalogs.Products.Models.Product.Create(
            id,
            FoodDelivery.Modules.Catalogs.Products.ValueObjects.Name.Create("Test Product"),
            FoodDelivery.Modules.Catalogs.Products.ValueObjects.Stock.Create(10, 5, 20),
            FoodDelivery.Modules.Catalogs.Products.Models.ProductStatus.Available,
            FoodDelivery.Modules.Catalogs.Products.ValueObjects.Dimensions.Create(10, 10, 10),
            FoodDelivery.Modules.Catalogs.Products.ValueObjects.Size.Create("M"),
            FoodDelivery.Modules.Catalogs.Products.Models.ProductColor.Red,
            "Description",
            FoodDelivery.Modules.Catalogs.Products.ValueObjects.Price.Create(100),
            category.Id,
            supplier.Id,
            brand.Id
        );

        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync();

        var query = new GetProductById(product.Id);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Product.Should().NotBeNull();
        result.Product.Id.Should().Be(product.Id);
    }

    [Fact]
    public async Task Handle_WhenProductDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        var query = new GetProductById(999);

        // Act
        Func<Task> act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ProductNotFoundException>();
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _connection.Dispose();
    }
}
