# BUG 修复计划

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 本文档为每个 BUG 提供详细的修复路线图，包含修改文件、代码变更方案、验证步骤。

---

## B02：播放器尺寸不符屏幕

**严重度**：🔴 阻塞 | **难度**：⭐ 低 | **预计文件数**：1

### 修复目标

确保 DPlayer 容器不会超出视口，底部信息栏始终可见。

### 修复步骤

#### 步骤 1：给 DPlayer 容器添加 `min-h-0`

**文件**：[VideoPlayer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/VideoPlayer.tsx)

**位置**：`<div className="flex-1">`（约第 174 行）

**修改**：

```tsx
// Before
<div className="flex-1">

// After
<div className="flex-1 min-h-0 overflow-hidden">
```

**原理**：CSS Flexbox 中，flex 子元素默认 `min-height: auto`，导致内容可以撑破容器。设置 `min-h-0` 强制容器不能低于 0 高度，`overflow-hidden` 裁剪溢出内容。

### 验证步骤

1. `npm run dev` 启动前端
2. 打开 `/play/{imdbId}` 任意影片
3. 确认底部标题、进度条、演员信息完整可见
4. 在不同窗口尺寸下测试（全屏、半屏、小窗）
5. 确认 DPlayer 原生控制条和自定义信息栏不重叠

---

## B04：Dashboard 加载失败

**严重度**：🔴 阻塞 | **难度**：⭐ 低 | **预计文件数**：1

### 修复目标

当没有任何影片有评分时，Dashboard API 不做空序列聚合。

### 修复步骤

#### 步骤 1：添加 Any() 安全检查

**文件**：[StatsService.cs](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-api/Services/StatsService.cs)

**位置**：`GetDashboardStatsAsync()` 方法中的 averageRating 计算（约第 24-26 行）

**修改**：

```csharp
// Before
var averageRating = totalMovies > 0
    ? await _context.Movies.Where(m => m.Rating > 0).AverageAsync(m => m.Rating)
    : 0;

// After
double averageRating = 0;
if (totalMovies > 0)
{
    var ratedMovies = _context.Movies.Where(m => m.Rating > 0);
    if (await ratedMovies.AnyAsync())
        averageRating = await ratedMovies.AverageAsync(m => m.Rating);
}
```

**原理**：EF Core 的 `AverageAsync()` 对空集合抛 `InvalidOperationException`。先用 `AnyAsync()` 判空，空集合时保持 `averageRating = 0`。

### 验证步骤

1. `dotnet run` 启动 API
2. `curl http://localhost:5000/api/stats/dashboard`
3. 确认返回 HTTP 200 + 正常 JSON（即使数据库无影片或有影片无评分）
4. 打开 Dashboard 页面确认卡片/图表正常显示

---

## B07：Filters 筛选功能失效

**严重度**：🔴 阻塞 | **难度**：⭐⭐⭐ 中 | **预计文件数**：3

### 修复目标

用户修改筛选条件后，MovieGrid 自动刷新数据，筛选条件真正生效。

### 修复步骤

#### 步骤 1：将筛选参数加入 queryKey

**文件**：[MovieGrid.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieGrid.tsx)

**修改**：

```tsx
// 新增: 从 filterStore 读取关键筛选字段
const filters = useFilterStore((s) => ({
  searchTerm: s.searchTerm,
  actors: s.actors,
  genres: s.genres,
  tags: s.tags,
  directors: s.directors,
  studios: s.studios,
  yearFrom: s.yearFrom,
  yearTo: s.yearTo,
  heightFrom: s.heightFrom,
  heightTo: s.heightTo,
  cups: s.cups,
  ageFrom: s.ageFrom,
  ageTo: s.ageTo,
  ratingFrom: s.ratingFrom,
  playedMin: s.playedMin,
  playedMax: s.playedMax,
  favoriteOnly: s.favoriteOnly,
  isAndOperator: s.isAndOperator,
  sortBy: s.sortBy,
  sortOrder: s.sortOrder,
}))

// Before
queryKey: ["movies", "grid"],

// After
queryKey: ["movies", "grid", filters],
```

**原理**：TanStack Query 通过 `queryKey` 的引用变化判断数据是否过期。将 `filters` 对象放入 queryKey 后，任何筛选条件变化都会导致 queryKey 变化，自动触发数据刷新。

#### 步骤 2（可选增强）：FilterPanel 关闭时立即刷新

**文件**：[AppLayout.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/layout/AppLayout.tsx)

**修改**：

```tsx
import { useQueryClient } from "@tanstack/react-query"

// 在 AppLayout 组件内
const queryClient = useQueryClient()

const handleFilterClose = (open: boolean) => {
  setFilterOpen(open)
  if (!open) {
    queryClient.invalidateQueries({ queryKey: ["movies", "grid"] })
  }
}

// FilterPanel 的 onOpenChange 改为 handleFilterClose
```

**原理**：步骤 1 已能保证筛选生效（queryKey 变化自动请求），此步骤为可选增强——在关闭 Drawer 瞬间强制刷新，消除 React 重渲染的微小延迟。

#### 步骤 3：修复 Drawer 方向属性

**文件**：[FilterPanel.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/filter/FilterPanel.tsx)

**位置**：`<Drawer>` 标签（约第 62 行）

**检查**：确认 `direction="right"` 是否与 shadcn/ui Drawer 兼容，如不兼容使用标准的 Drawer（默认从底部弹出）或改为 Sheet 组件。

### 验证步骤

1. 打开首页，记录显示的影片
2. 打开 FilterPanel，选择一个 Genre（如 "HD"）
3. 关闭 FilterPanel
4. 确认 MovieGrid 显示的影片发生了变化（只显示该类型的影片）
5. 打开 FilterPanel，添加多个筛选条件（Actor + YearRange）
6. 确认多条件组合筛选生效
7. 切换排序方式（Title / Rating），确认排序变化
8. 点击 "Reset All Filters"，确认恢复到默认展示

---

## B01：播放页返回 MovieDetail 白屏

**严重度**：🟠 严重 | **难度**：⭐⭐⭐ 中 | **预计文件数**：2

### 修复目标

从播放器页返回 MovieDetail 时无白屏，页面正常显示影片详情。

### 修复方案 A（推荐）：直接用绝对路径导航

#### 步骤 1：改用 `navigate(/movie/${imdbId})` 替代 `navigate(-1)`

**文件**：[VideoPlayer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/VideoPlayer.tsx)

**修改**：

```tsx
// Before
const handleBack = useCallback(() => {
    endRecording(progressRef.current)
    navigate(-1)
}, [navigate, endRecording])

// After
const handleBack = useCallback(() => {
    endRecording(progressRef.current)
    navigate(`/movie/${imdbId}`)
}, [navigate, endRecording, imdbId])
```

**原理**：`navigate(-1)` 依赖浏览器历史栈，在某些情况下（如直接从 URL 进入播放页）可能回退到非预期页面。使用绝对路径显式跳转到 MovieDetail，绕过竞态和历史栈问题。

#### 步骤 2：确保 MovieDetail 有 loading 状态保护

**文件**：[MovieDetail.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieDetail.tsx)

**检查**：确认 `isLoading` 状态有渲染 loading spinner（约第 48-55 行，已有），且有 `isError` 错误处理。

无需修改（已有保护）。

### 修复方案 B（备选）：等待 endRecording 完成再导航

如果方案 A 不能解决，则先 await 再导航：

```tsx
const handleBack = useCallback(async () => {
    await endRecording(progressRef.current)
    navigate(`/movie/${imdbId}`)
}, [navigate, endRecording, imdbId])
```

但需修改 `usePlaybackRecording` 让 `endRecording` 返回 Promise。

### 验证步骤

1. 从首页点击影片 → MovieDetail → 点击 Play → 进入播放页
2. 播放几秒后，点击左上角返回箭头
3. 确认跳转到 MovieDetail 页面，内容正常显示（非白屏）
4. 刷新页面后确认内容一致
5. 测试多次来回（MovieDetail → Player → MovieDetail → Player）确认不累积问题

---

## B05：设置页面无法保存设置

**严重度**：🟠 严重 | **难度**：⭐⭐ 低 | **预计文件数**：1

### 修复目标

修改设置后 "Save Settings" 按钮可点击，保存操作正常执行。

### 修复步骤

#### 步骤 1：避免 reset 反复触发导致 isDirty 永久为 false

**文件**：[SettingsViewer.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/settings/SettingsViewer.tsx)

**方案 A（推荐）**：使用标志位控制只 reset 一次

```tsx
const hasResetRef = useRef(false)

useEffect(() => {
    if (settings && !hasResetRef.current) {
      reset({ ... })
      hasResetRef.current = true
    }
}, [settings, reset])
```

**方案 B**：使用 `useMemo` 比较 settings 值

```tsx
const settingsKey = useMemo(() => {
    if (!settings) return ""
    return JSON.stringify({
      dir: settings.MovieDirectory,
      range: settings.ScanDateRange,
      scrape: settings.ScanScrapeActorInfo,
      force: settings.ScanForceUpdate,
    })
}, [settings])

useEffect(() => {
    if (settings) {
      reset({ ... })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [settingsKey])
```

**原理**：`reset()` 将表单值重置为 `defaultValues`，而 `defaultValues` 等于当前 API 返回的值。每次 `reset()` 后 `isDirty` 清零，按钮被禁用。方案 A 用 ref 确保只 reset 一次；方案 B 只在 settings 实际内容变化时才 reset。

#### 步骤 2：移除按钮的 `isDirty` 禁用逻辑（可选降级）

如果步骤 1 复杂，可临时移除 `isDirty` 限制：

```tsx
// Before
disabled={saveMutation.isPending || !isDirty}

// After (降级方案，允许重复保存)
disabled={saveMutation.isPending}
```

**风险**：用户可能点击保存到未修改的状态，浪费一次 API 调用，但不影响功能。

### 验证步骤

1. 导航到 `/settings`
2. 在 Movie Directory 输入框中输入路径
3. 确认 "Save Settings" 按钮变为可点击（非灰色）
4. 点击 "Save Settings"
5. 确认 sonner toast 提示 "Settings saved successfully"
6. 修改 Scan Options 中的 Date Range
7. 再次保存，确认按钮可用且保存成功
8. 刷新页面，确认之前保存的值仍然存在

---

## B03：Actors 页面无内容

**严重度**：🟡 一般 | **难度**：⭐⭐⭐ 中 | **预计文件数**：2-3

### 修复目标

Actors 页面显示演员列表，包含搜索和浏览功能。

### 修复步骤

#### 步骤 1：创建 actorService API hooks

**文件**：新建 `jav-manager-web/src/services/actorService.ts`

```tsx
import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "@/lib/constants"

export interface ActorViewModel {
  id: number
  name: string
  movieCount: number
  cup: string
  height: string
  overall: string
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useActors(search?: string) {
  return useQuery({
    queryKey: ["actors", search ?? ""],
    queryFn: () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ""
      return fetchJson<ActorViewModel[]>(`/actors${params}`)
    },
    staleTime: 60_000,
  })
}
```

#### 步骤 2：实现 ActorGrid 组件

**文件**：[App.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/App.tsx)（替换 ActorGrid stub）

可创建独立文件 `components/actors/ActorGrid.tsx`：

```tsx
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useActors } from "@/services/actorService"

export function ActorGrid() {
  const [search, setSearch] = useState("")
  const { data: actors, isLoading, isError } = useActors(search)
  // ... 渲染演员卡片网格
}
```

#### 步骤 3：创建 ActorCard 组件

**文件**：新建 `jav-manager-web/src/components/actors/ActorCard.tsx`

卡片展示演员头像（如有）、姓名、身高、罩杯、评分、影片数，点击跳转到演员详情（后续阶段）。

### 最小可行版本（MVP 修复）

如果只需让页面有内容，最低限度修改：

```tsx
function ActorGrid() {
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/actors")
      .then(r => r.json())
      .then(data => { setActors(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="container py-8"><p>Loading...</p></div>
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Actors</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {actors.map((a: any) => (
          <div key={a.id} className="rounded-lg border p-4">
            <p className="font-medium">{a.name}</p>
            {a.cup && <p className="text-sm text-muted-foreground">{a.cup}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 验证步骤

1. 导航到 `/actors`
2. 确认不再只有标题，演员列表正常展示
3. 确认每个演员卡片显示名称 + 基本信息
4. （如有搜索）输入演员名，确认搜索过滤生效
5. 确认 API `/api/actors` 返回 200

---

## B06：首页卡片右侧不贴边

**严重度**：🟢 轻微 | **难度**：⭐ 低 | **预计文件数**：1

### 修复目标

影片卡片网格左右留白对称，卡片紧贴容器边缘。

### 修复步骤

#### 步骤 1：调整容器内边距

**文件**：[MovieGrid.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/movies/MovieGrid.tsx)

**方案 A（推荐）**：去掉 `container`，手动设置宽度和内边距

```tsx
// Before
<div ref={containerRef} className="container py-4">

// After
<div ref={containerRef} className="w-full max-w-[1920px] mx-auto px-4 py-4">
```

#### 步骤 2：调整行内 gap 与容器内边距一致

保持 `gap-4` 与 `px-4` 一致，这样 grid 的列间间距和容器边距对称。

### 验证步骤

1. 打开首页
2. 目测最左侧卡片到页面左边缘的距离 = 最右侧卡片到页面右边缘的距离
3. 在不同窗口宽度（1920px、1440px、1024px、768px）测试
4. 确认卡片列之间的间距与边缘间距一致
