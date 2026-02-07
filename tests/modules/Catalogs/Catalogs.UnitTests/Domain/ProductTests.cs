using FluentAssertions;
using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Products.ValueObjects;
using FoodDelivery.Modules.Catalogs.Products.Exceptions.Domain;
using FoodDelivery.Tests.Common.TestBase;
using Xunit;
using FoodDelivery.Modules.Catalogs.Products.Features.CreatingProduct.Events.Domain;
using FoodDelivery.Modules.Catalogs.Products.Features.DebitingProductStock.Events.Domain;
using FoodDelivery.Modules.Catalogs.Brands;
using FoodDelivery.Modules.Catalogs.Categories;
using FoodDelivery.Modules.Catalogs.Suppliers;

namespace FoodDelivery.Modules.Catalogs.UnitTests.Domain;

public class ProductTests : UnitTestBase
{
    [Fact]
    public void Create_WhenInputIsValid_ShouldReturnProduct()
    {
        // Arrange
        var id = new ProductId(1);
        var name = Name.Create("Test Product");
        var stock = Stock.Create(10, 5, 20);
        var status = ProductStatus.Available;
        var dim = Dimensions.Create(10, 10, 10);
        var size = Size.Create("M");
        var color = ProductColor.Red;
        var price = Price.Create(100);
        
        // Act
        var product = Product.Create(
            id, name, stock, status, dim, size, color, 
            "Description", price, new CategoryId(1), new SupplierId(1), new BrandId(1));
            
        // Assert
        product.Should().NotBeNull();
        product.Id.Should().Be(id);
        product.Stock.Available.Should().Be(10);
        product.GetUncommittedDomainEvents().Should().Contain(e => e is ProductCreated);
    }

    [Fact]
    public void Create_WhenIdIsNull_ShouldThrowException()
    {
        // Act
        Action act = () => Product.Create(
            null!, Name.Create("Test"), Stock.Create(10, 5, 20), ProductStatus.Available,
            Dimensions.Create(1,1,1), Size.Create("S"), ProductColor.Red,
            "Desc", Price.Create(50), new CategoryId(1), new SupplierId(1), new BrandId(1));

        // Assert
        act.Should().Throw<ProductDomainException>()
            .WithMessage("*id can not be null*");
    }

    [Theory]
    [InlineData(10, 5, 5)]
    [InlineData(10, 10, 0)]
    public void DebitStock_WhenStockIsSufficient_ShouldReduceStock(int initial, int debit, int expected)
    {
        // Arrange
        var product = CreateValidProduct(initialStock: initial);

        // Act
        product.DebitStock(debit);

        // Assert
        product.Stock.Available.Should().Be(expected);
        product.GetUncommittedDomainEvents().Should().Contain(e => e is ProductStockDebited);
    }

    [Fact]
    public void DebitStock_WhenStockIsInsufficient_ShouldThrowException()
    {
        // Arrange
        var product = CreateValidProduct(initialStock: 5);

        // Act
        Action act = () => product.DebitStock(10);

        // Assert
        act.Should().Throw<InsufficientStockException>();
    }

    [Fact]
    public void ReplenishStock_WhenMaxThresholdReached_ShouldThrowException()
    {
        // Arrange
        var product = CreateValidProduct(initialStock: 15, maxStock: 20);

        // Act
        Action act = () => product.ReplenishStock(10); // 15 + 10 = 25 > 20

        // Assert
        act.Should().Throw<MaxStockThresholdReachedException>();
    }

    // Helper to create a valid product with flexible stock defaults
    private Product CreateValidProduct(int initialStock = 10, int maxStock = 100)
    {
        return Product.Create(
            new ProductId(1),
            Name.Create("Test Product"),
            Stock.Create(initialStock, 5, maxStock),
            ProductStatus.Available,
            Dimensions.Create(10, 10, 10),
            Size.Create("M"),
            ProductColor.Red,
            "Description",
            Price.Create(100),
            new CategoryId(1),
            new SupplierId(1),
            new BrandId(1));
    }
}
