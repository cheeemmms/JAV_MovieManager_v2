namespace jav_manager_api.Models.DTOs;

public class ActorViewModel
{
    public string Name { get; set; } = string.Empty;
    public string DateofBirth { get; set; } = string.Empty;
    public string Height { get; set; } = string.Empty;
    public string Cup { get; set; } = string.Empty;
    public string Bust { get; set; } = string.Empty;
    public string Waist { get; set; } = string.Empty;
    public string Hips { get; set; } = string.Empty;
    public string Looks { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string SexAppeal { get; set; } = string.Empty;
    public string Overall { get; set; } = string.Empty;
    public string LastUpdated { get; set; } = string.Empty;
    public int Favorite { get; set; }
    public int MovieCount { get; set; }
}
