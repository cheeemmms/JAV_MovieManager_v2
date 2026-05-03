using jav_manager_api.Data;
using Microsoft.EntityFrameworkCore;
using Ude;

namespace jav_manager_api.Services;

public class StreamService
{
    private readonly AppDbContext _context;

    public StreamService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StreamInfo?> GetStreamInfoAsync(string imdbId)
    {
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == imdbId);
        if (movie == null) return null;

        var locations = movie.MovieLocation.Split('|', StringSplitOptions.RemoveEmptyEntries);
        if (locations.Length == 0) return null;

        var firstLocation = locations[0];
        if (!File.Exists(firstLocation)) return null;

        var fileInfo = new FileInfo(firstLocation);

        return new StreamInfo
        {
            ImdbId = movie.ImdbId,
            FilePath = firstLocation,
            FileSize = fileInfo.Length,
        };
    }

    public string? GetMovieFilePath(string imdbId)
    {
        var movie = _context.Movies.FirstOrDefault(m => m.ImdbId == imdbId);
        if (movie == null) return null;

        var locations = movie.MovieLocation.Split('|', StringSplitOptions.RemoveEmptyEntries);
        if (locations.Length == 0) return null;

        var path = locations[0];
        return File.Exists(path) ? path : null;
    }

    public (byte[] Content, string Extension)? GetSubtitleContent(string imdbId)
    {
        var filePath = GetMovieFilePath(imdbId);
        if (filePath == null) return null;

        var directory = Path.GetDirectoryName(filePath);
        if (directory == null) return null;

        var movieFileName = Path.GetFileNameWithoutExtension(filePath);
        var subtitleExtensions = new[] { ".vtt", ".srt", ".ass" };

        foreach (var ext in subtitleExtensions)
        {
            var subtitlePath = Path.Combine(directory, movieFileName + ext);
            if (File.Exists(subtitlePath))
            {
                var rawBytes = File.ReadAllBytes(subtitlePath);
                var encoding = DetectEncoding(rawBytes);

                if (encoding != null && encoding != System.Text.Encoding.UTF8)
                {
                    var utf8Bytes = System.Text.Encoding.Convert(encoding, System.Text.Encoding.UTF8, rawBytes);
                    return (utf8Bytes, ext);
                }

                return (rawBytes, ext);
            }
        }

        return null;
    }

    private static System.Text.Encoding? DetectEncoding(byte[] rawData)
    {
        var detector = new CharsetDetector();
        detector.Feed(rawData, 0, rawData.Length);
        detector.DataEnd();

        if (detector.Charset != null)
        {
            try
            {
                return System.Text.Encoding.GetEncoding(detector.Charset);
            }
            catch
            {
                return null;
            }
        }

        return null;
    }
}

public class StreamInfo
{
    public string ImdbId { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
}
