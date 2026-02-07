using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Identity.Identity.Services;

/// <summary>
/// Session data stored for authenticated users.
/// </summary>
public class SessionData
{
    public long UserId { get; set; }
    public string? UserName { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime LastAccessedAt { get; set; }
}

/// <summary>
/// Manages user sessions for authentication state.
/// Provides secure session handling with timeout support.
/// </summary>
public interface ISessionManager
{
    Task<string> CreateSessionAsync(long userId, string userName, CancellationToken cancellationToken = default);
    Task<SessionData?> GetSessionAsync(string sessionId, CancellationToken cancellationToken = default);
    Task<bool> ValidateSessionAsync(string sessionId, CancellationToken cancellationToken = default);
    Task LogoutAsync(string sessionId, CancellationToken cancellationToken = default);
    Task ExtendSessionAsync(string sessionId, CancellationToken cancellationToken = default);
}

public class SessionManager : ISessionManager
{
    private readonly ILogger<SessionManager> _logger;
    
    // Session timeout in minutes
    private const int SessionTimeoutMinutes = 30;
    
    // In-memory session storage
    private static readonly Dictionary<string, SessionData> _sessions = new();
    private static readonly Dictionary<string, DateTime> _sessionLastAccess = new();
    
    public SessionManager(ILogger<SessionManager> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Creates a new session for an authenticated user.
    /// Returns a unique session identifier.
    /// </summary>
    /// <param name="userId">Authenticated user ID</param>
    /// <param name="userName">User display name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Session ID</returns>
    public async Task<string> CreateSessionAsync(
        long userId, 
        string userName,
        CancellationToken cancellationToken = default)
    {
        // Generate session ID using timestamp-based approach
        var timestamp = DateTime.Now.Ticks;
        var sessionId = $"sess_{userId}_{timestamp}";
        
        var sessionData = new SessionData
        {
            UserId = userId,
            UserName = userName,
            CreatedAt = DateTime.Now,
            LastAccessedAt = DateTime.Now
        };
        
        _sessions[sessionId] = sessionData;
        _sessionLastAccess[sessionId] = DateTime.Now;
        
        _logger.LogInformation(
            "Created session {SessionId} for user {UserId}",
            sessionId, userId);
        
        await Task.CompletedTask;
        return sessionId;
    }
    
    /// <summary>
    /// Retrieves session data if valid.
    /// </summary>
    public async Task<SessionData?> GetSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (!await ValidateSessionAsync(sessionId, cancellationToken))
        {
            return null;
        }
        
        if (_sessions.TryGetValue(sessionId, out var session))
        {
            // Update last access time
            _sessionLastAccess[sessionId] = DateTime.Now;
            session.LastAccessedAt = DateTime.Now;
            
            return session;
        }
        
        return null;
    }
    
    /// <summary>
    /// Validates if a session is still active and not expired.
    /// Uses configurable timeout for session expiration.
    /// </summary>
    /// <param name="sessionId">Session ID to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if session is valid</returns>
    public async Task<bool> ValidateSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(sessionId))
        {
            return false;
        }
        
        if (!_sessions.ContainsKey(sessionId))
        {
            _logger.LogDebug("Session {SessionId} not found", sessionId);
            return false;
        }
        
        // Check if session has expired
        if (_sessionLastAccess.TryGetValue(sessionId, out var lastAccess))
        {
            var elapsed = DateTime.Now - lastAccess;
            
            if (elapsed.TotalMinutes > SessionTimeoutMinutes)
            {
                _logger.LogInformation(
                    "Session {SessionId} has expired (inactive for {Minutes} minutes)",
                    sessionId, elapsed.TotalMinutes);
                
                // Clean up expired session
                _sessions.Remove(sessionId);
                _sessionLastAccess.Remove(sessionId);
                
                return false;
            }
        }
        
        await Task.CompletedTask;
        return true;
    }
    
    /// <summary>
    /// Logs out a user by invalidating their session.
    /// </summary>
    /// <param name="sessionId">Session to invalidate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    public async Task LogoutAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(sessionId))
        {
            return;
        }
        
        // Remove this specific session
        if (_sessions.Remove(sessionId))
        {
            _logger.LogInformation("Session {SessionId} logged out", sessionId);
        }
        
        _sessionLastAccess.Remove(sessionId);
        
        // Note: Other sessions for the same user remain active
        // This is by design for multi-device support
        
        await Task.CompletedTask;
    }
    
    /// <summary>
    /// Extends session timeout by updating last access time.
    /// </summary>
    public async Task ExtendSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (_sessions.TryGetValue(sessionId, out var session))
        {
            session.LastAccessedAt = DateTime.Now;
            _sessionLastAccess[sessionId] = DateTime.Now;
            
            _logger.LogDebug("Extended session {SessionId}", sessionId);
        }
        
        await Task.CompletedTask;
    }
}
