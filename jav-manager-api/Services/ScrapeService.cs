using jav_manager_api.Data;
using jav_manager_api.Models;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Globalization;
using System.Net.Http;
using HtmlAgilityPack;

namespace jav_manager_api.Services;

public class ScrapeService
{
    private readonly AppDbContext _context;

    public ScrapeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task ScrapeActorInfoAsync()
    {
        try
        {
            var actors = await _context.Actors
                .Where(a => a.LastUpdated == string.Empty || a.LastUpdated == null)
                .ToListAsync();

            var index = 0;
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            foreach (var actor in actors)
            {
                try
                {
                    Log.Debug($"Start to process {index} : {actor.Name}");
                    var cleanActorName = actor.Name.Contains('（')
                        ? actor.Name[..actor.Name.IndexOf('（')]
                        : actor.Name;

                    var queryPage = $"https://www.minnano-av.com/search_result.php?search_scope=actress&search_word={cleanActorName}&search=+Go+";
                    var htmlContent = await httpClient.GetStringAsync(queryPage);

                    var htmlDoc = new HtmlDocument();
                    htmlDoc.LoadHtml(htmlContent);

                    var actorScorePage = htmlDoc.DocumentNode.SelectSingleNode("//div[@class='act-area']");
                    var actorInfoPage = htmlDoc.DocumentNode.SelectSingleNode("//div[@class='act-profile']");

                    if (actorInfoPage != null && !string.IsNullOrEmpty(actorInfoPage.InnerText))
                    {
                        var dobInfo = actorInfoPage.SelectSingleNode(".//span[text()='生年月日']/following-sibling::p");
                        var bodyInfo = actorInfoPage.SelectSingleNode(".//span[text()='サイズ']/following-sibling::p");

                        if (dobInfo != null && DateTime.TryParse(dobInfo.InnerText.Trim()[..11], out var dob))
                        {
                            actor.DateofBirth = dob.ToString("yyyy-MM-dd");
                        }

                        if (bodyInfo != null)
                        {
                            var bodyInfoList = bodyInfo.InnerText.Trim().Split('/');
                            if (bodyInfoList.Length >= 4)
                            {
                                actor.Height = string.IsNullOrEmpty(bodyInfoList[0].Replace("T", "").Trim())
                                    ? string.Empty : $"{bodyInfoList[0].Replace("T", "").Trim()}cm";
                                actor.Cup = bodyInfoList[1].Trim().IndexOf('(') == -1
                                    ? string.Empty : $"{bodyInfoList[1].Trim()[..(bodyInfoList[1].Trim().IndexOf('(') + 1)]} Cup";
                                actor.Bust = bodyInfoList[1].Trim().IndexOf('(') == -1
                                    ? string.Empty : bodyInfoList[1].Replace("B", "").Trim()[..(bodyInfoList[1].Trim().IndexOf('(') - 1)];
                                actor.Waist = bodyInfoList[2].Replace("W", "").Trim();
                                actor.Hips = bodyInfoList[3].Replace("H", "").Trim();
                            }
                        }
                    }

                    if (actorScorePage != null)
                    {
                        var scoreNodes = actorScorePage.SelectNodes(".//td[@class='t9']");
                        if (scoreNodes != null && scoreNodes.Count >= 10)
                        {
                            actor.Looks = scoreNodes[1]?.InnerText?.Trim() ?? string.Empty;
                            actor.Body = scoreNodes[3]?.InnerText?.Trim() ?? string.Empty;
                            actor.SexAppeal = scoreNodes[7]?.InnerText?.Trim() ?? string.Empty;
                            actor.Overall = scoreNodes[9]?.InnerText?.Trim() ?? string.Empty;
                        }
                    }

                    actor.LastUpdated = DateTime.Now.ToString("yyyy-MM-dd");
                    await _context.SaveChangesAsync();
                    await Task.Delay(1000);
                    index++;
                    Log.Debug($"Complete to process {index} : {actor.Name}");
                }
                catch (Exception ex)
                {
                    Log.Error($"An error occurs when processing actor {actor.Name} information! \n\r");
                    Log.Error(ex.ToString());
                }
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex.ToString());
        }
    }
}
