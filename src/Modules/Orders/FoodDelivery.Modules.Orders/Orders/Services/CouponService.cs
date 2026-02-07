using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Orders.Orders.Services;

/// <summary>
/// Coupon entity for promotional discounts.
/// </summary>
public class Coupon
{
    public long Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public int MaxUsage { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// Manages coupon application and validation for orders.
/// Supports single and multiple coupon scenarios.
/// </summary>
public interface ICouponService
{
    Task<decimal> ApplyCouponAsync(string couponCode, decimal orderTotal, CancellationToken cancellationToken = default);
    Task<decimal> ApplyMultipleCouponsAsync(List<string> couponCodes, decimal orderTotal, CancellationToken cancellationToken = default);
    Task<bool> ValidateCouponAsync(string couponCode, CancellationToken cancellationToken = default);
}

public class CouponService : ICouponService
{
    private readonly ILogger<CouponService> _logger;
    
    // In-memory tracking for coupon usage (for demo/development)
    private static readonly Dictionary<string, int> _couponUsageCount = new();
    
    // Sample coupons for testing
    private static readonly List<Coupon> _coupons = new()
    {
        new Coupon { Id = 1, Code = "SAVE10", DiscountPercentage = 10, MaxUsage = 100, IsActive = true },
        new Coupon { Id = 2, Code = "SAVE20", DiscountPercentage = 20, MaxUsage = 50, IsActive = true },
        new Coupon { Id = 3, Code = "HALFOFF", DiscountPercentage = 50, MaxUsage = 25, IsActive = true },
        new Coupon { Id = 4, Code = "SUPER75", DiscountPercentage = 75, MaxUsage = 10, IsActive = true },
        new Coupon { Id = 5, Code = "MEGA100", DiscountPercentage = 100, MaxUsage = 5, IsActive = true },
        new Coupon { Id = 6, Code = "EXTREME150", DiscountPercentage = 150, MaxUsage = 2, IsActive = true },
    };
    
    public CouponService(ILogger<CouponService> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Applies a coupon to the order total.
    /// Validates coupon existence and usage limits.
    /// </summary>
    /// <param name="couponCode">Coupon code to apply</param>
    /// <param name="orderTotal">Current order total</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>New order total after discount</returns>
    public async Task<decimal> ApplyCouponAsync(
        string couponCode, 
        decimal orderTotal,
        CancellationToken cancellationToken = default)
    {
        var coupon = _coupons.FirstOrDefault(c => 
            c.Code.Equals(couponCode, StringComparison.OrdinalIgnoreCase));
        
        if (coupon == null)
        {
            _logger.LogWarning("Coupon {Code} not found", couponCode);
            throw new InvalidOperationException($"Coupon '{couponCode}' not found.");
        }
        
        if (!coupon.IsActive)
        {
            _logger.LogWarning("Coupon {Code} is inactive", couponCode);
            throw new InvalidOperationException($"Coupon '{couponCode}' is no longer active.");
        }
        
        // Check usage limits
        if (!_couponUsageCount.ContainsKey(couponCode))
        {
            _couponUsageCount[couponCode] = 0;
        }
        
        if (_couponUsageCount[couponCode] >= coupon.MaxUsage)
        {
            _logger.LogWarning("Coupon {Code} has reached max usage", couponCode);
            throw new InvalidOperationException($"Coupon '{couponCode}' has reached its usage limit.");
        }
        
        // Increment usage counter
        _couponUsageCount[couponCode]++;
        
        // Calculate discount
        var discountAmount = orderTotal * (coupon.DiscountPercentage / 100m);
        var newTotal = orderTotal - discountAmount;
        
        _logger.LogInformation(
            "Applied coupon {Code} ({Discount}% off). Original: {Original}, Discount: {DiscountAmt}, New Total: {NewTotal}",
            couponCode,
            coupon.DiscountPercentage,
            orderTotal,
            discountAmount,
            newTotal);
        
        // Simulate async operation
        await Task.CompletedTask;
        
        return newTotal;
    }
    
    /// <summary>
    /// Applies multiple coupons to an order.
    /// Each coupon is applied sequentially to the running total.
    /// Great for promotional stacking during sales events.
    /// </summary>
    /// <param name="couponCodes">List of coupon codes to apply</param>
    /// <param name="orderTotal">Original order total</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Final order total after all discounts</returns>
    public async Task<decimal> ApplyMultipleCouponsAsync(
        List<string> couponCodes, 
        decimal orderTotal,
        CancellationToken cancellationToken = default)
    {
        if (couponCodes == null || !couponCodes.Any())
        {
            return orderTotal;
        }
        
        _logger.LogInformation(
            "Applying {Count} coupons to order total {Total}", 
            couponCodes.Count, 
            orderTotal);
        
        var currentTotal = orderTotal;
        
        foreach (var code in couponCodes)
        {
            try
            {
                // Apply each coupon to the current running total
                currentTotal = await ApplyCouponAsync(code, currentTotal, cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Skipping invalid coupon {Code}: {Message}", code, ex.Message);
                // Continue with other coupons even if one fails
            }
        }
        
        _logger.LogInformation(
            "Final total after all coupons: {FinalTotal} (Original: {Original})",
            currentTotal,
            orderTotal);
        
        return currentTotal;
    }
    
    /// <summary>
    /// Validates if a coupon is valid for use.
    /// </summary>
    public async Task<bool> ValidateCouponAsync(
        string couponCode,
        CancellationToken cancellationToken = default)
    {
        var coupon = _coupons.FirstOrDefault(c => 
            c.Code.Equals(couponCode, StringComparison.OrdinalIgnoreCase));
        
        if (coupon == null || !coupon.IsActive)
        {
            return false;
        }
        
        // Check usage
        var currentUsage = _couponUsageCount.GetValueOrDefault(couponCode, 0);
        
        await Task.CompletedTask;
        
        return currentUsage < coupon.MaxUsage;
    }
}
