using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class Tag
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<MovieTag> MovieTags { get; set; } = new List<MovieTag>();
}
