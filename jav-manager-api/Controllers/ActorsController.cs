using jav_manager_api.Models.DTOs;
using jav_manager_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActorsController : ControllerBase
{
    private readonly ActorService _actorService;
    private readonly ScrapeService _scrapeService;

    public ActorsController(ActorService actorService, ScrapeService scrapeService)
    {
        _actorService = actorService;
        _scrapeService = scrapeService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ActorViewModel>>> GetAll([FromQuery] string? search = null)
    {
        var actors = string.IsNullOrEmpty(search)
            ? await _actorService.GetAllAsync()
            : await _actorService.GetByNameAsync(search);
        return Ok(actors);
    }

    [HttpGet("{name}")]
    public async Task<ActionResult<ActorViewModel>> GetDetail(string name)
    {
        var actor = await _actorService.GetDetailAsync(name);
        if (actor == null) return NotFound();
        return Ok(actor);
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<List<string>>> GetFavorites()
    {
        var names = await _actorService.GetFavoriteActorNamesAsync();
        return Ok(names);
    }

    [HttpGet("local")]
    public async Task<ActionResult<List<string>>> GetLocal()
    {
        var names = await _actorService.GetLocalActorsAsync();
        return Ok(names);
    }

    [HttpPost("filter")]
    public async Task<ActionResult<List<string>>> Filter([FromBody] ActorFilterRequest request)
    {
        var names = await _actorService.GetNamesByRangeAsync(
            request.HeightFrom, request.HeightTo,
            request.CupLower ?? "A", request.CupUpper ?? "Z",
            request.Age);
        return Ok(names);
    }

    [HttpPost("favorite/{name}")]
    public async Task<ActionResult> ToggleFavorite(string name)
    {
        var result = await _actorService.ToggleFavoriteAsync(name);
        return Ok(new { name, favorite = result });
    }

    [HttpPost("scrape")]
    public async Task<ActionResult> Scrape()
    {
        await _scrapeService.ScrapeActorInfoAsync();
        return Ok(new { message = "Scrape completed" });
    }
}

public class ActorFilterRequest
{
    public int HeightFrom { get; set; } = 140;
    public int HeightTo { get; set; } = 190;
    public string? CupLower { get; set; } = "A";
    public string? CupUpper { get; set; } = "Z";
    public int Age { get; set; } = 50;
}
