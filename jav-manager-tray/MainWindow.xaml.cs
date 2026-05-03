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
    private const int HealthCheckRetries = 30;
    private const int HealthCheckDelayMs = 1000;
    private static readonly HttpClient _httpClient = new() { Timeout = TimeSpan.FromSeconds(3) };
    private bool _isShuttingDown;

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
        Closing += OnClosing;
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
        var (executable, workingDir, arguments) = FindApiExecutable();
        if (executable == null)
        {
            ShowError("Cannot find API project. Please ensure jav-manager-api is built.");
            return;
        }

        _apiProcess = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = executable,
                Arguments = arguments,
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            },
            EnableRaisingEvents = true
        };

        _apiProcess.StartInfo.EnvironmentVariables["ASPNETCORE_URLS"] = $"http://localhost:{DefaultPort}";
        _apiProcess.StartInfo.EnvironmentVariables["ASPNETCORE_ENVIRONMENT"] = "Production";

        _apiProcess.Exited += OnApiProcessExited;

        try
        {
            _apiProcess.Start();
            await WaitForApiReady();
            OpenBrowser();
        }
        catch (Exception ex)
        {
            ShowError($"Failed to start API: {ex.Message}");
        }
    }

    private async Task WaitForApiReady()
    {
        var healthUrl = $"http://localhost:{DefaultPort}";
        for (var i = 0; i < HealthCheckRetries; i++)
        {
            if (_isShuttingDown) return;

            try
            {
                var response = await _httpClient.GetAsync(healthUrl);
                if (response.IsSuccessStatusCode || (int)response.StatusCode >= 400)
                    return;
            }
            catch { }

            await Task.Delay(HealthCheckDelayMs);
        }
    }

    private void OnApiProcessExited(object? sender, EventArgs e)
    {
        if (_isShuttingDown) return;

        Dispatcher.Invoke(() =>
        {
            ShowError("API process stopped unexpectedly. The application will exit.");
            Shutdown();
        });
    }

    private void OnClosing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        if (!_isShuttingDown)
        {
            e.Cancel = true;
            Shutdown();
        }
    }

    private static (string? executable, string? workingDir, string? arguments) FindApiExecutable()
    {
        var baseDir = AppContext.BaseDirectory;

        var publishedExe = Path.Combine(baseDir, "api", "jav-manager-api.exe");
        if (File.Exists(publishedExe))
            return (publishedExe, Path.Combine(baseDir, "api"), "");

        publishedExe = Path.Combine(baseDir, "jav-manager-api.exe");
        if (File.Exists(publishedExe))
            return (publishedExe, baseDir, "");

        var apiDirs = new[]
        {
            Path.Combine(baseDir, "api"),
            Path.Combine(baseDir, "jav-manager-api"),
            Path.Combine(baseDir, "..", "jav-manager-api"),
            Path.Combine(baseDir, "..", "..", "..", "..", "jav-manager-api"),
        };

        foreach (var dir in apiDirs)
        {
            var full = Path.GetFullPath(dir);
            if (Directory.Exists(full))
                return ("dotnet", full, $"run --no-launch-profile");
        }

        return (null, null, null);
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
        _isShuttingDown = true;

        if (_apiProcess is { HasExited: false })
        {
            try
            {
                if (!_apiProcess.CloseMainWindow())
                {
                    _apiProcess.Kill(true);
                }
                _apiProcess.WaitForExit(5000);
            }
            catch { }
            _apiProcess.Dispose();
        }

        _notifyIcon?.Dispose();
        System.Windows.Application.Current.Shutdown();
    }

    private static void ShowError(string message)
    {
        System.Windows.MessageBox.Show(message, "JAV Movie Manager v2", MessageBoxButton.OK, MessageBoxImage.Error);
    }
}
