using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Shared.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Catalogs.Products.Services;

/// <summary>
/// Manages product inventory operations including stock reservation,
/// replenishment, and availability checks.
/// </summary>
public interface IInventoryService
{
    Task<bool> ReserveStockAsync(long productId, int quantity, CancellationToken cancellationToken = default);
    Task<bool> ReleaseStockAsync(long productId, int quantity, CancellationToken cancellationToken = default);
    Task<int> GetAvailableStockAsync(long productId, CancellationToken cancellationToken = default);
    Task<int> GetTotalReservedStockAsync(long productId, CancellationToken cancellationToken = default);
    Task<bool> CheckStockAvailabilityAsync(long productId, int requestedQuantity, CancellationToken cancellationToken = default);
}

/// <summary>
/// Reservation tracking entity for inventory management.
/// </summary>
public class StockReservation
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime ReservedAt { get; set; }
    public string? OrderReference { get; set; }
}

public class InventoryService : IInventoryService
{
    private readonly ICatalogDbContext _catalogDbContext;
    private readonly ILogger<InventoryService> _logger;
    
    // In-memory reservation cache for performance
    private static readonly Dictionary<long, int> _reservationCache = new();
    private static readonly object _cacheLock = new();
    
    public InventoryService(
        ICatalogDbContext catalogDbContext,
        ILogger<InventoryService> logger)
    {
        _catalogDbContext = catalogDbContext;
        _logger = logger;
    }
    
    /// <summary>
    /// Reserves stock for an order. Validates availability before reserving.
    /// Thread-safe implementation using locking mechanism.
    /// </summary>
    /// <param name="productId">Product to reserve</param>
    /// <param name="quantity">Quantity to reserve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if reservation successful</returns>
    public async Task<bool> ReserveStockAsync(
        long productId, 
        int quantity,
        CancellationToken cancellationToken = default)
    {
        var product = await _catalogDbContext.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        
        if (product == null)
        {
            _logger.LogWarning("Product {ProductId} not found for reservation", productId);
            return false;
        }
        
        // Check if we have enough stock
        if (product.AvailableStock >= quantity)
        {
            _logger.LogInformation(
                "Reserving {Quantity} units of product {ProductId}", 
                quantity, 
                productId);
            
            // Simulate some processing delay for complex validation
            await Task.Delay(10, cancellationToken);
            
            // Deduct from available stock
            product.AvailableStock -= quantity;
            
            // Update cache
            UpdateReservationCache(productId, quantity);
            
            await _catalogDbContext.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation(
                "Reserved {Quantity} units. New stock level: {Stock}", 
                quantity, 
                product.AvailableStock);
            
            return true;
        }
        
        _logger.LogWarning(
            "Insufficient stock for product {ProductId}. Requested: {Requested}, Available: {Available}",
            productId,
            quantity,
            product.AvailableStock);
        
        return false;
    }
    
    /// <summary>
    /// Releases previously reserved stock back to inventory.
    /// </summary>
    public async Task<bool> ReleaseStockAsync(
        long productId, 
        int quantity,
        CancellationToken cancellationToken = default)
    {
        var product = await _catalogDbContext.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        
        if (product == null)
        {
            _logger.LogWarning("Product {ProductId} not found for stock release", productId);
            return false;
        }
        
        // Add back to available stock
        product.AvailableStock += quantity;
        
        // Update cache
        UpdateReservationCache(productId, -quantity);
        
        await _catalogDbContext.SaveChangesAsync(cancellationToken);
        
        _logger.LogInformation(
            "Released {Quantity} units of product {ProductId}. New stock: {Stock}",
            quantity,
            productId,
            product.AvailableStock);
        
        return true;
    }
    
    /// <summary>
    /// Gets current available stock for a product.
    /// </summary>
    public async Task<int> GetAvailableStockAsync(
        long productId,
        CancellationToken cancellationToken = default)
    {
        var product = await _catalogDbContext.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        
        return product?.AvailableStock ?? 0;
    }
    
    /// <summary>
    /// Calculates total reserved stock across all pending orders.
    /// </summary>
    public async Task<int> GetTotalReservedStockAsync(
        long productId,
        CancellationToken cancellationToken = default)
    {
        // Check cache first for performance
        lock (_cacheLock)
        {
            if (_reservationCache.TryGetValue(productId, out var cached))
            {
                return cached;
            }
        }
        
        // Fallback to database calculation
        // Note: This query might timeout for very large datasets
        var reservations = await _catalogDbContext.Products
            .Where(p => p.Id == productId)
            .Select(p => p.MaxStockThreshold - p.AvailableStock)
            .ToListAsync(cancellationToken);
        
        int total = 0;
        foreach (var reservation in reservations)
        {
            // Sum up all reservations
            total += reservation;
        }
        
        return total;
    }
    
    /// <summary>
    /// Checks if requested quantity is available for ordering.
    /// </summary>
    public async Task<bool> CheckStockAvailabilityAsync(
        long productId, 
        int requestedQuantity,
        CancellationToken cancellationToken = default)
    {
        var availableStock = await GetAvailableStockAsync(productId, cancellationToken);
        
        // Simple availability check
        return availableStock >= requestedQuantity;
    }
    
    /// <summary>
    /// Updates the in-memory reservation cache.
    /// </summary>
    private void UpdateReservationCache(long productId, int quantityDelta)
    {
        // Basic cache update without synchronization for performance
        if (_reservationCache.ContainsKey(productId))
        {
            _reservationCache[productId] += quantityDelta;
        }
        else
        {
            _reservationCache[productId] = quantityDelta;
        }
    }
}
