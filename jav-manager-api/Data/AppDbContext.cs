using jav_manager_api.Models;
using Microsoft.EntityFrameworkCore;

namespace jav_manager_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Actor> Actors => Set<Actor>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<MovieActor> MovieActors => Set<MovieActor>();
    public DbSet<MovieGenre> MovieGenres => Set<MovieGenre>();
    public DbSet<MovieTag> MovieTags => Set<MovieTag>();
    public DbSet<PlaybackHistory> PlaybackHistories => Set<PlaybackHistory>();
    public DbSet<PlayList> PlayLists => Set<PlayList>();
    public DbSet<PlayListItem> PlayListItems => Set<PlayListItem>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Actor>(entity =>
        {
            entity.HasIndex(a => a.Name).IsUnique();
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasIndex(g => g.Name).IsUnique();
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasIndex(t => t.Name).IsUnique();
        });

        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.HasIndex(s => s.Key).IsUnique();
        });

        modelBuilder.Entity<MovieActor>(entity =>
        {
            entity.HasOne(ma => ma.Movie)
                  .WithMany(m => m.MovieActors)
                  .HasForeignKey(ma => ma.ImdbId)
                  .HasPrincipalKey(m => m.ImdbId);

            entity.HasOne(ma => ma.Actor)
                  .WithMany(a => a.MovieActors)
                  .HasForeignKey(ma => ma.ActorId);
        });

        modelBuilder.Entity<MovieGenre>(entity =>
        {
            entity.HasOne(mg => mg.Movie)
                  .WithMany(m => m.MovieGenres)
                  .HasForeignKey(mg => mg.ImdbId)
                  .HasPrincipalKey(m => m.ImdbId);

            entity.HasOne(mg => mg.Genre)
                  .WithMany(g => g.MovieGenres)
                  .HasForeignKey(mg => mg.GenreId);
        });

        modelBuilder.Entity<MovieTag>(entity =>
        {
            entity.HasOne(mt => mt.Movie)
                  .WithMany(m => m.MovieTags)
                  .HasForeignKey(mt => mt.ImdbId)
                  .HasPrincipalKey(m => m.ImdbId);

            entity.HasOne(mt => mt.Tag)
                  .WithMany(t => t.MovieTags)
                  .HasForeignKey(mt => mt.TagId);
        });

        modelBuilder.Entity<PlaybackHistory>(entity =>
        {
            entity.HasOne(ph => ph.Movie)
                  .WithMany(m => m.PlaybackHistories)
                  .HasForeignKey(ph => ph.MovieId)
                  .HasPrincipalKey(m => m.ImdbId);

            entity.HasIndex(ph => ph.MovieId);
            entity.HasIndex(ph => ph.StartedAt);
        });

        modelBuilder.Entity<PlayListItem>(entity =>
        {
            entity.HasOne(pli => pli.PlayList)
                  .WithMany(pl => pl.PlayListItems)
                  .HasForeignKey(pli => pli.PlayListId);
        });
    }
}
