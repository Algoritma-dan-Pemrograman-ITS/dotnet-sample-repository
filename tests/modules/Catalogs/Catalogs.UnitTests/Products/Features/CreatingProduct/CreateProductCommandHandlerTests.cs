using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using MediatR;
using AutoMapper;
using BuildingBlocks.Abstractions.CQRS.Command;
using FoodDelivery.Modules.Catalogs.Products.Dtos;
using FoodDelivery.Modules.Catalogs.Products.Features.CreatingProduct;
using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Shared.Data;
using FoodDelivery.Tests.Common;
using FoodDelivery.Tests.Common.TestBase;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace FoodDelivery.Modules.Catalogs.UnitTests.Products.Features.CreatingProduct;

public class CreateProductCommandHandlerTests : CommandHandlerTestBase<CreateProduct, CreateProductResponse>, IDisposable
{
    private readonly CatalogDbContext _dbContext;
    private readonly SqliteConnection _connection;
    private readonly ICommandHandler<CreateProduct, CreateProductResponse> _handler; // Changed type
    private readonly IMapper _mapper; // Added
    private readonly ILogger<CreateProductHandler> _logger; // Kept as it's used in the constructor

    public CreateProductCommandHandlerTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:"); // Changed Filename to DataSource
        _connection.Open();

        var options = new DbContextOptionsBuilder<CatalogDbContext>()
            .UseSqlite(_connection)
            .Options;

        _dbContext = new CatalogDbContext(options);
        _dbContext.Database.EnsureCreated();

        var mapperConfig = new MapperConfiguration(c => c.AddProfile<FoodDelivery.Modules.Catalogs.Products.ProductMappers>()); // Added mapper initialization
        _mapper = mapperConfig.CreateMapper(); // Added mapper initialization

        _logger = Substitute.For<ILogger<CreateProductHandler>>(); // Kept logger initialization
        _handler = new CreateProductHandler(_dbContext, _mapper, _logger); // Changed Mapper to _mapper and _logger to logger
    }

    [Fact]
    public async Task Handle_WhenRequestIsValid_ShouldCreateProduct()
    {
        // Arrange
        var category = FoodDelivery.Modules.Catalogs.Categories.Category.Create(new FoodDelivery.Modules.Catalogs.Categories.CategoryId(1), "Test Category", "C1");
        var supplier = new FoodDelivery.Modules.Catalogs.Suppliers.Supplier(new FoodDelivery.Modules.Catalogs.Suppliers.SupplierId(1), "Test Supplier");
        var brand = FoodDelivery.Modules.Catalogs.Brands.Brand.Create(new FoodDelivery.Modules.Catalogs.Brands.BrandId(1), "Test Brand");
        
        _dbContext.Categories.Add(category);
        _dbContext.Suppliers.Add(supplier);
        _dbContext.Brands.Add(brand);
        await _dbContext.SaveChangesAsync();

        var command = new CreateProduct(
            "Test Product", // Changed "New Product" to "Test Product"
            100m,
            10,
            5,
            20,
            ProductStatus.Available,
            10, 10, 10, "M",
            ProductColor.Red,
            category.Id.Value,
            supplier.Id.Value,
            brand.Id.Value
            // Removed "Description" and null arguments
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Product.Should().NotBeNull();
        result.Product.Id.Should().BeGreaterThan(0);
        
        var productInDb = await _dbContext.Products.FindAsync(new FoodDelivery.Modules.Catalogs.Products.ValueObjects.ProductId(result.Product.Id));
        productInDb.Should().NotBeNull();
        productInDb!.Name.Value.Should().Be(command.Name);
    }

    [Fact]
    public async Task Handle_WhenCategoryNotFound_ShouldThrowException()
    {
        // Arrange
        // Seed only supplier and brand, skip category
        var supplier = new FoodDelivery.Modules.Catalogs.Suppliers.Supplier(new FoodDelivery.Modules.Catalogs.Suppliers.SupplierId(1), "Test Supplier"); // Changed to use constructor
        var brand = FoodDelivery.Modules.Catalogs.Brands.Brand.Create(new FoodDelivery.Modules.Catalogs.Brands.BrandId(1), "Test Brand"); // Changed to use Create factory method
        
        _dbContext.Suppliers.Add(supplier);
        _dbContext.Brands.Add(brand);
        await _dbContext.SaveChangesAsync();

        var command = new CreateProduct(
            "New Product", 100m, 10, 5, 20, ProductStatus.Available, 10, 10, 10, "M", ProductColor.Red,
            999, // Non-existent Category
            supplier.Id.Value,
            brand.Id.Value
        );

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<Exception>(); // Expecting CategoryDomainException or similar
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _connection.Dispose();
    }
}
