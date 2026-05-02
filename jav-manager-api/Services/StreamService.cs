using jav_manager_api.Data;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Services;

public class StreamService
{
    private readonly AppDbContext _context;

    public StreamService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StreamInfo?> GetStreamInfoAsync(string imdbId)
    {
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == imdbId);
        if (movie == null) return null;

        var locations = movie.MovieLocation.Split('|', StringSplitOptions.RemoveEmptyEntries);
        if (locations.Length == 0) return null;

        var firstLocation = locations[0];
        if (!File.Exists(firstLocation)) return null;

        var fileInfo = new FileInfo(firstLocation);

        return new StreamInfo
        {
            ImdbId = movie.ImdbId,
            FilePath = firstLocation,
            FileSize = fileInfo.Length,
        };
    }

    public string? GetMovieFilePath(string imdbId)
    {
        var movie = _context.Movies.FirstOrDefault(m => m.ImdbId == imdbId);
        if (movie == null) return null;

        var locations = movie.MovieLocation.Split('|', StringSplitOptions.RemoveEmptyEntries);
        if (locations.Length == 0) return null;

        var path = locations[0];
        return File.Exists(path) ? path : null;
    }
}

public class StreamInfo
{
    public string ImdbId { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
}
