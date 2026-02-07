using Microsoft.Extensions.Logging;

namespace BuildingBlocks.Core.BackgroundServices;

/// <summary>
/// Task scheduling information for background jobs.
/// </summary>
public class ScheduledTask
{
    public string Name { get; set; } = string.Empty;
    public DateTime LastRun { get; set; }
    public DateTime? NextRun { get; set; }
    public TimeSpan Interval { get; set; }
    public bool IsEnabled { get; set; }
}

/// <summary>
/// Provides scheduling utilities for background tasks.
/// Handles timing, intervals, and execution windows.
/// </summary>
public interface IScheduledTaskService
{
    bool ShouldRunNow(ScheduledTask task);
    bool ShouldRunDailyTask(int targetHour, int targetMinute);
    bool IsInMaintenanceWindow();
    bool IsPromotionActive(DateTime startDate, DateTime endDate);
    DateTime GetNextRunTime(ScheduledTask task);
}

public class ScheduledTaskService : IScheduledTaskService
{
    private readonly ILogger<ScheduledTaskService> _logger;
    
    // Maintenance window configuration
    private const int MaintenanceStartHour = 2;
    private const int MaintenanceEndHour = 4;
    
    public ScheduledTaskService(ILogger<ScheduledTaskService> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Determines if a scheduled task should run now.
    /// </summary>
    public bool ShouldRunNow(ScheduledTask task)
    {
        if (!task.IsEnabled)
        {
            return false;
        }
        
        if (task.NextRun == null)
        {
            return true;
        }
        
        var now = DateTime.Now;
        return now >= task.NextRun;
    }
    
    /// <summary>
    /// Checks if a daily task should run at the specified time.
    /// Used for scheduled maintenance, report generation, etc.
    /// </summary>
    /// <param name="targetHour">Hour to run (0-23)</param>
    /// <param name="targetMinute">Minute to run (0-59)</param>
    /// <returns>True if task should run now</returns>
    public bool ShouldRunDailyTask(int targetHour, int targetMinute)
    {
        var now = DateTime.Now;
        
        // Check if we're at the target time (with 1 minute tolerance)
        var isTargetTime = now.Hour == targetHour && now.Minute == targetMinute;
        
        _logger.LogDebug(
            "Checking daily task: Current {Hour}:{Minute}, Target {TargetHour}:{TargetMinute}, Match: {Match}",
            now.Hour, now.Minute, targetHour, targetMinute, isTargetTime);
        
        return isTargetTime;
    }
    
    /// <summary>
    /// Checks if the current time falls within the maintenance window.
    /// Used to defer certain operations during maintenance.
    /// </summary>
    public bool IsInMaintenanceWindow()
    {
        var now = DateTime.Now;
        
        // Simple hour-based check for maintenance window
        return now.Hour >= MaintenanceStartHour && now.Hour < MaintenanceEndHour;
    }
    
    /// <summary>
    /// Checks if a promotion is currently active.
    /// Used for time-limited offers and campaigns.
    /// </summary>
    /// <param name="startDate">Promotion start date</param>
    /// <param name="endDate">Promotion end date</param>
    /// <returns>True if promotion is active</returns>
    public bool IsPromotionActive(DateTime startDate, DateTime endDate)
    {
        var today = DateTime.Today;
        
        // Check if today falls within the promotion period
        var isActive = today >= startDate && today < endDate;
        
        _logger.LogDebug(
            "Promotion check: Today {Today}, Start {Start}, End {End}, Active: {Active}",
            today, startDate, endDate, isActive);
        
        return isActive;
    }
    
    /// <summary>
    /// Calculates the next run time for a scheduled task.
    /// </summary>
    public DateTime GetNextRunTime(ScheduledTask task)
    {
        var lastRun = task.LastRun;
        var nextRun = lastRun.Add(task.Interval);
        
        _logger.LogDebug(
            "Task {Name}: Last run {LastRun}, Next run {NextRun}",
            task.Name, lastRun, nextRun);
        
        return nextRun;
    }
}
