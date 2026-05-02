using jav_manager_api.Models;
using Serilog;
using System.Xml;

namespace jav_manager_api.Services;

public class XmlProcessor
{
    public Movie? ParseXmlFile(string xmlFileLocation)
    {
        Movie? movie = null;
        try
        {
            var xmlDoc = new XmlDocument();
            xmlDoc.Load(xmlFileLocation);
            var title = xmlDoc.GetElementsByTagName("title")[0]?.InnerText;
            var plot = xmlDoc.GetElementsByTagName("plot")[0]?.InnerText;
            var year = int.Parse(!string.IsNullOrEmpty(xmlDoc.GetElementsByTagName("year")[0]?.InnerText)
                ? xmlDoc.GetElementsByTagName("year")[0]!.InnerText
                : DateTime.Now.Year.ToString());
            var runtime = int.Parse(!string.IsNullOrEmpty(xmlDoc.GetElementsByTagName("runtime")[0]?.InnerText)
                ? xmlDoc.GetElementsByTagName("runtime")[0]!.InnerText
                : "0");
            var studio = xmlDoc.GetElementsByTagName("studio")[0]?.InnerText;
            var releaseDate = xmlDoc.GetElementsByTagName("release")[0]?.InnerText
                ?? xmlDoc.GetElementsByTagName("releasedate")[0]?.InnerText;
            var director = xmlDoc.GetElementsByTagName("director")[0]?.InnerText;
            var genres = GetGenres(title!, xmlDoc.GetElementsByTagName("genre"));
            var tags = GetTags(title!, xmlDoc.GetElementsByTagName("tag"));
            var actors = GetActors(xmlDoc.GetElementsByTagName("actor"));
            var label = xmlDoc.GetElementsByTagName("label")[0]?.InnerText;

            if (!string.IsNullOrEmpty(label))
            {
                genres.Add(label);
                tags.Add(label);
            }

            movie = new Movie
            {
                Title = title ?? string.Empty,
                Plot = plot ?? string.Empty,
                Year = year,
                Runtime = runtime,
                Director = director ?? string.Empty,
                Studio = studio ?? string.Empty,
                ReleaseDate = releaseDate ?? string.Empty,
            };

            movie.MovieActors = actors.Select(a => new MovieActor
            {
                ImdbId = movie.ImdbId,
                Actor = new Actor { Name = a }
            }).ToList();

            movie.MovieGenres = genres.Select(g => new MovieGenre
            {
                ImdbId = movie.ImdbId,
                Genre = new Genre { Name = g }
            }).ToList();

            movie.MovieTags = tags.Select(t => new MovieTag
            {
                ImdbId = movie.ImdbId,
                Tag = new Tag { Name = t }
            }).ToList();
        }
        catch (Exception ex)
        {
            Log.Error($"An error occurs when processing xml: {xmlFileLocation}. \n\r");
            Log.Error(ex.ToString());
        }
        return movie;
    }

    private List<string> GetGenres(string title, XmlNodeList rawGenres)
    {
        var genres = new List<string>();
        foreach (XmlNode rawGenre in rawGenres)
        {
            var genre = rawGenre.InnerText.Trim();
            if (!string.IsNullOrEmpty(genre) && !title.Contains(genre))
            {
                genres.Add(genre);
            }
        }
        return genres;
    }

    private List<string> GetTags(string title, XmlNodeList rawTags)
    {
        var tags = new List<string>();
        foreach (XmlNode rawTag in rawTags)
        {
            var tag = rawTag.InnerText.Trim();
            if (!string.IsNullOrEmpty(tag) && !title.Contains(tag))
            {
                tags.Add(tag);
            }
        }
        return tags;
    }

    private List<string> GetActors(XmlNodeList rawActors)
    {
        var actors = new List<string>();
        foreach (XmlNode rawActor in rawActors)
        {
            foreach (XmlNode n in rawActor.SelectNodes("name")!)
            {
                var actor = n.InnerText.Trim();
                if (!string.IsNullOrEmpty(actor))
                {
                    actors.Add(actor);
                }
            }
        }
        return actors;
    }
}
