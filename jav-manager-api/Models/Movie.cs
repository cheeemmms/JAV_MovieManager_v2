using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class Movie
{
    [Key]
    public string ImdbId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Plot { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Runtime { get; set; }
    public string Director { get; set; } = string.Empty;
    public string Studio { get; set; } = string.Empty;
    public string PosterFileLocation { get; set; } = string.Empty;
    public string FanArtLocation { get; set; } = string.Empty;
    public string MovieLocation { get; set; } = string.Empty;
    public string DateAdded { get; set; } = string.Empty;
    public string ReleaseDate { get; set; } = string.Empty;
    public int PlayedCount { get; set; }
    public string? LastPlayedAt { get; set; }
    public double Progress { get; set; }
    public double Rating { get; set; }
    public int Favorite { get; set; }

    public ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
    public ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
    public ICollection<MovieTag> MovieTags { get; set; } = new List<MovieTag>();
    public ICollection<PlaybackHistory> PlaybackHistories { get; set; } = new List<PlaybackHistory>();
}
