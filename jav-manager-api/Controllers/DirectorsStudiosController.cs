using jav_manager_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DirectorsController : ControllerBase
{
    private readonly MovieService _movieService;

    public DirectorsController(MovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var directors = await _movieService.GetAllDirectorsAsync();
        return Ok(directors);
    }
}

[ApiController]
[Route("api/[controller]")]
public class StudiosController : ControllerBase
{
    private readonly MovieService _movieService;

    public StudiosController(MovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var studios = await _movieService.GetAllStudiosAsync();
        return Ok(studios);
    }
}
