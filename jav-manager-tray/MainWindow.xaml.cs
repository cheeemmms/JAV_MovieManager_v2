using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Windows;
using System.Windows.Forms;

namespace jav_manager_tray;

public partial class MainWindow : Window
{
    private Process? _apiProcess;
    private NotifyIcon? _notifyIcon;
    private const int DefaultPort = 5000;
    private static readonly HttpClient _httpClient = new() { Timeout = TimeSpan.FromSeconds(3) };

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        Hide();
        SetupTrayIcon();
        await StartApiAsync();
    }

    private void SetupTrayIcon()
    {
        _notifyIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Visible = true,
            Text = "JAV Movie Manager v2"
        };

        var menu = new ContextMenuStrip();
        menu.Items.Add("Open Web", null, (_, _) => OpenBrowser());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Exit", null, (_, _) => Shutdown());

        _notifyIcon.ContextMenuStrip = menu;
        _notifyIcon.DoubleClick += (_, _) => OpenBrowser();
    }

    private async Task StartApiAsync()
    {
        var apiDir = FindApiDirectory();
        if (apiDir == null)
        {
            return;
        }

        _apiProcess = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "dotnet",
                Arguments = "run --urls http://localhost:5000",
                WorkingDirectory = apiDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            }
        };

        _apiProcess.Start();

        var healthUrl = $"http://localhost:{DefaultPort}";
        for (var i = 0; i < 30; i++)
        {
            try
            {
                var response = await _httpClient.GetAsync(healthUrl);
                if (response.IsSuccessStatusCode || (int)response.StatusCode >= 400)
                {
                    OpenBrowser();
                    return;
                }
            }
            catch { }

            await Task.Delay(1000);
        }

        OpenBrowser();
    }

    private static string? FindApiDirectory()
    {
        var baseDir = AppContext.BaseDirectory;
        var siblings = new[]
        {
            Path.Combine(baseDir, "api"),
            Path.Combine(baseDir, "jav-manager-api"),
            Path.Combine(baseDir, "..", "jav-manager-api"),
            Path.Combine(baseDir, "..", "..", "..", "..", "jav-manager-api"),
        };

        foreach (var path in siblings)
        {
            var full = Path.GetFullPath(path);
            if (Directory.Exists(full))
                return full;
        }

        return null;
    }

    private static void OpenBrowser()
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = $"http://localhost:{DefaultPort}",
            UseShellExecute = true
        });
    }

    private void Shutdown()
    {
        if (_apiProcess is { HasExited: false })
        {
            _apiProcess.Kill(true);
            _apiProcess.Dispose();
        }

        _notifyIcon?.Dispose();
        System.Windows.Application.Current.Shutdown();
    }
}
