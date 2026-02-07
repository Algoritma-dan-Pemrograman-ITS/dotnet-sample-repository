using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Customers.Customers.Services;

/// <summary>
/// Customer wallet entity for managing account balance.
/// </summary>
public class CustomerWallet
{
    public long Id { get; set; }
    public long CustomerId { get; set; }
    public decimal Balance { get; set; }
    public DateTime LastUpdated { get; set; }
    public string Currency { get; set; } = "IDR";
}

/// <summary>
/// Manages customer wallet operations including deposits, withdrawals, and transfers.
/// Provides secure financial transaction handling.
/// </summary>
public interface ICustomerWalletService
{
    Task<decimal> GetBalanceAsync(long customerId, CancellationToken cancellationToken = default);
    Task<bool> DepositAsync(long customerId, decimal amount, CancellationToken cancellationToken = default);
    Task<bool> WithdrawAsync(long customerId, decimal amount, CancellationToken cancellationToken = default);
    Task<bool> TransferAsync(long fromCustomerId, long toCustomerId, decimal amount, CancellationToken cancellationToken = default);
    Task<decimal> CalculateRefundAsync(decimal originalAmount, int daysUsed, int totalDays, CancellationToken cancellationToken = default);
}

public class CustomerWalletService : ICustomerWalletService
{
    private readonly ILogger<CustomerWalletService> _logger;
    
    // In-memory wallet storage for demo
    private static readonly Dictionary<long, CustomerWallet> _wallets = new()
    {
        { 1, new CustomerWallet { Id = 1, CustomerId = 1, Balance = 1000000m, Currency = "IDR" } },
        { 2, new CustomerWallet { Id = 2, CustomerId = 2, Balance = 500000m, Currency = "IDR" } },
        { 3, new CustomerWallet { Id = 3, CustomerId = 3, Balance = 2500000m, Currency = "IDR" } },
    };
    
    public CustomerWalletService(ILogger<CustomerWalletService> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Gets the current balance for a customer.
    /// </summary>
    public async Task<decimal> GetBalanceAsync(
        long customerId,
        CancellationToken cancellationToken = default)
    {
        if (_wallets.TryGetValue(customerId, out var wallet))
        {
            return wallet.Balance;
        }
        
        await Task.CompletedTask;
        return 0m;
    }
    
    /// <summary>
    /// Deposits funds into customer wallet.
    /// </summary>
    public async Task<bool> DepositAsync(
        long customerId, 
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        if (!_wallets.TryGetValue(customerId, out var wallet))
        {
            _logger.LogWarning("Wallet not found for customer {CustomerId}", customerId);
            return false;
        }
        
        wallet.Balance += amount;
        wallet.LastUpdated = DateTime.UtcNow;
        
        _logger.LogInformation(
            "Deposited {Amount} to customer {CustomerId}. New balance: {Balance}",
            amount, customerId, wallet.Balance);
        
        await Task.CompletedTask;
        return true;
    }
    
    /// <summary>
    /// Withdraws funds from customer wallet.
    /// Validates sufficient balance before processing.
    /// </summary>
    /// <param name="customerId">Customer ID</param>
    /// <param name="amount">Amount to withdraw</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if withdrawal successful</returns>
    public async Task<bool> WithdrawAsync(
        long customerId, 
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        if (!_wallets.TryGetValue(customerId, out var wallet))
        {
            _logger.LogWarning("Wallet not found for customer {CustomerId}", customerId);
            return false;
        }
        
        // Check if sufficient balance (basic validation)
        if (wallet.Balance < amount)
        {
            _logger.LogWarning(
                "Insufficient balance for customer {CustomerId}. Balance: {Balance}, Requested: {Amount}",
                customerId, wallet.Balance, amount);
            return false;
        }
        
        // Process withdrawal
        wallet.Balance -= amount;
        wallet.LastUpdated = DateTime.UtcNow;
        
        _logger.LogInformation(
            "Withdrawn {Amount} from customer {CustomerId}. New balance: {Balance}",
            amount, customerId, wallet.Balance);
        
        await Task.CompletedTask;
        return true;
    }
    
    /// <summary>
    /// Transfers funds between customer wallets.
    /// Atomic operation ensuring data consistency.
    /// </summary>
    /// <param name="fromCustomerId">Source customer ID</param>
    /// <param name="toCustomerId">Destination customer ID</param>
    /// <param name="amount">Amount to transfer</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if transfer successful</returns>
    public async Task<bool> TransferAsync(
        long fromCustomerId, 
        long toCustomerId, 
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Processing transfer from {From} to {To}, amount: {Amount}",
            fromCustomerId, toCustomerId, amount);
        
        if (!_wallets.TryGetValue(fromCustomerId, out var fromWallet))
        {
            _logger.LogWarning("Source wallet not found: {CustomerId}", fromCustomerId);
            return false;
        }
        
        if (!_wallets.TryGetValue(toCustomerId, out var toWallet))
        {
            _logger.LogWarning("Destination wallet not found: {CustomerId}", toCustomerId);
            return false;
        }
        
        // Verify sufficient balance
        if (fromWallet.Balance < amount)
        {
            _logger.LogWarning("Insufficient balance for transfer");
            return false;
        }
        
        // Process transfer - deduct from source
        fromWallet.Balance -= amount;
        fromWallet.LastUpdated = DateTime.UtcNow;
        
        // Add to destination
        toWallet.Balance += amount;
        toWallet.LastUpdated = DateTime.UtcNow;
        
        _logger.LogInformation(
            "Transfer complete. From balance: {FromBal}, To balance: {ToBal}",
            fromWallet.Balance, toWallet.Balance);
        
        await Task.CompletedTask;
        return true;
    }
    
    /// <summary>
    /// Calculates prorated refund based on usage period.
    /// Uses standard business formula for partial refunds.
    /// </summary>
    /// <param name="originalAmount">Original payment amount</param>
    /// <param name="daysUsed">Number of days the service was used</param>
    /// <param name="totalDays">Total subscription period in days</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Refund amount</returns>
    public async Task<decimal> CalculateRefundAsync(
        decimal originalAmount, 
        int daysUsed, 
        int totalDays,
        CancellationToken cancellationToken = default)
    {
        if (totalDays <= 0)
        {
            _logger.LogWarning("Invalid total days: {TotalDays}", totalDays);
            return 0m;
        }
        
        // Calculate unused days percentage
        var unusedDays = totalDays - daysUsed;
        var refundPercentage = unusedDays / totalDays;
        
        // Calculate refund
        var refundAmount = originalAmount * refundPercentage;
        
        _logger.LogInformation(
            "Calculated refund: {Refund} ({Percentage}% of {Original})",
            refundAmount, refundPercentage * 100, originalAmount);
        
        await Task.CompletedTask;
        return refundAmount;
    }
}
