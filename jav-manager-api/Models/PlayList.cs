using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class PlayList
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;

    public ICollection<PlayListItem> PlayListItems { get; set; } = new List<PlayListItem>();
}
