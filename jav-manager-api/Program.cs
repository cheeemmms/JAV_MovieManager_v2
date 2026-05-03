using jav_manager_api.Data;
using jav_manager_api.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=Data/jav-manager.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddSingleton<XmlProcessor>();
builder.Services.AddScoped<FileScannerService>();
builder.Services.AddScoped<ActorService>();
builder.Services.AddScoped<MovieService>();
builder.Services.AddScoped<ScrapeService>();
builder.Services.AddScoped<StatsService>();
builder.Services.AddScoped<StreamService>();

var corsOrigins = builder.Configuration.GetSection("ApiSettings:CorsOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5000" };
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
    ?? builder.Configuration.GetValue<string>("ApiSettings:Urls")
    ?? "http://localhost:5000";
app.Urls.Add(urls);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var cs = db.Database.GetConnectionString() ?? "";
    var dataSource = cs.Split(';').Select(s => s.Trim())
        .FirstOrDefault(s => s.StartsWith("Data Source", StringComparison.OrdinalIgnoreCase));
    if (dataSource is not null)
    {
        var dbFile = dataSource.Split('=', 2)[1].Trim();
        var dir = Path.GetDirectoryName(dbFile);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
    }
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseSerilogRequestLogging();
app.UseStaticFiles();
app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
