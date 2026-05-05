using System.Collections.Concurrent;

namespace jav_manager_api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _config;
    private static readonly ConcurrentDictionary<string, (int attempts, DateTime lockUntil)> _store = new();
    private static DateTime _lastCleanup = DateTime.UtcNow;
    private const int MaxAttempts = 5;
    private const int LockMinutes = 15;

    public RateLimitMiddleware(RequestDelegate next, IConfiguration config)
    {
        _next = next;
        _config = config;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_config.GetValue<bool>("RemoteAccess:Enabled")
            || context.Request.Path.Value?.ToLowerInvariant() != "/api/auth/login"
            || !HttpMethods.IsPost(context.Request.Method))
        {
            await _next(context);
            return;
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        CleanupIfNeeded();

        if (_store.TryGetValue(ip, out var entry) && entry.lockUntil > DateTime.UtcNow)
        {
            var remaining = (int)(entry.lockUntil - DateTime.UtcNow).TotalSeconds;
            context.Response.StatusCode = 429;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                $"{{\"error\":\"Too many attempts\",\"retryAfter\":{remaining}}}");
            return;
        }

        var originalBody = context.Response.Body;
        using var memStream = new MemoryStream();
        context.Response.Body = memStream;

        await _next(context);

        memStream.Seek(0, SeekOrigin.Begin);

        if (context.Response.StatusCode == 200)
        {
            _store.TryRemove(ip, out _);
        }
        else if (context.Response.StatusCode == 401)
        {
            var attempts = entry.attempts + 1;
            _store[ip] = attempts >= MaxAttempts
                ? (attempts, DateTime.UtcNow.AddMinutes(LockMinutes))
                : (attempts, DateTime.MinValue);
        }

        memStream.Seek(0, SeekOrigin.Begin);
        await memStream.CopyToAsync(originalBody);
        context.Response.Body = originalBody;
    }

    private static void CleanupIfNeeded()
    {
        if ((DateTime.UtcNow - _lastCleanup).TotalMinutes < 5) return;
        _lastCleanup = DateTime.UtcNow;
        foreach (var key in _store.Keys.ToList())
        {
            if (_store.TryGetValue(key, out var e) && e.lockUntil < DateTime.UtcNow)
                _store.TryRemove(key, out _);
        }
    }
}
