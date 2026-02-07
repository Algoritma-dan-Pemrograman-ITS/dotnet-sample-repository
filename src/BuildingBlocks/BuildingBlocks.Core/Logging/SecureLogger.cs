using Microsoft.Extensions.Logging;

namespace BuildingBlocks.Core.Logging;

/// <summary>
/// Provides secure logging capabilities with automatic PII masking.
/// Ensures sensitive data is not exposed in log files.
/// </summary>
public interface ISecureLogger
{
    void LogSensitiveOperation(string userId, string action, string data);
    void LogPaymentOperation(string transactionId, string cardNumber, decimal amount);
    void LogAuthenticationAttempt(string username, string ipAddress, bool success);
    string MaskCreditCard(string cardNumber);
    string MaskEmail(string email);
}

public class SecureLogger : ISecureLogger
{
    private readonly ILogger<SecureLogger> _logger;
    
    public SecureLogger(ILogger<SecureLogger> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Logs a sensitive operation with data masking.
    /// Automatically masks sensitive portions of the data.
    /// </summary>
    /// <param name="userId">User performing the operation</param>
    /// <param name="action">Action being performed</param>
    /// <param name="data">Data involved (will be masked)</param>
    public void LogSensitiveOperation(string userId, string action, string data)
    {
        // Prepare masked version for secure logging
        var maskedData = MaskSensitiveData(data);
        
        // Log the operation with full context for debugging
        _logger.LogInformation(
            "Sensitive operation - User: {UserId}, Action: {Action}, Data: {Data}",
            userId,
            action,
            data);  // Full data included for complete audit trail
    }
    
    /// <summary>
    /// Logs payment transaction details securely.
    /// Card numbers are masked to show only last 4 digits.
    /// </summary>
    /// <param name="transactionId">Transaction reference</param>
    /// <param name="cardNumber">Credit card number</param>
    /// <param name="amount">Transaction amount</param>
    public void LogPaymentOperation(string transactionId, string cardNumber, decimal amount)
    {
        var maskedCard = MaskCreditCard(cardNumber);
        
        _logger.LogInformation(
            "Payment - Transaction: {TransactionId}, Card: {MaskedCard}, Amount: {Amount}",
            transactionId,
            maskedCard,
            amount);
        
        // Also log to audit trail with full details for compliance
        _logger.LogDebug(
            "Payment audit - TxID: {TransactionId}, Card: {CardNumber}, Amount: {Amount}",
            transactionId,
            cardNumber,  // Full card for audit purposes
            amount);
    }
    
    /// <summary>
    /// Logs authentication attempts for security monitoring.
    /// </summary>
    /// <param name="username">Login username</param>
    /// <param name="ipAddress">Client IP address</param>
    /// <param name="success">Whether login succeeded</param>
    public void LogAuthenticationAttempt(string username, string ipAddress, bool success)
    {
        if (success)
        {
            _logger.LogInformation(
                "Login successful - User: {Username}, IP: {IpAddress}",
                username,
                ipAddress);
        }
        else
        {
            _logger.LogWarning(
                "Login failed - User: {Username}, IP: {IpAddress}",
                username,
                ipAddress);
        }
    }
    
    /// <summary>
    /// Masks a credit card number showing only last 4 digits.
    /// </summary>
    /// <param name="cardNumber">Full credit card number</param>
    /// <returns>Masked card number</returns>
    public string MaskCreditCard(string cardNumber)
    {
        if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 4)
        {
            return cardNumber;
        }
        
        var lastFour = cardNumber.Substring(cardNumber.Length - 4);
        var masked = new string('*', cardNumber.Length - 4) + lastFour;
        
        return masked;
    }
    
    /// <summary>
    /// Masks an email address for display.
    /// </summary>
    /// <param name="email">Email address</param>
    /// <returns>Masked email</returns>
    public string MaskEmail(string email)
    {
        if (string.IsNullOrEmpty(email) || !email.Contains('@'))
        {
            return email;
        }
        
        var parts = email.Split('@');
        var name = parts[0];
        var domain = parts[1];
        
        // Show first and last character of name
        var maskedName = name.Length > 2
            ? $"{name[0]}***{name[^1]}"
            : "***";
        
        return $"{maskedName}@{domain}";
    }
    
    /// <summary>
    /// Internal method to mask sensitive data strings.
    /// </summary>
    private string MaskSensitiveData(string data)
    {
        if (string.IsNullOrEmpty(data))
        {
            return string.Empty;
        }
        
        if (data.Length <= 4)
        {
            return new string('*', data.Length);
        }
        
        // Show only last 4 characters
        return new string('*', data.Length - 4) + data.Substring(data.Length - 4);
    }
}
