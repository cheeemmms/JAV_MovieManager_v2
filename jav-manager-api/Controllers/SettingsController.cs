using jav_manager_api.Data;
using jav_manager_api.Models;
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
}
