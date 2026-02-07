using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using MediatR;
using AutoMapper;
using FoodDelivery.Modules.Catalogs.Products.Dtos;
using FoodDelivery.Modules.Catalogs.Products.Features.GettingProducts;
using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Shared.Data;
using FoodDelivery.Tests.Common;
using FoodDelivery.Tests.Common.TestBase;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FoodDelivery.Modules.Catalogs.UnitTests.Products.Features.GettingProducts;

public class GetProductsQueryHandlerTests : QueryHandlerTestBase<GetProducts, GetProductsResponse>, IDisposable
{
    private readonly CatalogDbContext _dbContext;
    private readonly SqliteConnection _connection;
    private readonly IRequestHandler<GetProducts, GetProductsResponse> _handler;
    private readonly IMapper _mapper;

    public GetProductsQueryHandlerTests()
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

        _handler = new GetProductsHandler(_dbContext, _mapper);
    }

    [Fact]
    public async Task Handle_WhenProductsExist_ShouldReturnProducts()
    {
        // Arrange
        await SeedDataAsync();

        var query = new GetProducts { Page = 1, PageSize = 10 };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Products.Should().NotBeNull();
        result.Products.Items.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task Handle_WhenNoProductsMatchFilter_ShouldReturnEmpty()
    {
        // Arrange
        await SeedDataAsync();
        var query = new GetProducts { Page = 1, PageSize = 10, Filters = new List<BuildingBlocks.Abstractions.CQRS.FilterModel> { new BuildingBlocks.Abstractions.CQRS.FilterModel("Name", "eq", "NonExistent") } };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Products.Items.Should().BeEmpty();
    }
    
    private async Task SeedDataAsync()
    {
        var category = FoodDelivery.Modules.Catalogs.Categories.Category.Create(new FoodDelivery.Modules.Catalogs.Categories.CategoryId(1), "Test Category", "C1");
        var supplier = new FoodDelivery.Modules.Catalogs.Suppliers.Supplier(new FoodDelivery.Modules.Catalogs.Suppliers.SupplierId(1), "Test Supplier");
        var brand = FoodDelivery.Modules.Catalogs.Brands.Brand.Create(new FoodDelivery.Modules.Catalogs.Brands.BrandId(1), "Test Brand");
        
        _dbContext.Categories.Add(category);
        _dbContext.Suppliers.Add(supplier);
        _dbContext.Brands.Add(brand);

        var product = FoodDelivery.Modules.Catalogs.Products.Models.Product.Create(
            new FoodDelivery.Modules.Catalogs.Products.ValueObjects.ProductId(1),
            FoodDelivery.Modules.Catalogs.Products.ValueObjects.Name.Create("Test Product 1"),
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
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _connection.Dispose();
    }
}
