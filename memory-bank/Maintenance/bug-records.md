# BUG 记录

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 本文档记录用户反馈的 BUG，每个 BUG 包含现象、根因、影响范围、严重度评估。

---

## BUG 总览

| # | BUG | 模块 | 严重度 | 难度 | 状态 |
|---|---|---|---|---|---|
| B01 | 播放页返回 MovieDetail 白屏 | 前端路由 | 🟠 严重 | ⭐⭐⭐ 中 | ✅ 已修复 |
| B02 | 播放器尺寸不符屏幕 | 前端播放器 | 🔴 阻塞 | ⭐ 低 | ✅ 已修复 |
| B03 | Actors 页面无内容 | 前端演员 | 🟡 一般 | ⭐⭐⭐ 中 | ✅ 已修复 |
| B04 | Dashboard 加载失败 | 后端统计 | 🔴 阻塞 | ⭐ 低 | ✅ 已修复 |
| B05 | 设置页面无法保存 | 前端设置 | 🟠 严重 | ⭐⭐ 低 | ✅ 已修复 |
| B06 | 首页卡片右侧不贴边 | 前端布局 | 🟢 轻微 | ⭐ 低 | ✅ 已修复 |
| B07 | Filters 筛选功能失效 | 前端筛选 | 🔴 阻塞 | ⭐⭐⭐ 中 | ✅ 已修复 |

---

## B01：播放页返回 MovieDetail 白屏

### 现象

从 `/play/{imdbId}` 点击返回按钮 → 跳转到 `/movie/{imdbId}`，页面白屏。
刷新页面（F5）后恢复正常。

### 复现步骤

1. 在首页点击某影片卡片 → 进入 MovieDetail 页面
2. 在 MovieDetail 点击 Play → 进入 VideoPlayer 播放页
3. 视频播放一段后，点击左上角返回箭头
4. 页面显示白屏

### 根因分析

VideoPlayer 的 `handleBack` 在 `navigate(-1)` 前先执行异步 `endRecording()`（PATCH /api/history/{id}），存在竞态条件：

- `endRecording()` 是异步 HTTP 请求，`navigate(-1)` 不等待其完成
- MovieDetail 重新挂载时，TanStack Query 的 `useMovie(imdbId)` 可能因缓存状态不一致返回无效数据
- `usePlaybackRecording` hook 的 cleanup 可能在页面切换时干扰状态

MovieDetail 也不在 `<AnimatePresence>` 包裹中，framer-motion 的 `exit` 动画无效。

### 相关文件

- [VideoPlayer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/VideoPlayer.tsx#L88-L91) — handleBack
- [MovieDetail.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieDetail.tsx#L14) — useMovie hook
- [App.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/App.tsx#L44-L46) — 路由结构（MovieDetail 不在 AppLayout 中）

---

## B02：播放器尺寸不符屏幕

### 现象

播放器页面无法完整显示，底部的标题、进度条等信息栏被挤出可视区域，用户看不到这些元素。

### 复现步骤

1. 进入任意影片播放页 `/play/{imdbId}`
2. 观察播放器底部信息栏是否可见

### 根因分析

VideoPlayer 使用 `flex flex-col` 布局（fixed inset-0），DPlayer 容器使用 `flex-1`。

CSS Flexbox 中 flex 子元素的默认 `min-height: auto`，DPlayer 内部的 `<video>` 元素以其固有宽高比撑大容器，突破 `flex-1` 的限制，把底部 `shrink-0` 信息栏推出视口。

### 相关文件

- [VideoPlayer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/VideoPlayer.tsx#L161-L183) — 布局结构
- [DPlayerWrapper.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/DPlayerWrapper.tsx#L75-L78) — DPlayer 容器

---

## B03：Actors 页面无内容

### 现象

导航到 `/actors` 页面，只显示 "Actors" 标题，没有任何演员列表数据。

### 复现步骤

1. 点击导航栏的 "Actors" 链接
2. 页面只显示标题，无任何内容

### 根因分析

ActorGrid 组件的实现是空占位桩代码，没有任何 API 调用、数据加载或列表渲染逻辑。

后端 ActorsController 已提供完整 API（`GET /api/actors`、`GET /api/actors/{name}`、收藏等），前端从未对接。

### 相关文件

- [App.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/App.tsx#L23-L28) — ActorGrid 占位代码
- [ActorsController.cs](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-api/Controllers/ActorsController.cs) — 后端 API（已有）

---

## B04：Dashboard 加载失败

### 现象

Dashboard 页面显示 "Failed to load statistics. Make sure the API server is running" 错误。

### 复现步骤

1. 导航到 `/dashboard` 页面
2. 页面显示错误信息

### 根因分析

后端 StatsService 的 `GetDashboardStatsAsync()` 中：

```csharp
var averageRating = totalMovies > 0
    ? await _context.Movies.Where(m => m.Rating > 0).AverageAsync(m => m.Rating)
    : 0;
```

当 `totalMovies > 0` 但**所有影片 Rating 都为 0**（刚入库未爬取评分），`Where(m => m.Rating > 0)` 返回空序列，EF Core 的 `AverageAsync()` 对空序列抛出 `InvalidOperationException`，导致 HTTP 500，前端显示错误。

### 相关文件

- [StatsService.cs](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-api/Services/StatsService.cs#L24-L26) — AverageAsync 调用
- [Dashboard.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/dashboard/Dashboard.tsx#L25-L32) — 前端错误展示

---

## B05：设置页面无法保存设置

### 现象

进入 Settings 页面后，点击 "Save Settings" 按钮始终灰色（disabled），无法保存设置。

### 复现步骤

1. 导航到 `/settings` 页面
2. 修改任意表单项（如 Movie Directory）
3. "Save Settings" 按钮仍为灰色不可点击

### 根因分析

SettingsViewer 中的 `reset()` 在 `useEffect` 中依赖 `settings` 对象。TanStack Query 每次渲染可能返回新的 `settings` 对象引用，导致 `useEffect` 重复执行 `reset()`，**`isDirty` 永远为 `false`**，保存按钮一直被禁用。

### 相关文件

- [SettingsViewer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/settings/SettingsViewer.tsx#L60-L68) — reset 调用
- [SettingsViewer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/settings/SettingsViewer.tsx#L248) — 按钮 disabled 逻辑

---

## B06：首页卡片右侧不贴边

### 现象

首页影片网格右侧有明显的空白间隙，卡片没有紧贴容器右边缘。

### 复现步骤

1. 打开首页 `http://localhost:5000/`
2. 观察最右侧卡片与页面右边缘之间有空隙

### 根因分析

MovieGrid 外层使用 Tailwind 的 `container` 类，自带 `px-4` 左右内边距。内部每行使用 CSS Grid + `gap-4`：

- 容器右边缘到最后一列：`container` 的 `px-4`（1rem padding）
- 列与列之间：`gap-4`（1rem gap）

视觉上右侧空隙是 container 的内边距，而非列间距的一半，产生不对称感。VirtuosoGrid 内部的包装 div 可能进一步影响宽度计算。

### 相关文件

- [MovieGrid.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieGrid.tsx#L117-L118) — container 类
- [MovieGrid.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieGrid.tsx#L127-L140) — 行内 grid 布局

---

## B07：Filters 筛选功能失效

### 现象

在 FilterPanel 中修改任意筛选条件（演员、类型、年份等），关闭面板后 MovieGrid 仍显示相同数据，筛选未生效。

### 复现步骤

1. 点击首页筛选按钮，打开 FilterPanel
2. 选择一个 Genre（如 "HD"）
3. 关闭 FilterPanel
4. MovieGrid 显示的影片与筛选前完全相同

### 根因分析

MovieGrid 的 TanStack Query `useInfiniteQuery` 的 queryKey 为固定值 `["movies", "grid"]`：

```tsx
const { data, ... } = useInfiniteQuery({
    queryKey: ["movies", "grid"],   // 永不变
    queryFn: ({ pageParam }) => fetchMovies(pageParam, PAGE_SIZE),
    ...
})
```

虽然 `fetchMovies` 内部通过 `useFilterStore.getState()` 读取最新筛选条件，但 **TanStack Query 不会因为 filterStore 变化而自动重新执行 queryFn**。只有当以下情况才重新请求：
- queryKey 变化
- staleTime 过期（30秒）+ 组件重新挂载
- 手动调用 `refetch()`

FilterPanel 修改筛选条件后关闭 Drawer，**没有任何机制触发 MovieGrid 数据刷新**，数据流完全断裂。

### 相关文件

- [MovieGrid.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieGrid.tsx#L46-L54) — queryKey 固定
- [FilterPanel.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/filter/FilterPanel.tsx) — 缺少 onClose 回调触发刷新
- [AppLayout.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/layout/AppLayout.tsx) — FilterPanel 与 MovieGrid 无联动

---

## 状态图例

| 符号 | 含义 |
|---|---|
| 🔲 | 待修复 |
| 🔄 | 修复中 |
| ✅ | 已修复 |
| ❌ | 无法修复/不予修复 |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，记录 7 个用户反馈 BUG |
