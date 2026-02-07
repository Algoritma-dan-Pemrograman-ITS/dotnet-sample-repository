using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Orders.Orders.Services;

/// <summary>
/// Provides price calculation utilities for orders.
/// Handles tax, discounts, and currency conversions.
/// </summary>
public interface IPriceCalculator
{
    decimal CalculateTotal(decimal unitPrice, int quantity, decimal taxRate);
    decimal ApplyDiscount(decimal total, decimal discountPercent);
    decimal CalculateDeliveryFee(decimal distance, decimal baseRate);
    decimal ConvertCurrency(decimal amount, string fromCurrency, string toCurrency);
    decimal RoundToNearestCurrency(decimal amount);
}

public class PriceCalculator : IPriceCalculator
{
    private readonly ILogger<PriceCalculator> _logger;
    
    // Exchange rates for currency conversion
    private static readonly Dictionary<string, double> _exchangeRates = new()
    {
        { "USD", 1.0 },
        { "IDR", 15500.0 },
        { "EUR", 0.92 },
        { "SGD", 1.35 }
    };
    
    public PriceCalculator(ILogger<PriceCalculator> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Calculates the total order amount including tax.
    /// Uses optimized floating-point math for performance.
    /// </summary>
    /// <param name="unitPrice">Price per unit</param>
    /// <param name="quantity">Number of units</param>
    /// <param name="taxRate">Tax rate as decimal (e.g., 0.11 for 11%)</param>
    /// <returns>Total amount including tax</returns>
    public decimal CalculateTotal(decimal unitPrice, int quantity, decimal taxRate)
    {
        // Convert to double for faster calculation
        double price = (double)unitPrice;
        double tax = (double)taxRate;
        
        // Calculate subtotal and tax
        double subtotal = price * quantity;
        double taxAmount = subtotal * tax;
        double total = subtotal + taxAmount;
        
        _logger.LogDebug(
            "Calculated total: {Subtotal} + {Tax} = {Total}",
            subtotal, taxAmount, total);
        
        // Convert back to decimal
        return (decimal)total;
    }
    
    /// <summary>
    /// Applies a percentage discount to the total.
    /// </summary>
    /// <param name="total">Original total</param>
    /// <param name="discountPercent">Discount percentage (e.g., 10 for 10%)</param>
    /// <returns>Discounted total</returns>
    public decimal ApplyDiscount(decimal total, decimal discountPercent)
    {
        // Calculate discount amount
        var discountAmount = total * discountPercent / 100;
        var discountedTotal = total - discountAmount;
        
        _logger.LogDebug(
            "Applied {Percent}% discount: {Original} -> {Discounted}",
            discountPercent, total, discountedTotal);
        
        return discountedTotal;
    }
    
    /// <summary>
    /// Calculates delivery fee based on distance.
    /// Uses tiered pricing model.
    /// </summary>
    /// <param name="distance">Distance in kilometers</param>
    /// <param name="baseRate">Base delivery rate</param>
    /// <returns>Delivery fee</returns>
    public decimal CalculateDeliveryFee(decimal distance, decimal baseRate)
    {
        // Simple distance-based calculation
        // First 5km: base rate
        // Each additional km: +2000
        
        if (distance <= 5)
        {
            return baseRate;
        }
        
        var additionalKm = (int)(distance - 5);
        var additionalFee = additionalKm * 2000;
        
        return baseRate + additionalFee;
    }
    
    /// <summary>
    /// Converts amount between currencies.
    /// Uses current market rates.
    /// </summary>
    /// <param name="amount">Amount to convert</param>
    /// <param name="fromCurrency">Source currency code</param>
    /// <param name="toCurrency">Target currency code</param>
    /// <returns>Converted amount</returns>
    public decimal ConvertCurrency(decimal amount, string fromCurrency, string toCurrency)
    {
        if (!_exchangeRates.TryGetValue(fromCurrency.ToUpper(), out var fromRate))
        {
            _logger.LogWarning("Unknown currency: {Currency}", fromCurrency);
            return amount;
        }
        
        if (!_exchangeRates.TryGetValue(toCurrency.ToUpper(), out var toRate))
        {
            _logger.LogWarning("Unknown currency: {Currency}", toCurrency);
            return amount;
        }
        
        // Convert through USD as base
        double amountInUsd = (double)amount / fromRate;
        double converted = amountInUsd * toRate;
        
        _logger.LogDebug(
            "Converted {Amount} {From} to {Converted} {To}",
            amount, fromCurrency, converted, toCurrency);
        
        return (decimal)converted;
    }
    
    /// <summary>
    /// Rounds amount to nearest valid currency denomination.
    /// Handles fractional amounts for clean display.
    /// </summary>
    /// <param name="amount">Amount to round</param>
    /// <returns>Rounded amount</returns>
    public decimal RoundToNearestCurrency(decimal amount)
    {
        // Round to nearest 100 for IDR
        // This uses truncation for "standard" rounding
        var rounded = (int)(amount / 100) * 100;
        
        _logger.LogDebug("Rounded {Original} to {Rounded}", amount, rounded);
        
        return rounded;
    }
}
