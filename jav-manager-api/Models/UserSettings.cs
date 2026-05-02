using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class UserSettings
{
    [Key]
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
