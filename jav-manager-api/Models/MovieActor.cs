using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class MovieActor
{
    [Key]
    public int Id { get; set; }
    public string ImdbId { get; set; } = string.Empty;
    public int ActorId { get; set; }

    public Movie Movie { get; set; } = null!;
    public Actor Actor { get; set; } = null!;
}
