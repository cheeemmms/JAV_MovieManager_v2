using jav_manager_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace jav_manager_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StreamController : ControllerBase
{
    private readonly StreamService _streamService;

    public StreamController(StreamService streamService)
    {
        _streamService = streamService;
    }

    [HttpGet("{imdbId}")]
    public IActionResult GetStream(string imdbId)
    {
        var filePath = _streamService.GetMovieFilePath(imdbId);
        if (filePath == null) return NotFound();

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return new FileStreamResult(stream, "video/mp4")
        {
            EnableRangeProcessing = true
        };
    }

    [HttpGet("{imdbId}/info")]
    public async Task<ActionResult> GetStreamInfo(string imdbId)
    {
        var info = await _streamService.GetStreamInfoAsync(imdbId);
        if (info == null) return NotFound();
        return Ok(info);
    }

    [HttpGet("{imdbId}/subtitle")]
    public IActionResult GetSubtitle(string imdbId)
    {
        var subtitle = _streamService.GetSubtitleContent(imdbId);
        if (subtitle == null) return NoContent();

        var contentType = subtitle.Value.Extension switch
        {
            ".vtt" => "text/vtt; charset=utf-8",
            ".srt" => "text/plain; charset=utf-8",
            ".ass" => "text/plain; charset=utf-8",
            _ => "text/plain; charset=utf-8",
        };

        return File(subtitle.Value.Content, contentType);
    }
}
