using jav_manager_api.Data;
using jav_manager_api.Models;
using jav_manager_api.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace jav_manager_api.Services;

public class MovieService
{
    private readonly AppDbContext _context;
    private readonly ScrapeService _scrapeService;

    public MovieService(AppDbContext context, ScrapeService scrapeService)
    {
        _context = context;
        _scrapeService = scrapeService;
    }

    public async Task InsertMoviesAsync(List<Movie> scannedMovies, bool scrapeActorInfo = false, bool forceUpdate = false)
    {
        var count = 0;
        try
        {
            var distinctActorNames = scannedMovies
                .SelectMany(m => m.MovieActors.Select(ma => ma.Actor.Name))
                .Distinct()
                .ToList();

            var distinctGenreNames = scannedMovies
                .SelectMany(m => m.MovieGenres.Select(mg => mg.Genre.Name))
                .Distinct()
                .ToList();

            var distinctTagNames = scannedMovies
                .SelectMany(m => m.MovieTags.Select(mt => mt.Tag.Name))
                .Distinct()
                .ToList();

            await EnsureActorsExistAsync(distinctActorNames);
            await EnsureGenresExistAsync(distinctGenreNames);
            await EnsureTagsExistAsync(distinctTagNames);

            if (scrapeActorInfo)
            {
                await _scrapeService.ScrapeActorInfoAsync();
            }

            var dbActors = await _context.Actors.ToDictionaryAsync(a => a.Name);
            var dbGenres = await _context.Genres.ToDictionaryAsync(g => g.Name);
            var dbTags = await _context.Tags.ToDictionaryAsync(t => t.Name);

            foreach (var scannedMovie in scannedMovies)
            {
                try
                {
                    var existingMovie = await _context.Movies
                        .Include(m => m.MovieActors)
                        .Include(m => m.MovieGenres)
                        .Include(m => m.MovieTags)
                        .FirstOrDefaultAsync(m => m.ImdbId == scannedMovie.ImdbId);

                    if (existingMovie == null)
                    {
                        AddNewMovie(scannedMovie, dbActors, dbGenres, dbTags);
                        count++;
                    }
                    else if (IsUpdated(scannedMovie, existingMovie) || forceUpdate)
                    {
                        UpdateExistingMovie(existingMovie, scannedMovie, dbActors, dbGenres, dbTags);
                        count++;
                    }

                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Log.Error($"An error occurs when processing movie: {scannedMovie.ImdbId} \n\r");
                    Log.Error(ex.ToString());
                }
            }

            Log.Debug($"{count} movies have been added or updated!");
        }
        catch (Exception ex)
        {
            Log.Error("An error occurs when processing movies. \n\r");
            Log.Error(ex.ToString());
        }
    }

    public async Task<List<string>> DeleteMoviesFromDirectoryAsync(List<string> existingImdbIds)
    {
        var moviesToRemove = await _context.Movies
            .Where(m => existingImdbIds.Contains(m.ImdbId))
            .ToListAsync();

        _context.Movies.RemoveRange(moviesToRemove);
        await _context.SaveChangesAsync();

        return moviesToRemove.Select(m => m.ImdbId).ToList();
    }

    public async Task<List<string>> DeleteNonExistentMoviesAsync(List<string> existingImdbIds)
    {
        var moviesToRemove = await _context.Movies
            .Where(m => !existingImdbIds.Contains(m.ImdbId))
            .ToListAsync();

        _context.Movies.RemoveRange(moviesToRemove);
        await _context.SaveChangesAsync();

        return moviesToRemove.Select(m => m.ImdbId).ToList();
    }

    public async Task<List<MovieViewModel>> GetAllMoviesAsync(string sortBy = "DateAdded", string sortOrder = "desc")
    {
        var movies = await QueryMovies(sortBy, sortOrder).ToListAsync();
        return movies.Select(MapToViewModel).ToList();
    }

    public async Task<MovieViewModel?> GetByImdbIdAsync(string imdbId)
    {
        var movie = await _context.Movies
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
            .FirstOrDefaultAsync(m => m.ImdbId == imdbId);

        return movie == null ? null : MapToViewModel(movie);
    }

    public async Task<List<MovieViewModel>> GetRecentAsync(int days = 30, int limit = 50)
    {
        var cutoffDate = DateTime.Now.AddDays(-days).ToString("yyyy-MM-dd");
        var movies = await _context.Movies
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
            .Where(m => m.DateAdded.CompareTo(cutoffDate) >= 0)
            .OrderByDescending(m => m.DateAdded)
            .Take(limit)
            .ToListAsync();

        return movies.Select(MapToViewModel).ToList();
    }

    public async Task<List<int>> GetAllYearsAsync()
    {
        return await _context.Movies
            .Select(m => m.Year)
            .Distinct()
            .OrderByDescending(y => y)
            .ToListAsync();
    }

    public async Task<List<MovieViewModel>> GetFavoritesAsync()
    {
        var movies = await _context.Movies
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
            .Where(m => m.Favorite == 1)
            .OrderByDescending(m => m.DateAdded)
            .ToListAsync();

        return movies.Select(MapToViewModel).ToList();
    }

    public async Task<FilterResponse> FilterAsync(FilterRequest request)
    {
        var query = _context.Movies
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(m => m.ImdbId.Contains(request.SearchTerm) || m.Title.Contains(request.SearchTerm));
        }

        if (request.FavoriteOnly)
        {
            query = query.Where(m => m.Favorite == 1);
        }

        if (request.Actors.Count > 0)
        {
            if (request.IsAndOperator)
            {
                query = query.Where(m => request.Actors.All(a => m.MovieActors.Any(ma => ma.Actor.Name == a)));
            }
            else
            {
                query = query.Where(m => m.MovieActors.Any(ma => request.Actors.Contains(ma.Actor.Name)));
            }
        }

        if (request.Genres.Count > 0)
        {
            if (request.IsAndOperator)
            {
                query = query.Where(m => request.Genres.All(g => m.MovieGenres.Any(mg => mg.Genre.Name == g)));
            }
            else
            {
                query = query.Where(m => m.MovieGenres.Any(mg => request.Genres.Contains(mg.Genre.Name)));
            }
        }

        if (request.Tags.Count > 0)
        {
            if (request.IsAndOperator)
            {
                query = query.Where(m => request.Tags.All(t => m.MovieTags.Any(mt => mt.Tag.Name == t)));
            }
            else
            {
                query = query.Where(m => m.MovieTags.Any(mt => request.Tags.Contains(mt.Tag.Name)));
            }
        }

        if (request.Directors.Count > 0)
        {
            query = query.Where(m => request.Directors.Contains(m.Director));
        }

        if (request.Studios.Count > 0)
        {
            query = query.Where(m => request.Studios.Contains(m.Studio));
        }

        if (request.YearFrom.HasValue)
            query = query.Where(m => m.Year >= request.YearFrom.Value);
        if (request.YearTo.HasValue)
            query = query.Where(m => m.Year <= request.YearTo.Value);

        if (request.HeightFrom.HasValue || request.HeightTo.HasValue)
        {
            var heightFromStr = request.HeightFrom.HasValue ? $"{request.HeightFrom}cm" : string.Empty;
            var heightToStr = request.HeightTo.HasValue ? $"{request.HeightTo}cm" : string.Empty;
            if (request.HeightFrom.HasValue)
                query = query.Where(m => m.MovieActors.Any(ma => ma.Actor.Height.CompareTo(heightFromStr) >= 0));
            if (request.HeightTo.HasValue)
                query = query.Where(m => m.MovieActors.Any(ma => ma.Actor.Height.CompareTo(heightToStr) <= 0));
        }

        if (request.Cups.Count > 0)
        {
            query = query.Where(m => m.MovieActors.Any(ma => request.Cups.Contains(ma.Actor.Cup.Replace(" Cup", ""))));
        }

        if (request.AgeFrom.HasValue || request.AgeTo.HasValue)
        {
            var today = DateTime.Now.ToString("yyyy-MM-dd");
            if (request.AgeFrom.HasValue)
            {
                var birthCutoff = DateTime.Now.AddYears(-request.AgeFrom.Value).ToString("yyyy-MM-dd");
                query = query.Where(m => m.MovieActors.Any(ma =>
                    ma.Actor.DateofBirth != string.Empty && ma.Actor.DateofBirth.CompareTo(birthCutoff) <= 0));
            }
            if (request.AgeTo.HasValue)
            {
                var birthCutoff = DateTime.Now.AddYears(-request.AgeTo.Value).ToString("yyyy-MM-dd");
                query = query.Where(m => m.MovieActors.Any(ma =>
                    ma.Actor.DateofBirth != string.Empty && ma.Actor.DateofBirth.CompareTo(birthCutoff) >= 0));
            }
        }

        if (request.RatingFrom.HasValue)
        {
            query = query.Where(m => m.Rating >= request.RatingFrom.Value);
        }

        if (request.PlayedMin.HasValue)
        {
            query = query.Where(m => m.PlayedCount >= request.PlayedMin.Value);
        }
        if (request.PlayedMax.HasValue)
        {
            query = query.Where(m => m.PlayedCount <= request.PlayedMax.Value);
        }

        var totalCount = await query.CountAsync();

        query = ApplySorting(query, request.SortBy, request.SortOrder);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new FilterResponse
        {
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            Items = items.Select(MapToViewModel).ToList()
        };
    }

    public async Task<List<MovieViewModel>> SearchAsync(string searchTerm, int page = 1, int pageSize = 50)
    {
        var movies = await _context.Movies
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
            .Where(m => m.ImdbId.Contains(searchTerm) || m.Title.Contains(searchTerm))
            .OrderByDescending(m => m.DateAdded)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return movies.Select(MapToViewModel).ToList();
    }

    public async Task<bool> ToggleFavoriteAsync(string imdbId)
    {
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == imdbId);
        if (movie == null) return false;

        movie.Favorite = movie.Favorite == 1 ? 0 : 1;
        await _context.SaveChangesAsync();
        return movie.Favorite == 1;
    }

    public async Task<List<string>> GetAllDirectorsAsync()
    {
        return await _context.Movies
            .Where(m => !string.IsNullOrEmpty(m.Director))
            .Select(m => m.Director)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();
    }

    public async Task<List<string>> GetAllStudiosAsync()
    {
        return await _context.Movies
            .Where(m => !string.IsNullOrEmpty(m.Studio))
            .Select(m => m.Studio)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();
    }

    public async Task<int> GetCountAsync()
    {
        return await _context.Movies.CountAsync();
    }

    private async Task EnsureActorsExistAsync(List<string> actorNames)
    {
        var existing = await _context.Actors.Where(a => actorNames.Contains(a.Name)).Select(a => a.Name).ToListAsync();
        var missing = actorNames.Except(existing).ToList();
        foreach (var name in missing)
        {
            _context.Actors.Add(new Actor { Name = name });
        }
        await _context.SaveChangesAsync();
    }

    private async Task EnsureGenresExistAsync(List<string> genreNames)
    {
        var existing = await _context.Genres.Where(g => genreNames.Contains(g.Name)).Select(g => g.Name).ToListAsync();
        var missing = genreNames.Except(existing).ToList();
        foreach (var name in missing)
        {
            _context.Genres.Add(new Genre { Name = name });
        }
        await _context.SaveChangesAsync();
    }

    private async Task EnsureTagsExistAsync(List<string> tagNames)
    {
        var existing = await _context.Tags.Where(t => tagNames.Contains(t.Name)).Select(t => t.Name).ToListAsync();
        var missing = tagNames.Except(existing).ToList();
        foreach (var name in missing)
        {
            _context.Tags.Add(new Tag { Name = name });
        }
        await _context.SaveChangesAsync();
    }

    private void AddNewMovie(Movie movie, Dictionary<string, Actor> dbActors, Dictionary<string, Genre> dbGenres, Dictionary<string, Tag> dbTags)
    {
        var newMovie = new Movie
        {
            ImdbId = movie.ImdbId,
            Title = movie.Title,
            Plot = movie.Plot,
            Year = movie.Year,
            Runtime = movie.Runtime,
            Director = movie.Director,
            Studio = movie.Studio,
            PosterFileLocation = movie.PosterFileLocation,
            FanArtLocation = movie.FanArtLocation,
            MovieLocation = movie.MovieLocation,
            DateAdded = movie.DateAdded,
            ReleaseDate = movie.ReleaseDate,
        };

        foreach (var ma in movie.MovieActors)
        {
            if (dbActors.TryGetValue(ma.Actor.Name, out var actor))
            {
                newMovie.MovieActors.Add(new MovieActor { ImdbId = movie.ImdbId, ActorId = actor.Id });
            }
        }

        foreach (var mg in movie.MovieGenres)
        {
            if (dbGenres.TryGetValue(mg.Genre.Name, out var genre))
            {
                newMovie.MovieGenres.Add(new MovieGenre { ImdbId = movie.ImdbId, GenreId = genre.Id });
            }
        }

        foreach (var mt in movie.MovieTags)
        {
            if (dbTags.TryGetValue(mt.Tag.Name, out var tag))
            {
                newMovie.MovieTags.Add(new MovieTag { ImdbId = movie.ImdbId, TagId = tag.Id });
            }
        }

        _context.Movies.Add(newMovie);
    }

    private void UpdateExistingMovie(Movie existing, Movie scanned, Dictionary<string, Actor> dbActors, Dictionary<string, Genre> dbGenres, Dictionary<string, Tag> dbTags)
    {
        existing.Title = scanned.Title;
        existing.Plot = scanned.Plot;
        existing.Year = scanned.Year;
        existing.Runtime = scanned.Runtime;
        existing.Director = scanned.Director;
        existing.Studio = scanned.Studio;
        existing.PosterFileLocation = scanned.PosterFileLocation;
        existing.FanArtLocation = scanned.FanArtLocation;
        existing.MovieLocation = scanned.MovieLocation;
        existing.ReleaseDate = scanned.ReleaseDate;

        if (string.IsNullOrEmpty(existing.DateAdded) && !string.IsNullOrEmpty(scanned.DateAdded))
        {
            existing.DateAdded = scanned.DateAdded;
        }

        _context.MovieActors.RemoveRange(existing.MovieActors);
        _context.MovieGenres.RemoveRange(existing.MovieGenres);
        _context.MovieTags.RemoveRange(existing.MovieTags);

        foreach (var ma in scanned.MovieActors)
        {
            if (dbActors.TryGetValue(ma.Actor.Name, out var actor))
            {
                existing.MovieActors.Add(new MovieActor { ImdbId = scanned.ImdbId, ActorId = actor.Id });
            }
        }

        foreach (var mg in scanned.MovieGenres)
        {
            if (dbGenres.TryGetValue(mg.Genre.Name, out var genre))
            {
                existing.MovieGenres.Add(new MovieGenre { ImdbId = scanned.ImdbId, GenreId = genre.Id });
            }
        }

        foreach (var mt in scanned.MovieTags)
        {
            if (dbTags.TryGetValue(mt.Tag.Name, out var tag))
            {
                existing.MovieTags.Add(new MovieTag { ImdbId = scanned.ImdbId, TagId = tag.Id });
            }
        }
    }

    private bool IsUpdated(Movie scanned, Movie existing)
    {
        return scanned.Title != existing.Title
            || scanned.Plot != existing.Plot
            || scanned.Year != existing.Year
            || scanned.Runtime != existing.Runtime
            || scanned.Director != existing.Director
            || scanned.Studio != existing.Studio
            || scanned.MovieLocation != existing.MovieLocation;
    }

    private IQueryable<Movie> QueryMovies(string sortBy, string sortOrder)
    {
        var query = _context.Movies
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
            .AsQueryable();

        return ApplySorting(query, sortBy, sortOrder);
    }

    private IQueryable<Movie> ApplySorting(IQueryable<Movie> query, string sortBy, string sortOrder)
    {
        var descending = sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLower() switch
        {
            "title" => descending ? query.OrderByDescending(m => m.Title) : query.OrderBy(m => m.Title),
            "year" => descending ? query.OrderByDescending(m => m.Year) : query.OrderBy(m => m.Year),
            "rating" => descending ? query.OrderByDescending(m => m.Rating) : query.OrderBy(m => m.Rating),
            "playcount" => descending ? query.OrderByDescending(m => m.PlayedCount) : query.OrderBy(m => m.PlayedCount),
            _ => descending ? query.OrderByDescending(m => m.DateAdded) : query.OrderBy(m => m.DateAdded),
        };
    }

    private MovieViewModel MapToViewModel(Movie movie)
    {
        return new MovieViewModel
        {
            ImdbId = movie.ImdbId,
            Title = movie.Title,
            Plot = movie.Plot,
            Director = movie.Director,
            Studio = movie.Studio,
            PosterFileLocation = movie.PosterFileLocation,
            FanArtLocation = movie.FanArtLocation,
            MovieLocation = movie.MovieLocation,
            DateAdded = movie.DateAdded,
            ReleaseDate = movie.ReleaseDate,
            LastPlayedAt = movie.LastPlayedAt,
            Year = movie.Year,
            Runtime = movie.Runtime,
            PlayedCount = movie.PlayedCount,
            Progress = movie.Progress,
            Rating = movie.Rating,
            Favorite = movie.Favorite,
            Actors = movie.MovieActors.Select(ma => ma.Actor.Name).ToList(),
            Genres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
            Tags = movie.MovieTags.Select(mt => mt.Tag.Name).ToList()
        };
    }
}
