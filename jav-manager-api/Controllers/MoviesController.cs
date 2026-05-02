using jav_manager_api.Models.DTOs;
using jav_manager_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly MovieService _movieService;
    private readonly FileScannerService _scannerService;

    public MoviesController(MovieService movieService, FileScannerService scannerService)
    {
        _movieService = movieService;
        _scannerService = scannerService;
    }

    [HttpGet]
    public async Task<ActionResult<List<MovieViewModel>>> GetAll(
        [FromQuery] string sortBy = "DateAdded",
        [FromQuery] string sortOrder = "desc")
    {
        var movies = await _movieService.GetAllMoviesAsync(sortBy, sortOrder);
        return Ok(movies);
    }

    [HttpGet("{imdbId}")]
    public async Task<ActionResult<MovieViewModel>> GetById(string imdbId)
    {
        var movie = await _movieService.GetByImdbIdAsync(imdbId);
        if (movie == null) return NotFound();
        return Ok(movie);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<MovieViewModel>>> GetRecent(
        [FromQuery] int days = 30,
        [FromQuery] int limit = 50)
    {
        var movies = await _movieService.GetRecentAsync(days, limit);
        return Ok(movies);
    }

    [HttpGet("years")]
    public async Task<ActionResult<List<int>>> GetYears()
    {
        var years = await _movieService.GetAllYearsAsync();
        return Ok(years);
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<List<MovieViewModel>>> GetFavorites()
    {
        var movies = await _movieService.GetFavoritesAsync();
        return Ok(movies);
    }

    [HttpPost("filter")]
    public async Task<ActionResult<FilterResponse>> Filter([FromBody] FilterRequest request)
    {
        var result = await _movieService.FilterAsync(request);
        return Ok(result);
    }

    [HttpPost("search")]
    public async Task<ActionResult<List<MovieViewModel>>> Search([FromBody] SearchRequest request)
    {
        var movies = await _movieService.SearchAsync(request.SearchTerm, request.Page, request.PageSize);
        return Ok(movies);
    }

    [HttpPost("favorite/{imdbId}")]
    public async Task<ActionResult> ToggleFavorite(string imdbId)
    {
        var result = await _movieService.ToggleFavoriteAsync(imdbId);
        return Ok(new { imdbId, favorite = result });
    }

    [HttpPost("scan")]
    public async Task<ActionResult> Scan([FromBody] ScanRequest request)
    {
        var scannedMovies = _scannerService.ScanFiles(request.Directory, request.DateRange);
        await _movieService.InsertMoviesAsync(scannedMovies, request.ScrapeActorInfo, request.ForceUpdate);

        var allImdbIds = _scannerService.ScanFilesForImdbId(request.Directory);
        await _movieService.DeleteNonExistentMoviesAsync(allImdbIds);

        return Ok(new { scanned = scannedMovies.Count, total = await _movieService.GetCountAsync() });
    }
}

public class ScanRequest
{
    public string Directory { get; set; } = string.Empty;
    public int DateRange { get; set; } = -1;
    public bool ScrapeActorInfo { get; set; }
    public bool ForceUpdate { get; set; }
}
