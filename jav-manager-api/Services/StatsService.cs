using jav_manager_api.Data;
using jav_manager_api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Services;

public class StatsService
{
    private readonly AppDbContext _context;

    public StatsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StatsResponse> GetDashboardStatsAsync()
    {
        var totalMovies = await _context.Movies.CountAsync();
        var totalActors = await _context.Actors.CountAsync();
        var totalGenres = await _context.Genres.CountAsync();
        var totalPlays = await _context.PlaybackHistories.CountAsync();
        var totalPlayTime = await _context.PlaybackHistories.SumAsync(ph => (long)ph.Duration);

        var averageRating = totalMovies > 0
            ? await _context.Movies.Where(m => m.Rating > 0).AverageAsync(m => m.Rating)
            : 0;

        var topActors = await _context.MovieActors
            .GroupBy(ma => ma.Actor.Name)
            .Select(g => new TopItem { Name = g.Key, Count = g.Count() })
            .OrderByDescending(t => t.Count)
            .Take(10)
            .ToListAsync();

        var topGenres = await _context.MovieGenres
            .GroupBy(mg => mg.Genre.Name)
            .Select(g => new TopItem { Name = g.Key, Count = g.Count() })
            .OrderByDescending(t => t.Count)
            .Take(10)
            .ToListAsync();

        var topStudios = await _context.Movies
            .Where(m => !string.IsNullOrEmpty(m.Studio))
            .GroupBy(m => m.Studio)
            .Select(g => new TopItem { Name = g.Key, Count = g.Count() })
            .OrderByDescending(t => t.Count)
            .Take(10)
            .ToListAsync();

        var thirtyDaysAgo = DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd");
        var trend = (await _context.PlaybackHistories
            .Where(ph => ph.StartedAt.CompareTo(thirtyDaysAgo) >= 0)
            .ToListAsync())
            .GroupBy(ph => ph.StartedAt[..10])
            .Select(g => new TrendItem { Date = g.Key, Count = g.Count() })
            .OrderBy(t => t.Date)
            .ToList();

        var oneYearAgo = DateTime.Now.AddYears(-1).ToString("yyyy-MM-dd");
        var heatmap = (await _context.PlaybackHistories
            .Where(ph => ph.StartedAt.CompareTo(oneYearAgo) >= 0)
            .ToListAsync())
            .GroupBy(ph => new { Year = int.Parse(ph.StartedAt[..4]), Month = ph.StartedAt[5..7] })
            .Select(g => new HeatmapItem { Year = g.Key.Year, Month = g.Key.Month, Count = g.Count() })
            .OrderBy(h => h.Year).ThenBy(h => h.Month)
            .ToList();

        return new StatsResponse
        {
            TotalMovies = totalMovies,
            TotalActors = totalActors,
            TotalGenres = totalGenres,
            TotalPlayTime = totalPlayTime,
            TotalPlays = totalPlays,
            AverageRating = Math.Round(averageRating, 1),
            TopActors = topActors,
            TopGenres = topGenres,
            TopStudios = topStudios,
            Trend = trend,
            Heatmap = heatmap
        };
    }
}
