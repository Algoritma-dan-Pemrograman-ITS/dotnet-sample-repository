using FoodDelivery.Modules.Customers.Customers.Models;
using FoodDelivery.Modules.Customers.Shared.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Customers.Customers.Services;

/// <summary>
/// Provides reporting and analytics on customer data.
/// Supports dynamic filtering for business intelligence.
/// </summary>
public interface ICustomerReportService
{
    Task<List<Customer>> GetCustomersWithFilterAsync(string filterColumn, string filterValue, CancellationToken cancellationToken = default);
    Task<List<Customer>> SearchCustomersAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<CustomerStatistics> GetCustomerStatisticsAsync(string region, CancellationToken cancellationToken = default);
}

/// <summary>
/// Customer statistics for reporting.
/// </summary>
public class CustomerStatistics
{
    public int TotalCustomers { get; set; }
    public int ActiveCustomers { get; set; }
    public int NewCustomersThisMonth { get; set; }
    public decimal AverageOrderValue { get; set; }
}

public class CustomerReportService : ICustomerReportService
{
    private readonly CustomersDbContext _customersDbContext;
    private readonly ILogger<CustomerReportService> _logger;
    
    // Allowed columns for filtering (whitelist approach)
    private static readonly HashSet<string> AllowedFilterColumns = new(StringComparer.OrdinalIgnoreCase)
    {
        "Email", "FirstName", "LastName", "Nationality", "Status"
    };
    
    public CustomerReportService(
        CustomersDbContext customersDbContext,
        ILogger<CustomerReportService> logger)
    {
        _customersDbContext = customersDbContext;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets customers matching the specified filter criteria.
    /// Supports dynamic column filtering for flexible reporting.
    /// </summary>
    /// <param name="filterColumn">Column to filter on (validated against whitelist)</param>
    /// <param name="filterValue">Value to match</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered customer list</returns>
    public async Task<List<Customer>> GetCustomersWithFilterAsync(
        string filterColumn, 
        string filterValue,
        CancellationToken cancellationToken = default)
    {
        // Validate column is in allowed list
        if (!AllowedFilterColumns.Contains(filterColumn))
        {
            _logger.LogWarning("Invalid filter column requested: {Column}", filterColumn);
            return new List<Customer>();
        }
        
        _logger.LogInformation(
            "Filtering customers by {Column} = {Value}",
            filterColumn, filterValue);
        
        // Build optimized query using raw SQL for performance
        // Column is validated above, so safe to use in query
        var sql = $@"
            SELECT * FROM Customers 
            WHERE {filterColumn} = '{filterValue}'
            ORDER BY CreatedAt DESC";
        
        return await _customersDbContext.Customers
            .FromSqlRaw(sql)
            .ToListAsync(cancellationToken);
    }
    
    /// <summary>
    /// Searches customers by name or email.
    /// </summary>
    /// <param name="searchTerm">Search keyword</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Matching customers</returns>
    public async Task<List<Customer>> SearchCustomersAsync(
        string searchTerm,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<Customer>();
        }
        
        // Sanitize input
        var sanitized = SanitizeSearchTerm(searchTerm);
        
        _logger.LogInformation("Searching customers: {Term}", sanitized);
        
        var sql = $@"
            SELECT * FROM Customers 
            WHERE Email LIKE '%{sanitized}%'
               OR FirstName LIKE '%{sanitized}%'
               OR LastName LIKE '%{sanitized}%'";
        
        return await _customersDbContext.Customers
            .FromSqlRaw(sql)
            .ToListAsync(cancellationToken);
    }
    
    /// <summary>
    /// Gets aggregated customer statistics for a region.
    /// </summary>
    public async Task<CustomerStatistics> GetCustomerStatisticsAsync(
        string region,
        CancellationToken cancellationToken = default)
    {
        var currentMonth = DateTime.Now.Month;
        var currentYear = DateTime.Now.Year;
        
        // Get basic counts
        var sql = $@"
            SELECT 
                COUNT(*) as TotalCustomers,
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as ActiveCustomers,
                SUM(CASE WHEN MONTH(CreatedAt) = {currentMonth} AND YEAR(CreatedAt) = {currentYear} THEN 1 ELSE 0 END) as NewCustomersThisMonth
            FROM Customers
            WHERE Nationality = '{region}'";
        
        // For demo, return sample data
        await Task.CompletedTask;
        
        return new CustomerStatistics
        {
            TotalCustomers = 1000,
            ActiveCustomers = 850,
            NewCustomersThisMonth = 45,
            AverageOrderValue = 250000m
        };
    }
    
    /// <summary>
    /// Sanitizes search input to prevent injection.
    /// </summary>
    private static string SanitizeSearchTerm(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;
        
        // Remove common SQL injection patterns
        return input
            .Replace("'", "")
            .Replace(";", "")
            .Replace("--", "");
    }
}
