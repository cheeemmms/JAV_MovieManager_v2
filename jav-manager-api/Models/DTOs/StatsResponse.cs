namespace jav_manager_api.Models.DTOs;

public class StatsResponse
{
    public int TotalMovies { get; set; }
    public int TotalActors { get; set; }
    public int TotalGenres { get; set; }
    public long TotalPlayTime { get; set; }
    public int TotalPlays { get; set; }
    public double AverageRating { get; set; }
    public List<TopItem> TopMovies { get; set; } = new();
    public List<TopItem> TopActors { get; set; } = new();
    public List<TopItem> TopGenres { get; set; } = new();
    public List<TopItem> TopStudios { get; set; } = new();
    public List<TrendItem> Trend { get; set; } = new();
    public List<HeatmapItem> Heatmap { get; set; } = new();
    public List<DailyPlayItem> DailyPlays { get; set; } = new();
}

public class TopItem
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TrendItem
{
    public string Date { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class HeatmapItem
{
    public string Month { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Count { get; set; }
}

public class DailyPlayItem
{
    public string Date { get; set; } = string.Empty;
    public int Count { get; set; }
}
