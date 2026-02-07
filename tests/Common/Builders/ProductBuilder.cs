using FoodDelivery.Modules.Catalogs.Brands;
using FoodDelivery.Modules.Catalogs.Categories;
using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Products.ValueObjects;
using FoodDelivery.Modules.Catalogs.Suppliers;

namespace FoodDelivery.Tests.Common.Builders;

public class ProductBuilder
{
    private ProductId _id = new(1);
    private Name _name = Name.Create("Test Product");
    private Stock _stock = Stock.Create(10, 5, 20);
    private ProductStatus _status = ProductStatus.Available;
    private Dimensions _dimensions = Dimensions.Create(10, 10, 10);
    private Size _size = Size.Create("M");
    private ProductColor _color = ProductColor.Red;
    private string? _description = "Test Description";
    private Price _price = Price.Create(100);
    private CategoryId _categoryId = new(1);
    private SupplierId _supplierId = new(1);
    private BrandId _brandId = new(1);
    private List<ProductImage>? _images = null;

    public ProductBuilder WithId(long id)
    {
        _id = new ProductId(id);
        return this;
    }

    public ProductBuilder WithName(string name)
    {
        _name = Name.Create(name);
        return this;
    }

    public ProductBuilder WithPrice(decimal price)
    {
        _price = Price.Create(price);
        return this;
    }

    public ProductBuilder WithStock(int available, int restockThreshold = 5, int maxStockThreshold = 100)
    {
        _stock = Stock.Create(available, restockThreshold, maxStockThreshold);
        return this;
    }

    public ProductBuilder WithStatus(ProductStatus status)
    {
        _status = status;
        return this;
    }

    public ProductBuilder WithDimensions(int width, int height, int depth)
    {
        _dimensions = Dimensions.Create(width, height, depth);
        return this;
    }

    public ProductBuilder WithSize(string size)
    {
        _size = Size.Create(size);
        return this;
    }

    public ProductBuilder WithColor(ProductColor color)
    {
        _color = color;
        return this;
    }

    public ProductBuilder WithDescription(string description)
    {
        _description = description;
        return this;
    }

    public ProductBuilder WithCategory(long categoryId)
    {
        _categoryId = new CategoryId(categoryId);
        return this;
    }

    public ProductBuilder WithSupplier(long supplierId)
    {
        _supplierId = new SupplierId(supplierId);
        return this;
    }

    public ProductBuilder WithBrand(long brandId)
    {
        _brandId = new BrandId(brandId);
        return this;
    }
    
    public ProductBuilder WithImages(List<ProductImage> images)
    {
        _images = images;
        return this;
    }

    public Product Build()
    {
        return Product.Create(
            _id,
            _name,
            _stock,
            _status,
            _dimensions,
            _size,
            _color,
            _description,
            _price,
            _categoryId,
            _supplierId,
            _brandId,
            _images);
    }
}
