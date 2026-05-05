using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace jav_manager_api.Services;

public static class NetworkHelper
{
    public static List<string> GetLocalIPs()
    {
        return NetworkInterface.GetAllNetworkInterfaces()
            .Where(ni => ni.OperationalStatus == OperationalStatus.Up
                && (ni.NetworkInterfaceType == NetworkInterfaceType.Ethernet
                    || ni.NetworkInterfaceType == NetworkInterfaceType.Wireless80211))
            .SelectMany(ni => ni.GetIPProperties().UnicastAddresses)
            .Where(a => a.Address.AddressFamily == AddressFamily.InterNetwork)
            .Select(a => a.Address.ToString())
            .ToList();
    }

    public static bool IsLocalMachineIP(IPAddress? remoteIP)
    {
        if (remoteIP == null) return false;
        if (IPAddress.IsLoopback(remoteIP)) return true;
        var localIPs = GetLocalIPs();
        return localIPs.Contains(remoteIP.ToString());
    }

    public static async Task<bool> CheckPortForwardingAsync(int port)
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
            var publicIp = await client.GetStringAsync("https://api.ipify.org");
            using var checkClient = new HttpClient { Timeout = TimeSpan.FromSeconds(3) };
            var response = await checkClient.GetAsync($"http://{publicIp}:{port}", HttpCompletionOption.ResponseHeadersRead);
            return response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.Unauthorized;
        }
        catch
        {
            return false;
        }
    }
}
