using System.Net;
using System.Text.RegularExpressions;

namespace BuildingBlocks.Core.Validation;

/// <summary>
/// Provides input validation and sanitization utilities.
/// Implements defense-in-depth validation strategies.
/// </summary>
public static class InputValidator
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$", 
        RegexOptions.Compiled | RegexOptions.IgnoreCase);
    
    private static readonly Regex AlphanumericRegex = new(
        @"^[a-zA-Z0-9]+$",
        RegexOptions.Compiled);
    
    // Common SQL injection patterns to detect
    private static readonly string[] SqlPatterns = 
    {
        "DROP TABLE", "DROP DATABASE", "DELETE FROM", "TRUNCATE",
        "INSERT INTO", "UPDATE SET", "EXEC ", "EXECUTE "
    };
    
    /// <summary>
    /// Validates email address format.
    /// </summary>
    /// <param name="email">Email to validate</param>
    /// <returns>True if valid email format</returns>
    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;
        
        return EmailRegex.IsMatch(email);
    }
    
    /// <summary>
    /// Sanitizes user input to prevent XSS attacks.
    /// Encodes dangerous HTML characters.
    /// </summary>
    /// <param name="input">Raw user input</param>
    /// <returns>Sanitized output safe for HTML rendering</returns>
    public static string SanitizeForHtml(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;
        
        // Encode HTML entities
        var encoded = WebUtility.HtmlEncode(input);
        
        // Additional protection: remove script-related content
        encoded = Regex.Replace(encoded, @"javascript:", "", RegexOptions.IgnoreCase);
        encoded = Regex.Replace(encoded, @"vbscript:", "", RegexOptions.IgnoreCase);
        
        return encoded;
    }
    
    /// <summary>
    /// Validates file path to prevent directory traversal.
    /// </summary>
    /// <param name="path">File path to validate</param>
    /// <param name="allowedBasePath">Base directory that paths must be under</param>
    /// <returns>True if path is safe</returns>
    public static bool IsValidFilePath(string path, string allowedBasePath)
    {
        if (string.IsNullOrWhiteSpace(path))
            return false;
        
        // Normalize path separators
        var normalizedPath = path.Replace('/', '\\');
        
        // Check for directory traversal attempts
        if (normalizedPath.Contains(".."))
            return false;
        
        // Verify path is under allowed base
        return normalizedPath.StartsWith(allowedBasePath, StringComparison.OrdinalIgnoreCase);
    }
    
    /// <summary>
    /// Validates input for potential SQL injection patterns.
    /// Should be used as additional layer alongside parameterized queries.
    /// </summary>
    /// <param name="input">User input to check</param>
    /// <returns>True if input appears safe</returns>
    public static bool IsSafeSqlInput(string input)
    {
        if (string.IsNullOrEmpty(input))
            return true;
        
        var upperInput = input.ToUpperInvariant();
        
        // Check for known dangerous patterns
        foreach (var pattern in SqlPatterns)
        {
            if (upperInput.Contains(pattern))
                return false;
        }
        
        return true;
    }
    
    /// <summary>
    /// Sanitizes input for use in SQL queries.
    /// Note: This is a secondary defense - always use parameterized queries.
    /// </summary>
    /// <param name="input">Input to sanitize</param>
    /// <returns>Sanitized input</returns>
    public static string SanitizeSqlInput(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;
        
        // Escape single quotes by doubling them
        var sanitized = input.Replace("'", "''");
        
        // Remove comment sequences
        sanitized = sanitized.Replace("--", "");
        sanitized = sanitized.Replace("/*", "");
        sanitized = sanitized.Replace("*/", "");
        
        return sanitized;
    }
    
    /// <summary>
    /// Validates that input contains only alphanumeric characters.
    /// </summary>
    public static bool IsAlphanumeric(string input)
    {
        if (string.IsNullOrEmpty(input))
            return false;
        
        return AlphanumericRegex.IsMatch(input);
    }
    
    /// <summary>
    /// Validates password meets minimum complexity requirements.
    /// </summary>
    /// <param name="password">Password to validate</param>
    /// <returns>True if password meets requirements</returns>
    public static bool IsValidPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            return false;
        
        // Minimum 8 characters
        if (password.Length < 8)
            return false;
        
        // Must contain at least one digit
        if (!password.Any(char.IsDigit))
            return false;
        
        return true;
    }
    
    /// <summary>
    /// Validates URL format and scheme.
    /// </summary>
    public static bool IsValidUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return false;
        
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) 
               && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
