# 实施方案

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> **本文角色**：记录**代码级详细实施方案**。当 LLM 需要执行具体任务时，阅读此文即可了解每个文件改什么、怎么改。包含完整的代码示例。
>
> 配套文件：
> - 🐛 [issues.md](./issues.md) — 问题清单（当前 Bug、需求定义、安全模型）
> - 📋 [progress.md](./progress.md) — 进度跟踪（任务状态、时间线、文件汇总）

---

## 目录

- [阶段 D：UX 增强](#阶段-dux-增强)
  - [D01 Logo 清除筛选 / D02 筛选激活 tag / D03 6列海报 / D04 fanart / D05 面板右推 / D06 medium-zoom / D07 磁吸双区域](#阶段-dux-增强)
- [阶段 E：修复与增强](#阶段-e修复与增强)
- [阶段 F：回归修复 + 新功能](#阶段-f回归修复--新功能)
- [阶段 G：Remote Access 手机浏览器远程访问](#阶段-gremote-access手机浏览器远程访问)
- [变更记录](#变更记录)

---

## 阶段 D：UX 增强

### D01：Logo 清除筛选回首页

**文件**：`Navbar.tsx`

`<Link to="/">` 添加 onClick 调用 `resetFilters()`：

```tsx
<Link
  to="/"
  className="mr-6 font-bold text-lg"
  onClick={() => useFilterStore.getState().resetFilters()}
>
  JAV Manager
</Link>
```

---

### D02：筛选激活 tag 条

**文件**：新建 `ActiveFiltersBar.tsx`，`AppLayout.tsx` 引入

**显示时机**：筛选面板关闭 + 至少 1 个标签式筛选激活时。

**显示内容**：

| filterStore 字段 | 显示 |
|---|---|
| actors | `{name} ×` |
| genres | `{name} ×` |
| tags | `{name} ×` |
| directors | `{name} ×` |
| studios | `{name} ×` |
| cups | `{cup} Cup ×` |

**不显示**：searchTerm / year 范围 / height 范围 / age 范围 / rating / play 范围 / favoriteOnly / AND / 排序。

点击 `×` 从 filterStore 中移除该项。

---

### D03：一排 6 列海报

**文件**：`MovieGrid.tsx`

**当前**：`≥1536px → 6`，**目标**：`≥1200px → 6`

```
< 500   → 2
< 700   → 3
< 960   → 4
< 1200  → 5
≥ 1200  → 6
```

Loading 骨架屏的 grid 响应式类需同步更新。

---

### D04：详情页主图改为 fanart.jpg

**文件**：`MovieDetail.tsx`

左侧主图从 posterUrl 改为 fanartUrl，容器从 `aspect-[2/3] w-64` 改为 `aspect-video w-full max-w-md`。背景保持 fanart 模糊不变。

---

### D05：筛选面板右侧推入（核心架构改动）

**影响**：`AppLayout.tsx` + `FilterPanel.tsx`

**目标布局**（flex row）：

```
┌── AppLayout (flex row) ────────────────────────┐
│ ┌── flex-1 min-w-0 ──┐ ┌── transition-all ──┐ │
│ │ Navbar              │ │ FilterPanel        │ │
│ │ ActiveFiltersBar    │ │  分组折叠 + Tab    │ │
│ │ <Outlet />          │ │                    │ │
│ └─────────────────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**AppLayout.tsx**：改用 flex row 布局；左侧 `flex-1 min-w-0` 放 Navbar + Outlet；右侧 `transition-all duration-300`：打开 `w-[480px]`，关闭 `w-0 overflow-hidden`；filterOpen 状态提升到 AppLayout。

**FilterPanel.tsx**：移除 `<Drawer>` / `<DrawerContent>` 包裹；改为普通 div，props 改为 `{ onClose: () => void }`；保留内部折叠分组 + Tab 结构。

**关闭动画**：`transition-all duration-300 ease-in-out`

---

### 涉及文件

| 文件 | D01 | D02 | D03 | D04 | D05 |
|---|---|---|---|---|---|
| Navbar.tsx | +2 | | | | |
| ActiveFiltersBar.tsx（新建） | | +50 | | | |
| MovieGrid.tsx | | | ~10 | | ~5 |
| MovieDetail.tsx | | | | ~5 | |
| AppLayout.tsx | | +3 | | | ~30 |
| FilterPanel.tsx | | | | | ~15 |

---

### D06：修复 medium-zoom bug + 布局重构

**文件**：`MovieDetail.tsx`

**Bug 根因**：`BlurhashImage` 的 `zoomable` 启用 `medium-zoom`，组件卸载后原生 DOM overlay 残留。

**修复**：移除 `zoomable` 属性；主图从 fanart 改回 poster（`aspect-[2/3]` + `shadow-[0_10px_30px_rgba(0,0,0,0.5)]`）；信息层级：番号在上（小字淡色）→ 主标题在下（大字粗体）；Play 按钮加宽：`size="lg"` + `min-w-[140px]` + `fill-current`；Tags/Genres 美化：`bg-accent/50` → hover `bg-accent` + `-translate-y-0.5` + `transition-all`。

---

### D07：详情页磁吸双区域（snap-scroll + Fanart + Synopsis）

**文件**：`MovieDetail.tsx`

**目标**：进入详情页仅展示 Hero 区域；下滑时磁吸到第二区域展示大海报和简介。

**技术方案**：外层容器 `overflow-y-scroll snap-y snap-mandatory`；区域一 Hero `<section min-h-screen snap-start>` 模糊背景铺满全屏；区域二 Fanart+Synopsis `<section min-h-screen snap-start>` Fanart `max-w-xl mx-auto` 居中 + Synopsis 下方居中；动画 `whileInView` 淡入 + 上移，`viewport: { once: true }`。

---

## 阶段 E：修复与增强

> 创建日期：2026-05-03

| # | 项目 | 优先级 | 依赖 |
|---|---|---|---|
| E01 | Actor 头像 URL 修复 | P0 | 无 |
| E02 | 随机播放按钮 | P1 | 无 |
| E03 | Heatmap GitHub 风格改版 | P1 | 后端按天聚合 |
| E04 | 过度滚动修复 | P0 | 无 |
| E05 | Actor 点击跳转后回顶部 | P0 | 无 |
| E06 | 主页返回保持滚动位置 | P2 | 无 |

---

### E01：Actor 头像 URL 修复

**文件**：`ActorGrid.tsx`

**Bug**：前端 `API_BASE + /images/actor/` 与后端路由 `/api/image/actor/` 单复数不匹配 → 404。

**修复**：`/images/actor/` → `/image/actor/`（一行改动）。头像文件全部为 `.jpg`。

```tsx
// Before
src={`${API_BASE}/images/actor/${encodeURIComponent(actor.name)}`}

// After
src={`${API_BASE}/image/actor/${encodeURIComponent(actor.name)}`}
```

---

### E02：随机播放按钮

**文件**：`Navbar.tsx` + 新建 `shuffleStore.ts`

**位置**：Navbar 右侧，`SlidersHorizontal` 筛选按钮左侧。

**算法**：Fisher-Yates 洗牌 + 循环迭代

```
1. 首次点击 / 列表耗尽 → GET /api/movies 获取全部影片 ID
2. Fisher-Yates 打乱 → 存入 sessionStorage
3. 每次点击取下一个 ID，navigate(`/movie/${id}`)
4. 遍历完重新洗牌
```

**Zustand shuffleStore**：`ids: string[]` / `index: number` / `loading: boolean` / `init()` / `next()`。全局所有影片，不受筛选影响。sessionStorage 持久化。

---

### E03：Dashboard Heatmap GitHub 风格改版

**文件**：后端 `StatsService.cs` / `StatsResponse.cs`，前端 `Heatmap.tsx` / `Dashboard.tsx`

**后端**：新增 `DailyPlayItem { date, count }` → `StatsResponse` 增加 `dailyPlays` → `StatsService` 新增按天聚合查询（365 天）。

**前端**：`Heatmap.tsx` 完全重写为 7 行 × N 列绿色方格网格；颜色 4 级绿色按 count/max 映射；tooltip 显示日期+次数；移除标题。参考 GitHub contribution graph。

---

### E04：过度滚动修复

**文件**：`index.css` — 一行：`html { overscroll-behavior-y: none; }`

---

### E05：Actor 点击跳转后回到顶部

**文件**：`ActorGrid.tsx` — `handleActorClick` 中 `navigate` 前 `window.scrollTo(0, 0)`。

---

### E06：主页返回保持滚动位置

**文件**：`MovieGrid.tsx`

**方案**：sessionStorage 保存 VirtuosoGrid 滚动位置。`history.action === "POP"` 恢复位置，`"PUSH"` 从顶部开始。使用 `initialTopMostItemIndex` 或 `gridRef.scrollToIndex()`。

---

## 涉及文件汇总（阶段 E）

| 文件 | E01 | E02 | E03 | E04 | E05 | E06 |
|---|---|---|---|---|---|---|
| ActorGrid.tsx | +1 | | | | +2 | |
| Navbar.tsx | | +10 | | | | |
| shuffleStore.ts（新建） | | +40 | | | | |
| StatsService.cs | | | +20 | | | |
| StatsResponse.cs | | | +5 | | | |
| Heatmap.tsx | | | ~80 重写 | | | |
| Dashboard.tsx | | | ~5 | | | |
| index.css | | | | +3 | | |
| MovieGrid.tsx | | | | | | +30 |

---

## 阶段 F：回归修复 + 新功能

> 创建日期：2026-05-03

| # | 项目 | 优先级 | 依赖 |
|---|---|---|---|
| F01 | Settings 保存失败（连锁导致头像 204） | P0 | 无 |
| F02 | 过度滚动强化修复 | P0 | 无 |
| F03 | 浏览器返回位置恢复修复 | P1 | 无 |
| F04 | 播放页同女优推荐 | P1 | 无 |
| F05 | 播放器字幕支持 | P1 | 无 |

---

### F01：Settings 保存失败修复（连锁修复 E01）

**文件**：`SettingsController.cs`

**根因**：`[HttpPut]` 返回 `return Ok()`（空 body），前端 `fetchJson` 强制 `res.json()` → JSON 解析异常。Settings 从未成功写入 → `ActorPhotoDirectory` 为空 → `ImageController.GetActorPhoto` 返回 204 → 头像永不显示。

**修复**：

```csharp
// Before
return Ok();

// After
return Ok(new { success = true });
```

修复后 E01 连锁自动修复。

---

### F02：过度滚动强化修复

**文件**：`index.css`

**根因**：仅给 `html` 加了 `overscroll-behavior-y: none` 不够，需覆盖 `body` 和 `#root`。

**修复**：

```css
html, body, #root {
  overscroll-behavior: none;
}
```

---

### F03：浏览器返回位置恢复修复

**文件**：`MovieGrid.tsx`

**根因**：`VirtuosoGrid` 的 `initialTopMostItemIndex` 在数据异步到达后可能被忽略。

**修复**：改为 `useEffect` + `scrollToIndex()` 主动恢复。

```tsx
useEffect(() => {
  if (navigationType === "POP" && rows.length > 0) {
    const saved = loadScrollPosition()
    if (saved && saved > 0) {
      const timer = setTimeout(() => {
        gridRef.current?.scrollToIndex(saved)
        clearScrollPosition()
      }, 300)
      return () => clearTimeout(timer)
    }
  }
}, [navigationType, rows.length])
```

---

### F04：播放页同女优推荐

**文件**：`VideoPlayer.tsx` + 后端复用 `POST /api/movies/filter`

**逻辑**：获取当前影片第一个女优 → `POST /api/movies/filter` with `actors: [name]` 排除当前 `imdbId` → 播放器底部 Grid 展示 → 无其他影片则不显示。复用 MovieCard 组件，一行 4~6 个。

---

### F05：播放器字幕支持

**文件**：后端 `StreamController.cs` / `StreamService.cs`，前端 `DPlayerWrapper.tsx`

**后端**：`GET /api/stream/{imdbId}/subtitle` → 查找同目录 `.srt`/`.ass`/`.vtt` → `Ude.NetStandard` 自动检测编码 → UTF-8 返回。

**前端**：DPlayer `subtitle: { url: subtitleUrl, type: 'webvtt' }`。

---

## 涉及文件汇总（阶段 F）

| 文件 | F01 | F02 | F03 | F04 | F05 |
|---|---|---|---|---|---|
| SettingsController.cs | +1 | | | | |
| index.css | | +1 | | | |
| MovieGrid.tsx | | | ~20 | | |
| VideoPlayer.tsx | | | | +40 | |
| DPlayerWrapper.tsx | | | | | +5 |
| StreamController.cs | | | | | +20 |
| StreamService.cs | | | | | +30 |
| jav-manager-api.csproj | | | | | +1（Ude.NetStandard）|

---

## 阶段 F 回归修复

> 创建日期：2026-05-03（用户验证后）
>
> F01/F02 已确认修复；F03/F04/F05 回归。

| # | 项目 | 根因 | 修复方案 |
|---|---|---|---|
| F03-R | 返回位置恢复 | `containerWidth=0` 导致第一次 effect 用错误 `itemsPerRow` + `clearScrollPosition()` 太早 | 回退为 `initialTopMostItemIndex` + 不 clear |
| F04-R | 同女优推荐 | 需运行时排查（actor 名匹配 / API 响应 / 布局） | 加调试日志定位断点 |
| F05-R | 字幕支持 | 后端无文件时返回 204 → DPlayer 不渲染按钮 | 后端始终返回有效 VTT（空内容也行） |

---

### F03-R 修正方案（确定）

**文件**：`MovieGrid.tsx`

**修改**：删除 `useEffect` 中的 `scrollToIndex` 逻辑；在 `initialTopMostItemIndex` 的 `useMemo` 中直接计算（POP 时从 sessionStorage 读取 movieIndex ÷ itemsPerRow）；删除 `clearScrollPosition()` 调用。

```tsx
const initialTopMostItemIndex = useMemo(() => {
  if (navigationType === "PUSH") {
    clearScrollPosition()
    return 0
  }
  if (navigationType === "POP" && itemsPerRow > 0) {
    const saved = loadScrollPosition()
    if (saved && saved > 0) {
      return Math.floor(saved / itemsPerRow)
    }
  }
  return 0
}, [navigationType, itemsPerRow])
```

### F04-R 排查方案（需运行时数据）

**文件**：`VideoPlayer.tsx`

**排查步骤**：在 `useQuery.queryFn` 加 console.log 确认 primaryActor、API 响应、sameActorMovies 长度定位断点。

### F05-R 修正方案（确定）

**文件**：`StreamController.cs` + `StreamService.cs`

**修改**：`GetSubtitle` 无文件时返回空 VTT 内容（`WEBVTT\n\n`），状态码 200 而非 204；扩展字幕查找匹配 `{movieFileName}_*` 模式。

```csharp
// Before
if (subtitle == null) return NoContent();

// After
if (subtitle == null)
    return File(Encoding.UTF8.GetBytes("WEBVTT\n\n"), "text/vtt; charset=utf-8");
```

---

## 阶段 G：Remote Access（手机浏览器远程访问）

> 创建日期：2026-05-05
>
> **目标**：在家庭局域网内，通过手机浏览器安全访问项目并播放影片。
>
> **核心理念**：「默认关闭，主动开启，随时可关」— `RemoteAccess.Enabled=false` 时项目行为与现在**完全一致**。
>
> **信任模型**：电脑端（本机IP）= 管理员免认证；手机端 = 受限客户端需密码登录。
>
> **运行模式**：用户使用生产模式（`dotnet run`），后端直接托管前端。手机访问 `https://电脑IP:5000`，不需要 Vite dev server。
>
> **已确认决策**：开启登录失败限制（5次/15分钟/IP）；不强制复杂密码（最小4位，个人程序）；加入端口转发公网暴露检测；使用 HTTPS 自签证书；配置开关默认关闭。
>
> 需求与安全模型见 🐛 [issues.md § 七](./issues.md#七新增功能需求remote-access阶段-g)
>
> 进度跟踪见 📋 [progress.md § 六](./progress.md#六阶段-gremote-access手机浏览器远程访问)

---

### G.1.1：appsettings.json 配置节

**文件**：`jav-manager-api/appsettings.json`

```json
{
  "RemoteAccess": {
    "Enabled": false,
    "BindAddress": "0.0.0.0",
    "Port": 5000,
    "UseHttps": true,
    "CertificatePath": "Certs/cert.pfx",
    "CertificatePassword": ""
  }
}
```

**字段**：`Enabled`（总开关，false=现在行为）、`BindAddress`（监听地址）、`Port`、`UseHttps`（true=自签证书）、`CertificatePath`、`CertificatePassword`。用户只需改 `Enabled: true`，密码通过 UI 设置。

---

### G.1.2：Program.cs 条件绑定逻辑

**文件**：`jav-manager-api/Program.cs`

```csharp
var remoteAccessConfig = builder.Configuration.GetSection("RemoteAccess");
var remoteEnabled = remoteAccessConfig.GetValue<bool>("Enabled");

if (remoteEnabled)
{
    var useHttps = remoteAccessConfig.GetValue<bool>("UseHttps");
    var port = remoteAccessConfig.GetValue<int>("Port");
    var bindAddr = remoteAccessConfig.GetValue<string>("BindAddress") ?? "0.0.0.0";
    var protocol = useHttps ? "https" : "http";
    app.Urls.Add($"{protocol}://{bindAddr}:{port}");

    builder.Services.AddCors(options =>
        options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

    if (useHttps)
    {
        var certPath = remoteAccessConfig.GetValue<string>("CertificatePath") ?? "Certs/cert.pfx";
        var certPassword = remoteAccessConfig.GetValue<string>("CertificatePassword") ?? "";
        EnsureCertificateExists(certPath);
        builder.WebHost.ConfigureKestrel(o =>
            o.Listen(IPAddress.Parse(bindAddr), port, listenOptions =>
                listenOptions.UseHttps(certPath, certPassword)));
    }

    app.UseMiddleware<RateLimitMiddleware>();
    app.UseMiddleware<TokenAuthMiddleware>();

    var localIPs = NetworkHelper.GetLocalIPs();
    foreach (var ip in localIPs)
        Log.Information("Remote access available at: {Protocol}://{IP}:{Port}", protocol, ip, port);

    _ = NetworkHelper.CheckPortForwardingAsync(port).ContinueWith(t =>
    {
        if (t.Result) Log.Warning("WARNING: Port {Port} may be reachable from public internet!", port);
    });
}
else
{
    app.Urls.Add("http://localhost:5000");
}
```

**分支点**：

| 行为 | `Enabled=false` | `Enabled=true` |
|------|----------------|----------------|
| 绑定 | `http://localhost:5000` | `https://0.0.0.0:5000` |
| CORS | 仅 localhost | 全部来源 |
| HTTPS | 无 | 自签证书自动生成 |
| 认证 | 无 | TokenAuth + RateLimit |
| 日志 | 无额外 | 打印所有可用地址 |
| 端口检测 | 无 | 异步检测 |

---

### G.2.1：自签证书自动生成

**文件**：`Program.cs` 内联方法 `EnsureCertificateExists`

```csharp
void EnsureCertificateExists(string path)
{
    if (File.Exists(path)) return;
    var dir = Path.GetDirectoryName(path);
    if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);

    using var rsa = RSA.Create(2048);
    var req = new CertificateRequest("CN=JAV Manager Local", rsa,
        HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    req.CertificateExtensions.Add(new X509BasicConstraintsExtension(false, false, 0, false));
    req.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, false));
    var cert = req.CreateSelfSigned(DateTimeOffset.Now, DateTimeOffset.Now.AddYears(10));
    File.WriteAllBytes(path, cert.Export(X509ContentType.Pfx));
    Log.Information("Self-signed certificate generated at {Path}", path);
}
```

RSA 2048，有效期 10 年，PFX 无密码，仅在文件不存在时生成。

---

### G.3.1：TokenAuthMiddleware.cs

**文件**：新建 `jav-manager-api/Middleware/TokenAuthMiddleware.cs`

**流程**：Enabled=false → 放行 → `/api/auth/login` → 放行 → 非 `/api/*` → 放行 → 本机IP → 放行 → 读 `X-Auth-Token` → SHA256 比对数据库 → 匹配则更新 LastActiveAt + 滑动续期（<7天延长30天）→ 不匹配返回 401。

```csharp
public class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _config;

    public TokenAuthMiddleware(RequestDelegate next, IConfiguration config)
        => (_next, _config) = (next, config);

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_config.GetValue<bool>("RemoteAccess:Enabled")) { await _next(context); return; }
        var path = context.Request.Path.Value?.ToLowerInvariant();
        if (path == "/api/auth/login") { await _next(context); return; }
        if (path == null || !path.StartsWith("/api/")) { await _next(context); return; }

        var remoteIp = context.Connection.RemoteIpAddress;
        if (remoteIp != null && NetworkHelper.IsLocalMachineIP(remoteIp)) { await _next(context); return; }

        var token = context.Request.Headers["X-Auth-Token"].FirstOrDefault();
        if (string.IsNullOrEmpty(token))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "Authentication required" });
            return;
        }

        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var db = context.RequestServices.GetRequiredService<AppDbContext>();
        var record = await db.AccessTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (record == null || record.ExpiresAt < DateTime.UtcNow)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid or expired token" });
            return;
        }

        record.LastActiveAt = DateTime.UtcNow;
        if (record.ExpiresAt - DateTime.UtcNow < TimeSpan.FromDays(7))
            record.ExpiresAt = DateTime.UtcNow.AddDays(30);
        await db.SaveChangesAsync();
        await _next(context);
    }
}
```

---

### G.3.2：RateLimitMiddleware.cs

**文件**：新建 `jav-manager-api/Middleware/RateLimitMiddleware.cs`

**要点**：仅拦截 `POST /api/auth/login`；`ConcurrentDictionary<string, (int, DateTime)>` 按 IP 计数；成功（200）清零；失败 +1，5次锁 15 分钟；每 5 分钟清理过期条目；`Enabled=false` 时不启用。

```csharp
public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _config;
    private static readonly ConcurrentDictionary<string, (int attempts, DateTime lockUntil)> _store = new();
    private static DateTime _lastCleanup = DateTime.UtcNow;
    private const int MaxAttempts = 5;
    private const int LockMinutes = 15;

    public RateLimitMiddleware(RequestDelegate next, IConfiguration config)
        => (_next, _config) = (next, config);

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_config.GetValue<bool>("RemoteAccess:Enabled")
            || context.Request.Path.Value != "/api/auth/login"
            || !HttpMethods.IsPost(context.Request.Method))
        { await _next(context); return; }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        CleanupIfNeeded();
        if (_store.TryGetValue(ip, out var entry) && entry.lockUntil > DateTime.UtcNow)
        {
            var remaining = (int)(entry.lockUntil - DateTime.UtcNow).TotalSeconds;
            context.Response.StatusCode = 429;
            await context.Response.WriteAsJsonAsync(new { error = "Too many attempts", retryAfter = remaining });
            return;
        }

        var originalBody = context.Response.Body;
        using var memStream = new MemoryStream();
        context.Response.Body = memStream;
        await _next(context);
        memStream.Seek(0, SeekOrigin.Begin);
        await memStream.CopyToAsync(originalBody);

        if (context.Response.StatusCode == 200)
            _store.TryRemove(ip, out _);
        else
        {
            var attempts = entry.attempts + 1;
            _store[ip] = attempts >= MaxAttempts
                ? (attempts, DateTime.UtcNow.AddMinutes(LockMinutes))
                : (attempts, DateTime.MinValue);
        }
    }

    private static void CleanupIfNeeded()
    {
        if ((DateTime.UtcNow - _lastCleanup).TotalMinutes < 5) return;
        _lastCleanup = DateTime.UtcNow;
        foreach (var key in _store.Keys.ToList())
            if (_store.TryGetValue(key, out var e) && e.lockUntil < DateTime.UtcNow)
                _store.TryRemove(key, out _);
    }
}
```

---

### G.3.3：AuthController.cs

**文件**：新建 `jav-manager-api/Controllers/AuthController.cs`（`[Route("api/auth")]`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 验证密码，返回 token（30天过期） |
| POST | `/api/auth/change-password` | 修改密码，撤销所有 token |
| GET | `/api/auth/status` | 是否已设密码 + 活跃会话数 |
| POST | `/api/auth/revoke-all` | 撤销所有 token |

**密码存储**：`UserSettings` 表 Key=`AccessPassword`，Value=`{salt16}:{SHA256(password+salt)}`。

**Token 生成**：`Guid.NewGuid().ToString("N")` → SHA256 存库。

```csharp
// 核心 login 逻辑
var storedPassword = await _context.UserSettings.FirstOrDefaultAsync(s => s.Key == "AccessPassword");
if (storedPassword == null) return BadRequest(new { error = "Password not configured" });
var parts = storedPassword.Value.Split(':', 2);
if (HashPassword(request.Password, parts[0]) != parts[1]) return Unauthorized();

var rawToken = Guid.NewGuid().ToString("N");
_context.AccessTokens.Add(new AccessToken {
    TokenHash = HashToken(rawToken),
    CreatedAt = DateTime.UtcNow, ExpiresAt = DateTime.UtcNow.AddDays(30),
    LastActiveAt = DateTime.UtcNow,
    UserAgent = Request.Headers.UserAgent.ToString()
});
await _context.SaveChangesAsync();
return Ok(new { token = rawToken, expiresAt = DateTime.UtcNow.AddDays(30) });
```

---

### G.3.4：NetworkHelper.cs

**文件**：新建 `jav-manager-api/Services/NetworkHelper.cs`

```csharp
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
            .Select(a => a.Address.ToString()).ToList();
    }

    public static bool IsLocalMachineIP(IPAddress? remoteIP)
        => remoteIP != null && (IPAddress.IsLoopback(remoteIP) || GetLocalIPs().Contains(remoteIP.ToString()));

    public static async Task<bool> CheckPortForwardingAsync(int port)
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
            var publicIp = await client.GetStringAsync("https://api.ipify.org");
            await client.GetAsync($"https://{publicIp}:{port}", HttpCompletionOption.ResponseHeadersRead);
            return true;
        }
        catch { return false; }
    }
}
```

---

### G.3.5：SettingsController 新增接口

**文件**：修改 `Controllers/SettingsController.cs`

| 方法 | 路径 | 说明 |
|------|------|------|
| PUT | `/api/settings/password` | 保存密码（min 4 chars），撤销所有 token |
| GET | `/api/settings/remote-access` | 返回配置状态 + localIPs |
| GET | `/api/settings/network-info` | IP 列表 + 公网暴露检测 |
| GET | `/api/settings/sessions` | 活跃会话列表（脱敏：设备类型/时间） |
| DELETE | `/api/settings/sessions/{id}` | 撤销单个会话 |
| DELETE | `/api/settings/sessions` | 撤销所有会话 |

`ParseDeviceType(userAgent)`：含 "iPhone"/"iPad" → "iPhone / iPad"，"Android" → "Android"，其他 → "Desktop"。

---

### G.3.6：AccessToken 数据模型

**修改**：`Data/AppDbContext.cs` 新增 `public DbSet<AccessToken> AccessTokens { get; set; }`

**新建**：`Models/AccessToken.cs`

```csharp
public class AccessToken
{
    public int Id { get; set; }
    public string TokenHash { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public string UserAgent { get; set; } = "";
}
```

---

### G.4.1：api.ts Token 注入 + 401 拦截

**文件**：修改 `jav-manager-web/src/services/api.ts`

`fetchJson` 从 `localStorage` 读取 token 注入 `X-Auth-Token` Header。收到 401 → 清除 token → 触发 `auth:required` 自定义事件 → 前端自动跳转登录页。

---

### G.4.2：authService.ts

**文件**：新建 `jav-manager-web/src/services/authService.ts`

核心函数：`getToken()` / `setToken(token, expiresAt)` / `clearToken()` / `isAuthenticated()` / `login(password)` / `logout()`。Token 存 `localStorage`（`jav-manager-auth-token` / `jav-manager-auth-expires`）。`login()` 处理 429 速率限制错误（解析 `retryAfter` 秒数）。

---

### G.4.3：LoginPage.tsx

**文件**：新建 `jav-manager-web/src/components/auth/LoginPage.tsx`

移动端优先布局：全屏居中登录卡片，标题 "JAV Manager"，密码输入框（自动聚焦 + Enter 提交），登录按钮，错误提示（密码错误 / 锁定倒计时 / 网络错误），底部 "Home network access only"。登录成功 → `navigate("/")`。已认证则自动跳转首页。

---

### G.4.4：App.tsx 路由调整

**文件**：修改 `App.tsx`

新增 `<Route path="/login" element={<LoginPage />} />`（在 AppLayout 外部）。`useEffect` 监听 `auth:required` 事件 → `navigate("/login")`。

---

### G.5.1：SettingsViewer Remote Access 区域

**文件**：修改 `SettingsViewer.tsx`，新增 Remote Access 卡片（在现有 Settings 表单下方）。

**包含功能**：
- 总开关（Enable Remote Access 勾选 → 展开密码/网络区域）
- 密码设置（输入框 + 确认框，最小 4 位）
- 网络信息（本机局域网 IP 列表 + 可复制）
- 二维码（后端生成 PNG，手机扫一扫）
- 防火墙状态检测 + 一键添加规则提示
- 公网暴露检测 → 红色警告（不可关闭）
- 活跃会话列表（设备类型 / 最后活跃 / 撤销 / 撤销全部）
- 静态提示文字（证书警告说明）

**数据 API**：`GET /api/auth/status` / `GET /api/settings/remote-access` / `GET /api/settings/network-info` / `GET /api/settings/sessions` / `PUT /api/settings/password` / `DELETE /api/settings/sessions/{id}`。

---

### G.6：UI 移动端适配（可选后做）

| # | 文件 | 改动 |
|---|------|------|
| G.6.1 | Navbar.tsx | `md:` 断点以下收为汉堡菜单，搜索框缩为图标 |
| G.6.2 | AppLayout.tsx | 筛选面板 `w-[480px]` → 手机 `w-full` |
| G.6.3 | MovieCard.tsx | `@media (hover: hover)` 限定 hover，触屏 Play 按钮始终可见 |

---

## 涉及文件汇总（阶段 G）

| # | 文件 | Phase | 操作 | 预计行数 |
|---|------|-------|------|----------|
| 1 | appsettings.json | 1 | 修改 | +12 |
| 2 | Program.cs | 1+2+3 | 修改 | +80 |
| 3 | Middleware/TokenAuthMiddleware.cs | 3 | **新建** | +70 |
| 4 | Middleware/RateLimitMiddleware.cs | 3 | **新建** | +60 |
| 5 | Controllers/AuthController.cs | 3 | **新建** | +100 |
| 6 | Services/NetworkHelper.cs | 3 | **新建** | +40 |
| 7 | Controllers/SettingsController.cs | 3 | 修改 | +100 |
| 8 | Models/AccessToken.cs | 3 | **新建** | +10 |
| 9 | Data/AppDbContext.cs | 3 | 修改 | +3 |
| 10 | services/api.ts | 4 | 修改 | +15 |
| 11 | services/authService.ts | 4 | **新建** | +50 |
| 12 | components/auth/LoginPage.tsx | 4 | **新建** | +80 |
| 13 | App.tsx | 4 | 修改 | +10 |
| 14 | SettingsViewer.tsx | 5 | 修改 | +150 |
| 15 | Navbar.tsx | 6 | 修改 | +40 |
| 16 | AppLayout.tsx | 6 | 修改 | +1 |
| 17 | MovieCard.tsx | 6 | 修改 | +10 |

**总计**：新建 7 文件，修改 10 文件

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，从 phase-d-roadmap 提取详细方案 |
| 2026-05-03 | D06 修复 + D07 磁吸双区域补充方案 |
| 2026-05-03 | 阶段 E 全部 6 项方案完成 |
| 2026-05-03 | 阶段 E 全部实施完成 ✅ |
| 2026-05-03 | 阶段 F 5 项方案完成 |
| 2026-05-03 | 阶段 F 全部实施完成 ✅ |
| 2026-05-03 | 阶段 F 回归：F03-R/F04-R/F05-R 深度排查 + 修正方案 |
| 2026-05-05 | 阶段 G 完整规划：Remote Access 移动端访问（17文件，6 Phase，含完整代码方案） |
| 2026-05-05 | 重组文档结构：加入目录、明确三文档分工、添加交叉引用、排序 D→E→F→G |
| 2026-05-05 | 阶段 G 全部实施完成 ✅（含后续修复：双端口 HTTP、移动端原生播放器、Android-only HTTP 切换、storage 安全包装等） |
