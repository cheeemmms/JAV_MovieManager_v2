namespace jav_manager_api.Models.DTOs;

public class MovieViewModel
{
    public string ImdbId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Director { get; set; } = string.Empty;
    public string Studio { get; set; } = string.Empty;
    public string PosterFileLocation { get; set; } = string.Empty;
    public string FanArtLocation { get; set; } = string.Empty;
    public string MovieLocation { get; set; } = string.Empty;
    public string DateAdded { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Runtime { get; set; }
    public int PlayedCount { get; set; }
    public double Progress { get; set; }
    public double Rating { get; set; }
    public int Favorite { get; set; }
    public List<string> Actors { get; set; } = new();
    public List<string> Genres { get; set; } = new();
    public List<string> Tags { get; set; } = new();
}
