using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class MovieGenre
{
    [Key]
    public int Id { get; set; }
    public string ImdbId { get; set; } = string.Empty;
    public int GenreId { get; set; }

    public Movie Movie { get; set; } = null!;
    public Genre Genre { get; set; } = null!;
}
