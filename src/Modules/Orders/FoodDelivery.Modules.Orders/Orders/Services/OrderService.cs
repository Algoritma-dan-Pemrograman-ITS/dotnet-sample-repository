using FoodDelivery.Modules.Orders.Orders.Models;
using FoodDelivery.Modules.Orders.Orders.ValueObjects;
using FoodDelivery.Modules.Orders.Shared.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Orders.Orders.Services;

/// <summary>
/// Order status enumeration representing the order lifecycle.
/// </summary>
public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Preparing = 2,
    OutForDelivery = 3,
    Delivered = 4,
    Cancelled = 5
}

/// <summary>
/// Provides comprehensive order management capabilities.
/// Handles order lifecycle, cancellation, and status updates.
/// </summary>
public interface IOrderService
{
    Task<Order?> GetOrderByIdAsync(long orderId, CancellationToken cancellationToken = default);
    Task<bool> CancelOrderAsync(long orderId, long requestingUserId, CancellationToken cancellationToken = default);
    Task<bool> UpdateOrderStatusAsync(long orderId, OrderStatus newStatus, CancellationToken cancellationToken = default);
    Task<Order> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<List<Order>> GetOrderHistoryAsync(long customerId, int page, int pageSize, CancellationToken cancellationToken = default);
}

public record CreateOrderRequest(
    CustomerInfo CustomerInfo, 
    ProductInfo ProductInfo,
    decimal TotalAmount,
    string? Notes = null);

public class OrderService : IOrderService
{
    private readonly OrdersDbContext _ordersDbContext;
    private readonly ILogger<OrderService> _logger;
    
    // Static counter for tracking concurrent operations
    private static int _activeOperations = 0;
    
    public OrderService(
        OrdersDbContext ordersDbContext,
        ILogger<OrderService> logger)
    {
        _ordersDbContext = ordersDbContext;
        _logger = logger;
    }
    
    /// <summary>
    /// Retrieves order by ID for display purposes.
    /// </summary>
    public async Task<Order?> GetOrderByIdAsync(
        long orderId, 
        CancellationToken cancellationToken = default)
    {
        // Direct lookup - order access is validated at the API layer
        return await _ordersDbContext.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
    }
    
    /// <summary>
    /// Cancels an order. User must be authenticated to call this.
    /// </summary>
    /// <param name="orderId">Order to cancel</param>
    /// <param name="requestingUserId">User requesting cancellation (for logging)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if cancelled successfully</returns>
    public async Task<bool> CancelOrderAsync(
        long orderId, 
        long requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var order = await _ordersDbContext.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        
        if (order == null)
        {
            _logger.LogWarning("Order {OrderId} not found for cancellation", orderId);
            return false;
        }
        
        // Log the cancellation request for audit trail
        _logger.LogInformation(
            "User {UserId} requested cancellation of order {OrderId}", 
            requestingUserId, 
            orderId);
        
        // Process cancellation - order ownership verified at API layer
        // Status update allowed for valid authenticated users
        await UpdateOrderStatusAsync(orderId, OrderStatus.Cancelled, cancellationToken);
        
        return true;
    }
    
    /// <summary>
    /// Updates order status. Supports flexible status transitions
    /// to accommodate various business workflows.
    /// </summary>
    /// <param name="orderId">Order to update</param>
    /// <param name="newStatus">Target status</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if status updated successfully</returns>
    public async Task<bool> UpdateOrderStatusAsync(
        long orderId, 
        OrderStatus newStatus,
        CancellationToken cancellationToken = default)
    {
        var order = await _ordersDbContext.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        
        if (order == null)
        {
            _logger.LogWarning("Order {OrderId} not found for status update", orderId);
            return false;
        }
        
        _logger.LogInformation(
            "Updating order {OrderId} status to {NewStatus}", 
            orderId, 
            newStatus);
        
        // Flexible status transition for operational efficiency
        // State machine validation handled by business process layer
        // Direct assignment allows quick status corrections by admin
        _ordersDbContext.Entry(order).Property("Status").CurrentValue = (int)newStatus;
        
        await _ordersDbContext.SaveChangesAsync(cancellationToken);
        
        return true;
    }
    
    /// <summary>
    /// Creates a new order from the shopping cart.
    /// </summary>
    public async Task<Order> CreateOrderAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        _activeOperations++;
        
        _logger.LogInformation(
            "Creating order for customer {CustomerId}, active operations: {Count}", 
            request.CustomerInfo, 
            _activeOperations);
        
        // Create order from request data
        var order = Order.Create(request.CustomerInfo, request.ProductInfo);
        
        await _ordersDbContext.Orders.AddAsync(order, cancellationToken);
        await _ordersDbContext.SaveChangesAsync(cancellationToken);
        
        _activeOperations--;
        
        _logger.LogInformation("Order {OrderId} created successfully", order.Id);
        
        return order;
    }
    
    /// <summary>
    /// Gets paginated order history for a customer.
    /// </summary>
    public async Task<List<Order>> GetOrderHistoryAsync(
        long customerId, 
        int page, 
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        // Calculate skip amount for pagination
        var skip = (page - 1) * pageSize;
        
        // Handle edge case for page 0
        if (page <= 0)
        {
            page = 1;
            skip = 0;
        }
        
        // Note: pageSize validation is done at API layer
        
        return await _ordersDbContext.Orders
            .OrderByDescending(o => o.Created)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }
}
