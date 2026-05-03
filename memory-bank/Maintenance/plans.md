# 实施方案（阶段 D + E + F）

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`

---

## D01：Logo 清除筛选回首页

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

## D02：筛选激活 tag 条

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

## D03：一排 6 列海报

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

## D04：详情页主图改为 fanart.jpg

**文件**：`MovieDetail.tsx`

左侧主图从 posterUrl 改为 fanartUrl，容器从 `aspect-[2/3] w-64` 改为 `aspect-video w-full max-w-md`。背景保持 fanart 模糊不变。

---

## D05：筛选面板右侧推入（核心架构改动）

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

**AppLayout.tsx**：
- 改用 flex row 布局
- 左侧 `flex-1 min-w-0` 放 Navbar + Outlet
- 右侧 `transition-all duration-300`：打开 `w-[480px]`，关闭 `w-0 overflow-hidden`
- filterOpen 状态提升到 AppLayout

**FilterPanel.tsx**：
- 移除 `<Drawer>` / `<DrawerContent>` 包裹
- 改为普通 div，props 改为 `{ onClose: () => void }`
- 保留内部折叠分组 + Tab 结构

**关闭动画**：`transition-all duration-300 ease-in-out`

---

## 涉及文件

| 文件 | D01 | D02 | D03 | D04 | D05 |
|---|---|---|---|---|---|
| Navbar.tsx | +2 | | | | |
| ActiveFiltersBar.tsx（新建） | | +50 | | | |
| MovieGrid.tsx | | | ~10 | | ~5 |
| MovieDetail.tsx | | | | ~5 | |
| AppLayout.tsx | | +3 | | | ~30 |
| FilterPanel.tsx | | | | | ~15 |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，从 phase-d-roadmap 提取详细方案 |
| 2026-05-03 | D06 修复 + D07 磁吸双区域补充方案 |

---

## D06：修复 medium-zoom bug + 布局重构

**文件**：`MovieDetail.tsx`

**Bug 根因**：`BlurhashImage` 的 `zoomable` 启用 `medium-zoom`，组件卸载后原生 DOM overlay 残留。

**修复**：
- 移除 `zoomable` 属性
- 主图从 fanart 改回 poster（`aspect-[2/3]` + `shadow-[0_10px_30px_rgba(0,0,0,0.5)]`）
- 信息层级：番号在上（小字淡色）→ 主标题在下（大字粗体）
- Play 按钮加宽：`size="lg"` + `min-w-[140px]` + `fill-current`
- Tags/Genres 美化：`bg-accent/50` → hover `bg-accent` + `-translate-y-0.5` + `transition-all`

---

## D07：详情页磁吸双区域（snap-scroll + Fanart + Synopsis）

**文件**：`MovieDetail.tsx`

**目标**：进入详情页仅展示 Hero 区域；下滑时磁吸到第二区域展示大海报和简介。

**技术方案**：
- 外层容器：`overflow-y-scroll snap-y snap-mandatory`
- 区域一（Hero）：`<section min-h-screen snap-start>`，模糊背景 `inset-0` 铺满全屏
- 区域二（Fanart+Synopsis）：`<section min-h-screen snap-start>`
  - Fanart：`max-w-xl mx-auto` 居中 + `shadow-[0_10px_30px_rgba(0,0,0,0.5)]`
  - Synopsis：Fanart 下方居中展示
- 动画：`whileInView` 淡入 + 上移，`viewport: { once: true }`

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

**位置**：Navbar 右侧，`SlidersHorizontal` 筛选按钮左侧。🎲 图标。

**算法**：Fisher-Yates 洗牌 + 循环迭代

```
1. 首次点击 / 列表耗尽 → GET /api/movies 获取全部影片 ID
2. Fisher-Yates 打乱 → 存入 sessionStorage
3. 每次点击取下一个 ID，navigate(`/movie/${id}`)
4. 遍历完重新洗牌
```

**Zustand shuffleStore**：

```ts
interface ShuffleStore {
  ids: string[]
  index: number
  loading: boolean
  init: () => Promise<void>
  next: () => string | null
}
```

全局所有影片，不受筛选影响。sessionStorage 持久化。

---

### E03：Dashboard Heatmap GitHub 风格改版

**文件**：后端 `StatsService.cs` / `StatsResponse.cs`，前端 `Heatmap.tsx` / `Dashboard.tsx`

**后端改动**：

- 新增 `DailyPlayItem { date: string, count: number }`
- `StatsResponse` 增加 `dailyPlays: DailyPlayItem[]`
- `StatsService` 新增按天聚合查询（最近 365 天）

**前端改动**：

- `Heatmap.tsx` 完全重写：7 行（周一~周日）× N 列（周数）绿色方格网格
- 颜色深浅：0 → `bg-muted`，根据 count/max 映射到 4 级绿色
- tooltip 显示具体日期 + 播放次数
- 移除 "Monthly Heatmap" 标题（或改为无标题卡片）
- `Dashboard.tsx` 中移除 Heatmap 导入的标题引用

**视觉效果参考**：GitHub 主页 contribution graph

---

### E04：过度滚动修复

**文件**：`index.css`

**修复**：一行 CSS

```css
html {
  overscroll-behavior-y: none;
}
```

阻止 Actor/Dashboard/Settings 页面滚动超过内容底部出现空白。

---

### E05：Actor 点击跳转后回到顶部

**文件**：`ActorGrid.tsx`

**修复**：`handleActorClick` 中 navigate 前重置滚动位置

```tsx
const handleActorClick = (name: string) => {
  useFilterStore.getState().setFilter("actors", [name])
  window.scrollTo(0, 0)
  navigate("/")
}
```

---

### E06：主页返回保持滚动位置

**文件**：`MovieGrid.tsx`

**方案 B**：sessionStorage 保存/恢复 VirtuosoGrid 滚动位置，区分两种导航场景。

**核心逻辑**：

1. 创建 `useScrollRestore` hook
2. MovieGrid 组件挂载时检查 `history.action === "POP"`（浏览器返回）vs `"PUSH"`（点击导航）
3. POP → 从 sessionStorage 读取 scrollTop 恢复到 VirtuosoGrid
4. PUSH（如从 Navbar 点击 Movies）→ 清除 sessionStorage，从顶部开始
5. 组件卸载前（`useEffect` cleanup）将 scrollTop 写入 sessionStorage

**VirtuosoGrid 恢复**：使用 `initialTopMostItemIndex` 或调用 `gridRef.scrollToIndex()`。

**类型声明**：VirtuosoGrid 的 `ref.current` 需要 `scrollToIndex` 方法，需在类型中声明。

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

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，从 phase-d-roadmap 提取详细方案 |
| 2026-05-03 | D06 修复 + D07 磁吸双区域补充方案 |
| 2026-05-03 | 阶段 E 全部 6 项：E01 头像URL / E02 随机播放 / E03 Heatmap改版 / E04 过度滚动 / E05 跳转回顶 / E06 返回位置恢复 |
| 2026-05-03 | 阶段 E 全部实施完成 ✅ |
| 2026-05-03 | 阶段 F 5 项：F01 Settings连锁修复 / F02 过度滚动加固 / F03 返回位置修复 / F04 同女优推荐 / F05 字幕支持 |
| 2026-05-03 | 阶段 F 全部实施完成 ✅ |
| 2026-05-03 | 阶段 F 回归：F03/F04/F05 深度排查 + 修正方案 |

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

**根因**：`[HttpPut]` 返回 `return Ok()`（空 body），前端 `fetchJson` 强制 `res.json()` → JSON 解析异常 → "Failed to save settings"。Settings 从未成功写入 → `ActorPhotoDirectory` 为空 → `ImageController.GetActorPhoto` 返回 204 → 头像永不显示。

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

**修复**：改为 `useEffect` + `scrollToIndex()` 主动恢复。`VirtuosoGridHandle` 暴露了 `scrollToIndex(index: number)`。

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

**逻辑**：
1. 获取当前影片的 `actors`（第一个女优）
2. `POST /api/movies/filter` with `actors: [name]`，排除当前 `imdbId`
3. 在播放器底部信息栏下方 Grid 展示
4. 无其他影片则不显示

**展示方式**：复用 MovieCard 组件，一行 4~6 个横向排列。

---

### F05：播放器字幕支持

**文件**：后端 `StreamController.cs` / `StreamService.cs`，前端 `DPlayerWrapper.tsx`

**后端**：
- `GET /api/stream/{imdbId}/subtitle` → 查找与影片同目录的 `.srt` / `.ass` / `.vtt` 文件
- 使用 `Ude.NetStandard` (CharsetDetector) 自动检测编码
- 统一转为 UTF-8 返回

**前端 DPlayerWrapper**：
```ts
const dp = new DPlayer({
  video: { url: videoUrl, pic: posterUrl },
  subtitle: {
    url: subtitleUrl,
    type: 'webvtt',
  },
})
```

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

**修改**：
1. 删除 `useEffect` 中的 `scrollToIndex` 逻辑
2. 在 `initialTopMostItemIndex` 的 `useMemo` 中直接计算：POP 时从 sessionStorage 读取 movieIndex → 除以 `itemsPerRow` → 传给 VirtuosoGrid
3. 删除 `clearScrollPosition()` 调用 — sessionStorage 自然覆盖

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

**排查步骤**：
1. 在 `useQuery.queryFn` 开头加 `console.log("sameActor query:", primaryActor, imdbId)`
2. 在 API 响应后加 `console.log("sameActor response:", data)`
3. 在渲染条件前加 `console.log("sameActorMovies:", sameActorMovies?.length)`
4. 运行后查看 Console + Network 面板确定断点

### F05-R 修正方案（确定）

**文件**：`StreamController.cs` + `StreamService.cs`

**修改**：
1. `GetSubtitle` 无文件时返回空 VTT 内容（`WEBVTT\n\n`），状态码 200，而非 204
2. 扩展字幕查找：也匹配 `{movieFileName}_*` 模式

```csharp
// Before
if (subtitle == null) return NoContent();

// After
if (subtitle == null)
    return File(Encoding.UTF8.GetBytes("WEBVTT\n\n"), "text/vtt; charset=utf-8");
```
