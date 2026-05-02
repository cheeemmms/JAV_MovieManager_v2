using jav_manager_api.Models;
using Serilog;
using System.Text.RegularExpressions;

namespace jav_manager_api.Services;

public class FileScannerService
{
    private readonly XmlProcessor _xmlProcessor;
    private static readonly List<string> MovieExtensions = new() { ".avi", ".mp4", ".wmv", ".mkv" };

    public FileScannerService(XmlProcessor xmlProcessor)
    {
        _xmlProcessor = xmlProcessor;
    }

    public List<Movie> ScanFiles(string rootDirectory, int dateRange = -1)
    {
        var movies = new List<Movie>();
        try
        {
            var allMovies = Directory.GetFiles(rootDirectory, "*.*", SearchOption.AllDirectories)
                .Where(f => MovieExtensions.Any(ext => f.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            var nfos = dateRange == -1
                ? Directory.GetFiles(rootDirectory, "*.nfo", SearchOption.AllDirectories).ToList()
                : Directory.GetFiles(rootDirectory, "*.nfo", SearchOption.AllDirectories)
                    .Where(f => File.GetCreationTime(f) >= DateTime.Now.AddDays(-dateRange))
                    .ToList();

            movies = ProcessNfos(nfos, allMovies);
        }
        catch (Exception ex)
        {
            Log.Error("An error occurs when scanning files! \n\r");
            Log.Error(ex.ToString());
        }
        return movies;
    }

    public List<Movie> ScanFiles(string rootDirectory, DateTime startDate)
    {
        var movies = new List<Movie>();
        try
        {
            var allMovies = Directory.GetFiles(rootDirectory, "*.*", SearchOption.AllDirectories)
                .Where(f => MovieExtensions.Any(ext => f.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            var nfos = Directory.GetFiles(rootDirectory, "*.nfo", SearchOption.AllDirectories)
                .Where(f => File.GetCreationTime(f) >= startDate)
                .ToList();

            movies = ProcessNfos(nfos, allMovies);
        }
        catch (Exception ex)
        {
            Log.Error("An error occurs when scanning files! \n\r");
            Log.Error(ex.ToString());
        }
        return movies;
    }

    public List<string> ScanFilesForImdbId(string rootDirectory)
    {
        var imdbIds = new List<string>();
        try
        {
            var dirs = rootDirectory.Split('|');
            foreach (var dir in dirs)
            {
                var nfos = Directory.GetFiles(dir.Trim(), "*.nfo", SearchOption.AllDirectories).ToList();
                foreach (var nfo in nfos)
                {
                    try
                    {
                        var imdbId = _xmlProcessor.ParseXmlFile(nfo)?.Title?.Split(' ')[0];
                        var regex = new Regex(@"^[A-Z]{4}-\d{3,}$");
                        if (string.IsNullOrEmpty(imdbId) || !regex.IsMatch(imdbId))
                        {
                            regex = new Regex(@"[A-Z]{3,5}-\d{2,5}");
                            var match = regex.Match(_xmlProcessor.ParseXmlFile(nfo)?.Title ?? string.Empty);
                            if (match.Success)
                            {
                                imdbId = match.Value;
                            }
                        }
                        if (!string.IsNullOrEmpty(imdbId))
                        {
                            imdbIds.Add(imdbId);
                        }
                    }
                    catch (Exception ex)
                    {
                        Log.Error("An error occurs when scanning files for imdb ids! \n\r");
                        Log.Error(ex.ToString());
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Log.Error("An error occurs when scanning files for imdb ids! \n\r");
            Log.Error(ex.ToString());
        }
        return imdbIds;
    }

    private List<Movie> ProcessNfos(List<string> nfos, List<string> allMovies)
    {
        var movies = new List<Movie>();
        var currentNfo = string.Empty;
        try
        {
            foreach (var nfo in nfos)
            {
                currentNfo = nfo;
                var movie = _xmlProcessor.ParseXmlFile(nfo);
                if (movie == null) continue;

                var imdb = movie.Title.Split(' ')[0];
                var regex = new Regex(@"^[A-Z]{4}-\d{3,}$");
                if (string.IsNullOrEmpty(imdb) || !regex.IsMatch(imdb))
                {
                    regex = new Regex(@"[A-Z]{3,5}-\d{2,5}");
                    var match = regex.Match(movie.Title);
                    if (match.Success)
                    {
                        imdb = match.Value;
                    }
                }

                if (string.IsNullOrEmpty(imdb)) continue;

                movie.ImdbId = imdb;
                var movieFileLoc = allMovies.Where(x => x.Contains(imdb)).ToList();
                if (movieFileLoc.Count == 0)
                {
                    Log.Warning($"Skipped nfo files: {currentNfo} because the movie location is null.\n\r");
                    continue;
                }

                movie.MovieLocation = string.Join("|", movieFileLoc);

                var nfoFileName = Path.GetFileNameWithoutExtension(nfo);
                var moviePath = Path.GetDirectoryName(movieFileLoc.First())!;
                var movieName = Path.GetFileNameWithoutExtension(movieFileLoc.First());

                var fanArtLoc = Directory.GetFiles(moviePath, $"{movieName}-fanart.jpg").FirstOrDefault()
                    ?? Directory.GetFiles(moviePath, $"{nfoFileName}-fanart.jpg").FirstOrDefault()
                    ?? Directory.GetFiles(moviePath).FirstOrDefault(f => Path.GetFileName(f).Contains("fanart", StringComparison.OrdinalIgnoreCase));

                var posterLoc = Directory.GetFiles(moviePath, $"{movieName}-poster.jpg").FirstOrDefault()
                    ?? Directory.GetFiles(moviePath, $"{nfoFileName}-poster.jpg").FirstOrDefault()
                    ?? Directory.GetFiles(moviePath).FirstOrDefault(f => Path.GetFileName(f).Contains("poster", StringComparison.OrdinalIgnoreCase));

                movie.FanArtLocation = fanArtLoc ?? string.Empty;
                movie.PosterFileLocation = posterLoc ?? string.Empty;
                movie.DateAdded = File.GetCreationTime(movieFileLoc.First()).ToString("yyyy-MM-dd");

                movies.Add(movie);
            }
        }
        catch (Exception ex)
        {
            Log.Error($"An error occurs when processing nfo files: {currentNfo} \n\r");
            Log.Error(ex.ToString());
        }
        return movies;
    }
}
