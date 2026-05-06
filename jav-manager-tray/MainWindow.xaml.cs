using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Windows;
using System.Windows.Forms;

namespace jav_manager_tray;

public partial class MainWindow : Window
{
    private Process? _apiProcess;
    private NotifyIcon? _notifyIcon;
    private HttpClient? _httpClient;
    private string _protocol = "http";
    private int _port = 5000;
    private const int DefaultPort = 5000;
    private const int HealthCheckRetries = 30;
    private const int HealthCheckDelayMs = 1000;
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

        (_protocol, _port) = GetApiConfig(workingDir!);

        _httpClient = _protocol == "https"
            ? new HttpClient(new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (_, _, _, _) => true
            })
            : new HttpClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(3);

        _apiProcess = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = executable,
                Arguments = arguments,
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                CreateNoWindow = true
            },
            EnableRaisingEvents = true
        };

        _apiProcess.StartInfo.EnvironmentVariables["ASPNETCORE_URLS"] = $"{_protocol}://localhost:{_port}";
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
        var healthUrl = $"{_protocol}://localhost:{_port}";
        for (var i = 0; i < HealthCheckRetries; i++)
        {
            if (_isShuttingDown) return;

            try
            {
                var response = await _httpClient!.GetAsync(healthUrl);
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

    private static (string protocol, int port) GetApiConfig(string workingDir)
    {
        try
        {
            var configPath = Path.Combine(workingDir, "appsettings.json");
            if (File.Exists(configPath))
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(configPath));
                var root = doc.RootElement;

                if (root.TryGetProperty("RemoteAccess", out var remote))
                {
                    var enabled = remote.TryGetProperty("Enabled", out var e) && e.GetBoolean();
                    var useHttps = remote.TryGetProperty("UseHttps", out var h) && h.GetBoolean();
                    var port = remote.TryGetProperty("Port", out var p) && p.TryGetInt32(out var v) ? v : DefaultPort;

                    if (enabled && useHttps)
                        return ("https", port);
                }
            }
        }
        catch { }

        return ("http", DefaultPort);
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

    private void OpenBrowser()
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = $"{_protocol}://localhost:{_port}",
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
