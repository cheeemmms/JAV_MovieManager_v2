using System.ComponentModel.DataAnnotations;

namespace jav_manager_api.Models;

public class AccessToken
{
    [Key]
    public int Id { get; set; }
    public string TokenHash { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public string UserAgent { get; set; } = "";
}
