using jav_manager_api.Models.DTOs;
using jav_manager_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly StatsService _statsService;

    public StatsController(StatsService statsService)
    {
        _statsService = statsService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<StatsResponse>> GetDashboard()
    {
        var stats = await _statsService.GetDashboardStatsAsync();
        return Ok(stats);
    }
}
