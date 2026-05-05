using System.Security.Cryptography;
using System.Text;
using jav_manager_api.Data;
using jav_manager_api.Models;
using jav_manager_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var settings = await _context.UserSettings.ToListAsync();
        return Ok(settings.ToDictionary(s => s.Key, s => s.Value));
    }

    [HttpGet("{key}")]
    public async Task<ActionResult> Get(string key)
    {
        var setting = await _context.UserSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null) return NotFound();
        return Ok(setting.Value);
    }

    [HttpPut]
    public async Task<ActionResult> Set([FromBody] Dictionary<string, string> settings)
    {
        foreach (var kvp in settings)
        {
            var existing = await _context.UserSettings.FirstOrDefaultAsync(s => s.Key == kvp.Key);
            if (existing != null)
            {
                existing.Value = kvp.Value;
            }
            else
            {
                _context.UserSettings.Add(new UserSettings { Key = kvp.Key, Value = kvp.Value });
            }
        }
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpPut("password")]
    public async Task<ActionResult> SetPassword([FromBody] SetPasswordBody body)
    {
        if (string.IsNullOrWhiteSpace(body.Password) || body.Password.Length < 4)
            return BadRequest(new { error = "Password must be at least 4 characters" });

        var salt = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(body.Password + salt)));

        var existing = await _context.UserSettings.FirstOrDefaultAsync(s => s.Key == "AccessPassword");
        if (existing != null)
            existing.Value = $"{salt}:{hash}";
        else
            _context.UserSettings.Add(new UserSettings { Key = "AccessPassword", Value = $"{salt}:{hash}" });

        var tokens = await _context.AccessTokens.ToListAsync();
        _context.AccessTokens.RemoveRange(tokens);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet("remote-access")]
    public ActionResult GetRemoteAccessConfig()
    {
        var enabled = HttpContext.RequestServices.GetRequiredService<IConfiguration>()
            .GetValue<bool>("RemoteAccess:Enabled");
        var localIPs = NetworkHelper.GetLocalIPs();
        return Ok(new { enabled, localIPs });
    }

    [HttpGet("network-info")]
    public async Task<ActionResult> GetNetworkInfo()
    {
        var localIPs = NetworkHelper.GetLocalIPs();
        var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var port = config.GetValue<int>("RemoteAccess:Port");
        var portOpen = await NetworkHelper.CheckPortForwardingAsync(port);

        return Ok(new { localIPs, port, portForwardingDetected = portOpen });
    }

    [HttpGet("sessions")]
    public async Task<ActionResult> GetSessions()
    {
        var now = DateTime.UtcNow;
        var sessions = await _context.AccessTokens
            .Where(t => t.ExpiresAt > now)
            .OrderByDescending(t => t.LastActiveAt)
            .Select(t => new
            {
                id = t.Id,
                deviceType = ParseDeviceType(t.UserAgent),
                createdAt = t.CreatedAt,
                expiresAt = t.ExpiresAt,
                lastActiveAt = t.LastActiveAt,
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpDelete("sessions/{id:int}")]
    public async Task<ActionResult> RevokeSession(int id)
    {
        var token = await _context.AccessTokens.FindAsync(id);
        if (token == null) return NotFound();
        _context.AccessTokens.Remove(token);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpDelete("sessions")]
    public async Task<ActionResult> RevokeAllSessions()
    {
        var tokens = await _context.AccessTokens.ToListAsync();
        _context.AccessTokens.RemoveRange(tokens);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    private static string ParseDeviceType(string userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Unknown";
        var ua = userAgent.ToLowerInvariant();
        if (ua.Contains("iphone") || ua.Contains("ipad")) return "iPhone / iPad";
        if (ua.Contains("android")) return "Android";
        return "Desktop";
    }
}

public class SetPasswordBody
{
    public string Password { get; set; } = "";
}
