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

                var text = encoding != null && encoding != System.Text.Encoding.UTF8
                    ? System.Text.Encoding.UTF8.GetString(System.Text.Encoding.Convert(encoding, System.Text.Encoding.UTF8, rawBytes))
                    : System.Text.Encoding.UTF8.GetString(rawBytes);

                if (ext == ".srt")
                {
                    text = ConvertSrtToVtt(text);
                }
                else if (ext == ".ass")
                {
                    text = ConvertAssToVtt(text);
                }

                return (System.Text.Encoding.UTF8.GetBytes(text), ".vtt");
            }
        }

        return null;
    }

    private static string ConvertSrtToVtt(string srt)
    {
        var lines = srt.Replace("\r\n", "\n").Replace("\r", "\n").Split('\n');
        var result = new System.Text.StringBuilder();
        result.AppendLine("WEBVTT");
        result.AppendLine();

        var i = 0;
        while (i < lines.Length)
        {
            var line = lines[i].Trim();

            if (string.IsNullOrEmpty(line))
            {
                i++;
                continue;
            }

            if (int.TryParse(line, out _))
            {
                i++;
                if (i < lines.Length && lines[i].Contains("-->"))
                {
                    var timeLine = lines[i].Replace(',', '.');
                    result.AppendLine(timeLine);

                    i++;
                    while (i < lines.Length && !string.IsNullOrEmpty(lines[i]))
                    {
                        result.AppendLine(lines[i]);
                        i++;
                    }
                    result.AppendLine();
                }
                continue;
            }

            i++;
        }

        return result.ToString();
    }

    private static string ConvertAssToVtt(string ass)
    {
        var lines = ass.Replace("\r\n", "\n").Replace("\r", "\n").Split('\n');
        var result = new System.Text.StringBuilder();
        result.AppendLine("WEBVTT");
        result.AppendLine();

        var inEvents = false;

        foreach (var rawLine in lines)
        {
            var line = rawLine.Trim();

            if (line.StartsWith("[Events]", StringComparison.OrdinalIgnoreCase))
            {
                inEvents = true;
                continue;
            }

            if (inEvents && line.StartsWith("["))
            {
                inEvents = false;
                continue;
            }

            if (!inEvents || !line.StartsWith("Dialogue:", StringComparison.OrdinalIgnoreCase))
                continue;

            var parts = line.Substring("Dialogue:".Length).Split(',', 10);
            if (parts.Length < 10) continue;

            var start = parts[1].Trim();
            var end = parts[2].Trim();
            var text = parts[9].Trim();

            text = text.Replace("\\N", "\n").Replace("\\n", "\n")
                       .Replace("{\\", "<").Replace("}", ">");

            result.AppendLine($"{start} --> {end}");
            result.AppendLine(text);
            result.AppendLine();
        }

        return result.ToString();
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
