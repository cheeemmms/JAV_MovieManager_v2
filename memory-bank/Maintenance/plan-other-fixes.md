# 其他修复项方案汇总

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 汇总 B01 / Dashboard Top Movies / Tags 可点击 / 页面居中 / 汉化 的修复方案。

---

## 一、B01：播放页返回白屏

**详见**：[analysis-b01-whitescreen.md](analysis-b01-whitescreen.md)

**根因**：DPlayerWrapper 清理函数中 `dp.off` 在 `dp.destroy` 前后调用，DPlayer 内部状态使 `off` 不再是函数。

**修复**：移除手动 `dp.off` 调用，仅保留 `try { dp.destroy() } catch {}`。

**文件**：`DPlayerWrapper.tsx`，~6 行改动。

---

## 二、Dashboard 显示最常观看的电影

### 2.1 后端

**StatsService.cs** 新增查询：

```csharp
var topMovies = await _context.Movies
    .Where(m => m.PlayedCount > 0)
    .OrderByDescending(m => m.PlayedCount)
    .Take(10)
    .Select(m => new TopItem { Name = m.Title, Count = m.PlayedCount })
    .ToListAsync();
```

**StatsResponse.cs** 新增字段：
```csharp
public List<TopItem> TopMovies { get; set; } = new();
```

**StatsController.cs**：无需修改（`GetDashboard()` 自动序列化新字段）。

### 2.2 前端

**stats.ts** 类型定义新增：
```ts
export interface StatsResponse {
  ...
  topMovies: TopItem[]
}
```

**TopChart.tsx** Tab 新增 "Movies"：
```tsx
type Tab = "movies" | "actors" | "genres" | "studios"
const dataMap: Record<Tab, ...> = {
  movies: stats.topMovies,
  ...
}
```

### 变动量

| 层 | 文件 | 改动 |
|---|---|---|
| 后端 | `StatsService.cs` | +7 行 |
| 后端 | `StatsResponse.cs` | +1 行 |
| 前端 | `stats.ts` | +1 行 |
| 前端 | `TopChart.tsx` | +5 行 |
| **合计** | 4 文件 | ~14 行 |

---

## 三、MovieDetail 页 Tags/Genres/Actors 可点击跳转

### 3.1 需求

在影片详情页（如 `/movie/FTHTD-214`），点击 Tags、Genres、Actors、Director、Studio 中的任意项，跳转到首页并应用对应筛选。

### 3.2 实现

在每个可点击的元素上添加 onClick：

```tsx
// Tags — 当前是 <span>
<span onClick={() => {
  useFilterStore.getState().setFilter("tags", [tag])
  navigate("/")
}} className="cursor-pointer hover:ring-2 hover:ring-primary ...">
  {tag}
</span>

// Genres 同理 → setFilter("genres", [genre])
// Actors 同理 → setFilter("actors", [actor])
// Director → setFilter("directors", [director])
// Studio → setFilter("studios", [studio])
```

为防止与 medium-zoom 海报放大冲突，Tag/Genre/Actor 区域不阻止事件传播。

### 3.3 变动量

**文件**：`MovieDetail.tsx`，~30 行改动（5 个区域的 span → button 替换）。

---

## 四、页面居中/对齐问题

### 4.1 问题

MovieDetail / Actors / Dashboard / Settings 使用 `container` 类（`mx-auto` + `px-4`），内容被限制在默认宽度（max-w 根据断点适配），在大屏幕上内容偏窄且偏左（`px-4` 被 container 吸收，视觉上左侧留白小于右侧）。

### 4.2 统一修复

将所有使用 `container` 的页面改为统一宽度：

```
container py-8
→ max-w-[1400px] mx-auto px-6 py-8
```

类比 B06 中对 MovieGrid 的修复。

### 4.3 涉及文件

| 文件 | 位置 | 改动 |
|---|---|---|
| `MovieDetail.tsx` | L88 `<div className="container py-6">` | 1 行 |
| `ActorGrid.tsx` | L10 `<div className="container py-8">` | 1 行 |
| `Dashboard.tsx` | 多处 `<div className="container py-8">` | 3 行 |
| `SettingsViewer.tsx` | L135 `<div className="container py-8 max-w-2xl">` | 1 行 |
| **合计** | 4 文件 | ~6 行 |

---

## 五、汉化

### 5.1 范围

网页全部 UI 文本中文化：导航标签、筛选面板标签、Dashboard 图表标题、影片详情字段名、设置页面标签、Toast 通知、播放器提示等。

### 5.2 实现方式

**方案**：集中翻译对象（轻量方案），不用 i18next 框架。

```ts
// lib/translations.ts
export const zh = {
  nav: { home: "首页", actors: "女优", dashboard: "统计", settings: "设置" },
  filter: { title: "筛选", genres: "类型", tags: "标签", ... },
  dashboard: { title: "数据统计", totalMovies: "影片总数", ... },
  movie: { director: "导演", studio: "片商", actors: "演员", ... },
  settings: { title: "设置", movieDirectory: "影片目录", ... },
  player: { resumePrompt: "是否从上次位置继续？", ... },
  common: { save: "保存", reset: "重置", apply: "应用", ... },
}
```

每个文件导入翻译对象，替换硬编码字符串。

### 5.3 变动量

涉及绝大多数前端文件和组件，约 **15 个文件，~150 处文本替换**。

### 5.4 按用户指示

汉化**暂时搁置**，后续阶段再处理。

---

## 六、各修复项优先级汇总

| 优先级 | 项目 | 难度 | 文件数 | 预估改动 |
|---|---|---|---|---|
| 🔴 P0 | B01 白屏 | ⭐ 低 | 1 | 6 行 |
| 🔴 P0 | 页面居中 | ⭐ 低 | 4 | 6 行 |
| 🟠 P1 | Tags 可点击 | ⭐ 低 | 1 | 30 行 |
| 🟠 P1 | Dashboard Top Movies | ⭐⭐ 中 | 4 | 14 行 |
| 🟡 P2 | 筛选面板改进 | ⭐⭐⭐ 高 | 3+1 | 275 行 |
| 🟡 P2 | 演员头像 | ⭐⭐ 中 | 3 | 35 行 |
| 🟢 P3 | 汉化 | ⭐ 高(量大) | 15+ | 150 处 |
| 🟢 P3 | 播放器缩略图 | ⭐⭐⭐ 高 | 待定 | 待定 |
