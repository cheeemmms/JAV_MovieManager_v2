using jav_manager_api.Data;
using jav_manager_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/history")]
public class HistoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public HistoryController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateHistoryRequest request)
    {
        var history = new PlaybackHistory
        {
            MovieId = request.MovieId,
            StartedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            Duration = request.Duration,
            Percentage = request.Percentage,
            CreatedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss")
        };

        _context.PlaybackHistories.Add(history);
        await _context.SaveChangesAsync();

        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == request.MovieId);
        if (movie != null)
        {
            movie.PlayedCount++;
            movie.Progress = request.Percentage;
            movie.LastPlayedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
            await _context.SaveChangesAsync();
        }

        return Ok(new { id = history.Id });
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateHistoryRequest request)
    {
        var history = await _context.PlaybackHistories.FindAsync(id);
        if (history == null) return NotFound();

        var now = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        history.EndedAt = now;
        history.Duration = request.Duration;
        history.Percentage = request.Percentage;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("movie/{imdbId}")]
    public async Task<ActionResult> GetByMovie(string imdbId)
    {
        var histories = await _context.PlaybackHistories
            .Where(ph => ph.MovieId == imdbId)
            .OrderByDescending(ph => ph.StartedAt)
            .Take(50)
            .ToListAsync();
        return Ok(histories);
    }
}

public class CreateHistoryRequest
{
    public string MovieId { get; set; } = string.Empty;
    public int Duration { get; set; }
    public double Percentage { get; set; }
}

public class UpdateHistoryRequest
{
    public int Duration { get; set; }
    public double Percentage { get; set; }
}
