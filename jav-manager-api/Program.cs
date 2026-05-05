using jav_manager_api.Data;
using jav_manager_api.Middleware;
using jav_manager_api.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Net;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

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

var remoteEnabled = builder.Configuration.GetValue<bool>("RemoteAccess:Enabled");

if (remoteEnabled)
{
    builder.Services.AddCors(options =>
        options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
}
else
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins(corsOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod());
    });
}

var remoteAccessConfig = builder.Configuration.GetSection("RemoteAccess");

if (remoteEnabled)
{
    var useHttps = remoteAccessConfig.GetValue<bool>("UseHttps");
    var port = remoteAccessConfig.GetValue<int>("Port");
    var bindAddr = remoteAccessConfig.GetValue<string>("BindAddress") ?? "0.0.0.0";

    if (useHttps)
    {
        var certPath = remoteAccessConfig.GetValue<string>("CertificatePath") ?? "Certs/cert.pfx";
        var certPassword = remoteAccessConfig.GetValue<string>("CertificatePassword") ?? "";
        EnsureCertificateExists(certPath);
        builder.WebHost.ConfigureKestrel(o =>
        {
            o.Listen(IPAddress.Parse(bindAddr), port, listenOptions =>
                listenOptions.UseHttps(certPath, certPassword));
            o.Listen(IPAddress.Parse(bindAddr), port + 1);
        });
    }
}

var app = builder.Build();

if (remoteEnabled)
{
    var useHttps = remoteAccessConfig.GetValue<bool>("UseHttps");
    var port = remoteAccessConfig.GetValue<int>("Port");
    var bindAddr = remoteAccessConfig.GetValue<string>("BindAddress") ?? "0.0.0.0";
    var protocol = useHttps ? "https" : "http";

    if (!useHttps)
    {
        app.Urls.Add($"{protocol}://{bindAddr}:{port}");
    }

    var localIPs = NetworkHelper.GetLocalIPs();
    foreach (var ip in localIPs)
        Log.Information("Remote access available at: {Protocol}://{IP}:{Port}", protocol, ip, port);

    if (useHttps)
    {
        var mediaPort = port + 1;
        foreach (var ip in localIPs)
            Log.Information("Media stream (HTTP): http://{IP}:{Port}", ip, mediaPort);
        _ = NetworkHelper.CheckPortForwardingAsync(mediaPort).ContinueWith(t =>
        {
            if (t.Result)
                Log.Warning("WARNING: Port {Port} may be reachable from public internet!", mediaPort);
        });
    }

    _ = NetworkHelper.CheckPortForwardingAsync(port).ContinueWith(t =>
    {
        if (t.Result)
            Log.Warning("WARNING: Port {Port} may be reachable from public internet!", port);
    });
}
else
{
    var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
        ?? builder.Configuration.GetValue<string>("ApiSettings:Urls")
        ?? "http://localhost:5000";
    app.Urls.Add(urls);
}

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

if (remoteEnabled)
{
    app.UseMiddleware<RateLimitMiddleware>();
    app.UseMiddleware<TokenAuthMiddleware>();
}

app.UseCors();
app.UseSerilogRequestLogging();
app.UseStaticFiles();
app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();

void EnsureCertificateExists(string path)
{
    if (File.Exists(path)) return;

    var dir = Path.GetDirectoryName(path);
    if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        Directory.CreateDirectory(dir);

    using var rsa = RSA.Create(2048);
    var req = new CertificateRequest("CN=JAV Manager Local", rsa,
        HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    req.CertificateExtensions.Add(
        new X509BasicConstraintsExtension(false, false, 0, false));
    req.CertificateExtensions.Add(
        new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, false));

    var cert = req.CreateSelfSigned(DateTimeOffset.Now, DateTimeOffset.Now.AddYears(10));
    File.WriteAllBytes(path, cert.Export(X509ContentType.Pfx));
    Log.Information("Self-signed certificate generated at {Path}", path);
}
