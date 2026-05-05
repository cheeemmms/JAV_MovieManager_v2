using System.Security.Cryptography;
using System.Text;
using jav_manager_api.Data;
using jav_manager_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("set-password")]
    public async Task<ActionResult> SetPassword([FromBody] SetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 4)
            return BadRequest(new { error = "Password must be at least 4 characters" });

        var existing = await _context.UserSettings
            .FirstOrDefaultAsync(s => s.Key == "AccessPassword");

        if (existing != null)
            return BadRequest(new { error = "Password already configured. Use change-password instead." });

        var salt = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        var hash = HashPassword(request.Password, salt);
        _context.UserSettings.Add(new UserSettings
        {
            Key = "AccessPassword",
            Value = $"{salt}:{hash}"
        });
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Password is required" });

        var storedPassword = await _context.UserSettings
            .FirstOrDefaultAsync(s => s.Key == "AccessPassword");

        if (storedPassword == null)
            return BadRequest(new { error = "Password not configured" });

        var parts = storedPassword.Value.Split(':', 2);
        if (parts.Length != 2)
            return StatusCode(500, new { error = "Invalid password storage format" });

        if (HashPassword(request.Password, parts[0]) != parts[1])
            return Unauthorized(new { error = "Invalid password" });

        var rawToken = Guid.NewGuid().ToString("N");
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
        var expiresAt = DateTime.UtcNow.AddDays(30);

        _context.AccessTokens.Add(new AccessToken
        {
            TokenHash = tokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            LastActiveAt = DateTime.UtcNow,
            UserAgent = Request.Headers.UserAgent.ToString()
        });
        await _context.SaveChangesAsync();

        return Ok(new { token = rawToken, expiresAt });
    }

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 4)
            return BadRequest(new { error = "New password must be at least 4 characters" });

        var storedPassword = await _context.UserSettings
            .FirstOrDefaultAsync(s => s.Key == "AccessPassword");

        if (storedPassword == null)
            return BadRequest(new { error = "Password not configured" });

        var parts = storedPassword.Value.Split(':', 2);
        if (parts.Length != 2)
            return StatusCode(500, new { error = "Invalid password storage format" });

        if (HashPassword(request.OldPassword, parts[0]) != parts[1])
            return Unauthorized(new { error = "Invalid current password" });

        var salt = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        var hash = HashPassword(request.NewPassword, salt);
        storedPassword.Value = $"{salt}:{hash}";

        var tokens = await _context.AccessTokens.ToListAsync();
        _context.AccessTokens.RemoveRange(tokens);

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet("status")]
    public async Task<ActionResult> GetStatus()
    {
        var hasPassword = await _context.UserSettings
            .AnyAsync(s => s.Key == "AccessPassword");

        var now = DateTime.UtcNow;
        var activeSessions = await _context.AccessTokens
            .Where(t => t.ExpiresAt > now)
            .CountAsync();

        return Ok(new { hasPassword, activeSessions });
    }

    [HttpPost("revoke-all")]
    public async Task<ActionResult> RevokeAll()
    {
        var tokens = await _context.AccessTokens.ToListAsync();
        _context.AccessTokens.RemoveRange(tokens);
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    private static string HashPassword(string password, string salt)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(password + salt)));
    }
}

public class LoginRequest
{
    public string Password { get; set; } = "";
}

public class SetPasswordRequest
{
    public string Password { get; set; } = "";
}

public class ChangePasswordRequest
{
    public string OldPassword { get; set; } = "";
    public string NewPassword { get; set; } = "";
}
