using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class Genre
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
}
