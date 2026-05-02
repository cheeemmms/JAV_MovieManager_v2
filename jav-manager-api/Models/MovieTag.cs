using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class MovieTag
{
    [Key]
    public int Id { get; set; }
    public string ImdbId { get; set; } = string.Empty;
    public int TagId { get; set; }

    public Movie Movie { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
