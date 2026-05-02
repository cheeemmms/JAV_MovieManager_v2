using jav_manager_api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    private readonly AppDbContext _context;

    public ImageController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("poster/{imdbId}")]
    public async Task<IActionResult> GetPoster(string imdbId)
    {
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == imdbId);
        if (movie == null || string.IsNullOrEmpty(movie.PosterFileLocation))
            return NoContent();

        return ServeImage(movie.PosterFileLocation);
    }

    [HttpGet("fanart/{imdbId}")]
    public async Task<IActionResult> GetFanArt(string imdbId)
    {
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == imdbId);
        if (movie == null || string.IsNullOrEmpty(movie.FanArtLocation))
            return NoContent();

        return ServeImage(movie.FanArtLocation);
    }

    private IActionResult ServeImage(string filePath)
    {
        if (!System.IO.File.Exists(filePath))
            return NoContent();

        var ext = Path.GetExtension(filePath).ToLower();
        var contentType = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return new FileStreamResult(stream, contentType);
    }
}
