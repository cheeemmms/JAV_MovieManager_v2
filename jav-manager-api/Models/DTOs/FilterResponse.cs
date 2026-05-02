namespace jav_manager_api.Models.DTOs;

public class FilterResponse
{
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public List<MovieViewModel> Items { get; set; } = new();
}
