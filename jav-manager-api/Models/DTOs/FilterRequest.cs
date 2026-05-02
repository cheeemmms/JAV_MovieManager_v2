namespace jav_manager_api.Models.DTOs;

public class FilterRequest
{
    public string SearchTerm { get; set; } = string.Empty;
    public List<string> Actors { get; set; } = new();
    public List<string> Genres { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public List<string> Directors { get; set; } = new();
    public List<string> Studios { get; set; } = new();
    public int? YearFrom { get; set; }
    public int? YearTo { get; set; }
    public int? HeightFrom { get; set; }
    public int? HeightTo { get; set; }
    public List<string> Cups { get; set; } = new();
    public int? AgeFrom { get; set; }
    public int? AgeTo { get; set; }
    public double? RatingFrom { get; set; }
    public int? PlayedMin { get; set; }
    public int? PlayedMax { get; set; }
    public bool FavoriteOnly { get; set; }
    public bool IsAndOperator { get; set; }
    public string SortBy { get; set; } = "DateAdded";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
