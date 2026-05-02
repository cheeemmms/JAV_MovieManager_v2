using jav_manager_api.Data;
using jav_manager_api.Models;
using jav_manager_api.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace jav_manager_api.Services;

public class ActorService
{
    private readonly AppDbContext _context;

    public ActorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActorViewModel>> GetAllAsync()
    {
        var actors = await _context.Actors.OrderBy(a => a.Name).ToListAsync();
        return actors.Select(a => MapToViewModel(a)).ToList();
    }

    public async Task<List<ActorViewModel>> GetByNameAsync(string searchString)
    {
        var actors = await _context.Actors
            .Where(a => a.Name.Contains(searchString))
            .OrderBy(a => a.Name)
            .ToListAsync();
        return actors.Select(a => MapToViewModel(a)).ToList();
    }

    public async Task<List<string>> GetAllNamesAsync()
    {
        return await _context.Actors.OrderBy(a => a.Name).Select(a => a.Name).ToListAsync();
    }

    public async Task<List<string>> GetNamesByRangeAsync(int heightLower, int heightUpper, string cupLower, string cupUpper, int age)
    {
        var heightLowerStr = $"{heightLower}cm";
        var heightUpperStr = $"{heightUpper}cm";

        var query = _context.Actors.AsQueryable();

        if (heightLower != 140 || heightUpper != 190)
        {
            query = query.Where(a => a.Height.CompareTo(heightLowerStr) >= 0 && a.Height.CompareTo(heightUpperStr) <= 0);
        }

        if (age != 50)
        {
            var cutoffDate = DateTime.Now.AddYears(-age).ToString("yyyy-MM-dd");
            query = query.Where(a => a.DateofBirth != string.Empty && a.DateofBirth.CompareTo(cutoffDate) <= 0);
        }

        if (cupLower != "A" || cupUpper != "Z")
        {
            var cupLowerStr = $"{cupLower} Cup";
            var cupUpperStr = $"{cupUpper} Cup";
            query = query.Where(a => a.Cup.CompareTo(cupLowerStr) >= 0 && a.Cup.CompareTo(cupUpperStr) <= 0);
        }

        return await query.OrderBy(a => a.Name).Select(a => a.Name).ToListAsync();
    }

    public async Task<List<string>> GetFavoriteActorNamesAsync()
    {
        return await _context.Actors.Where(a => a.Favorite == 1).Select(a => a.Name).ToListAsync();
    }

    public async Task<List<string>> GetLocalActorsAsync()
    {
        return await _context.MovieActors
            .Select(ma => ma.Actor.Name)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();
    }

    public async Task<bool> ToggleFavoriteAsync(string actorName)
    {
        var actor = await _context.Actors.FirstOrDefaultAsync(a => a.Name == actorName);
        if (actor == null) return false;

        actor.Favorite = actor.Favorite == 1 ? 0 : 1;
        await _context.SaveChangesAsync();
        return actor.Favorite == 1;
    }

    public async Task<ActorViewModel?> GetDetailAsync(string name)
    {
        var actor = await _context.Actors.FirstOrDefaultAsync(a => a.Name == name);
        return actor == null ? null : MapToViewModel(actor);
    }

    private ActorViewModel MapToViewModel(Actor actor)
    {
        return new ActorViewModel
        {
            Name = actor.Name,
            DateofBirth = actor.DateofBirth,
            Height = actor.Height,
            Cup = actor.Cup,
            Bust = actor.Bust,
            Waist = actor.Waist,
            Hips = actor.Hips,
            Looks = actor.Looks,
            Body = actor.Body,
            SexAppeal = actor.SexAppeal,
            Overall = actor.Overall,
            LastUpdated = actor.LastUpdated,
            Favorite = actor.Favorite,
            MovieCount = actor.MovieActors.Count
        };
    }
}
