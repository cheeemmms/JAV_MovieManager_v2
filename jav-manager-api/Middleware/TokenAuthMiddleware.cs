using System.Security.Cryptography;
using System.Text;
using jav_manager_api.Data;
using jav_manager_api.Services;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Middleware;

public class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _config;

    public TokenAuthMiddleware(RequestDelegate next, IConfiguration config)
    {
        _next = next;
        _config = config;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_config.GetValue<bool>("RemoteAccess:Enabled"))
        {
            await _next(context);
            return;
        }

        var path = context.Request.Path.Value?.ToLowerInvariant();

        if (path == "/api/auth/login" || path == "/api/auth/set-password")
        {
            await _next(context);
            return;
        }

        if (path == null || !path.StartsWith("/api/"))
        {
            await _next(context);
            return;
        }

        var remoteIp = context.Connection.RemoteIpAddress;
        if (NetworkHelper.IsLocalMachineIP(remoteIp))
        {
            await _next(context);
            return;
        }

        var token = context.Request.Headers["X-Auth-Token"].FirstOrDefault()
            ?? context.Request.Query["token"].FirstOrDefault();
        if (string.IsNullOrEmpty(token))
        {
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"Authentication required\"}");
            return;
        }

        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var db = context.RequestServices.GetRequiredService<AppDbContext>();
        var record = await db.AccessTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (record == null || record.ExpiresAt < DateTime.UtcNow)
        {
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"Invalid or expired token\"}");
            return;
        }

        record.LastActiveAt = DateTime.UtcNow;
        if (record.ExpiresAt - DateTime.UtcNow < TimeSpan.FromDays(7))
            record.ExpiresAt = DateTime.UtcNow.AddDays(30);
        await db.SaveChangesAsync();

        await _next(context);
    }
}
