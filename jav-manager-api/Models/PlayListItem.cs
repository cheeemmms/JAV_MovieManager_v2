using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class PlayListItem
{
    [Key]
    public int Id { get; set; }
    public int PlayListId { get; set; }
    public string ImdbId { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public PlayList PlayList { get; set; } = null!;
}
