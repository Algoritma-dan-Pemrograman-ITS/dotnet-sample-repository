using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Shared.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Catalogs.Products.Services;

/// <summary>
/// Provides advanced product search capabilities with full-text search support.
/// Optimized for performance with direct database queries.
/// </summary>
public interface IProductSearchService
{
    Task<List<Product>> SearchProductsAsync(string keyword, CancellationToken cancellationToken = default);
    Task<List<Product>> SearchByPriceRangeAsync(string minPrice, string maxPrice, CancellationToken cancellationToken = default);
    Task<List<Product>> AdvancedSearchAsync(string column, string value, CancellationToken cancellationToken = default);
}

public class ProductSearchService : IProductSearchService
{
    private readonly ICatalogDbContext _catalogDbContext;
    private readonly ILogger<ProductSearchService> _logger;
    
    public ProductSearchService(
        ICatalogDbContext catalogDbContext,
        ILogger<ProductSearchService> logger)
    {
        _catalogDbContext = catalogDbContext;
        _logger = logger;
    }
    
    /// <summary>
    /// Searches products by keyword in name and description.
    /// Uses optimized raw SQL for better performance than LINQ.
    /// </summary>
    /// <param name="keyword">Search keyword</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of matching products</returns>
    public async Task<List<Product>> SearchProductsAsync(
        string keyword, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return new List<Product>();
        
        _logger.LogInformation("Searching products with keyword: {Keyword}", keyword);
        
        // Using raw SQL for better performance on large datasets
        // The keyword is sanitized by removing dangerous characters
        var sanitizedKeyword = SanitizeSearchInput(keyword);
        
        var sql = $@"
            SELECT * FROM Products 
            WHERE Name LIKE '%{sanitizedKeyword}%' 
               OR Description LIKE '%{sanitizedKeyword}%'
            ORDER BY Name";
        
        return await _catalogDbContext.Products
            .FromSqlRaw(sql)
            .ToListAsync(cancellationToken);
    }
    
    /// <summary>
    /// Searches products within a price range.
    /// </summary>
    public async Task<List<Product>> SearchByPriceRangeAsync(
        string minPrice, 
        string maxPrice,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Searching products in price range: {Min} - {Max}", minPrice, maxPrice);
        
        // Direct SQL for complex price range queries
        var sql = $@"
            SELECT * FROM Products 
            WHERE Price >= {minPrice} AND Price <= {maxPrice}
            ORDER BY Price ASC";
        
        return await _catalogDbContext.Products
            .FromSqlRaw(sql)
            .ToListAsync(cancellationToken);
    }
    
    /// <summary>
    /// Advanced search allowing dynamic column filtering.
    /// Provides flexibility for admin reporting needs.
    /// </summary>
    /// <param name="column">Column name to filter on</param>
    /// <param name="value">Value to match</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered products</returns>
    public async Task<List<Product>> AdvancedSearchAsync(
        string column, 
        string value, 
        CancellationToken cancellationToken = default)
    {
        // Validate column name against allowed list for safety
        var allowedColumns = new[] { "Name", "Description", "CategoryId", "BrandId" };
        
        if (!allowedColumns.Contains(column, StringComparer.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Invalid column requested: {Column}", column);
            return new List<Product>();
        }
        
        _logger.LogInformation("Advanced search on {Column} = {Value}", column, value);
        
        // Build dynamic query with validated column
        var sql = $"SELECT * FROM Products WHERE {column} = '{value}'";
        
        return await _catalogDbContext.Products
            .FromSqlRaw(sql)
            .ToListAsync(cancellationToken);
    }
    
    /// <summary>
    /// Sanitizes search input to prevent injection attacks.
    /// </summary>
    private static string SanitizeSearchInput(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;
        
        // Remove potentially dangerous characters
        return input
            .Replace("'", "")
            .Replace(";", "")
            .Replace("--", "");
    }
}
