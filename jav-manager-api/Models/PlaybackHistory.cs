using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class PlaybackHistory
{
    [Key]
    public int Id { get; set; }
    public string MovieId { get; set; } = string.Empty;
    public string StartedAt { get; set; } = string.Empty;
    public string? EndedAt { get; set; }
    public int Duration { get; set; }
    public double Percentage { get; set; }
    public string CreatedAt { get; set; } = string.Empty;

    public Movie Movie { get; set; } = null!;
}
