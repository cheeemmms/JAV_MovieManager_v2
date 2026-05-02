# 项目架构

> 目标项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
> 旧项目参考：`D:\Personal_file\VibeCoding\clone\JAV_MovieManager`

---

## 一、总体架构

```
┌─────────────────────────────────────────────────────┐
│                  jav-manager-tray                     │
│                 (WPF 系统托盘壳)                        │
│  启动 → 隐藏窗口 → 运行后端API → 打开浏览器              │
└──────────────────┬──────────────────────────────────┘
                   │ 启动/管理
┌──────────────────▼──────────────────────────────────┐
│                 jav-manager-api                       │
│              (.NET 9 Web API + EF Core 9)             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │Controllers│  │  Services    │  │   Data Layer  │  │
│  │          │  │              │  │               │  │
│  │ Movies   │  │ MovieService │  │ AppDbContext  │  │
│  │ Stream   │  │ StreamService│  │   + Migrations│  │
│  │ Actors   │  │ ScanService  │  │               │  │
│  │ Stats    │  │ StatsService │  │   SQLite DB   │  │
│  │ Settings │  │ ScrapeService│  │               │  │
│  │ Images   │  │              │  │               │  │
│  │ Genres   │  │              │  │               │  │
│  │ Tags     │  │              │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP REST API
┌──────────────────▼──────────────────────────────────┐
│                  jav-manager-web                      │
│            (React 18 + Vite + TypeScript)             │
│  ┌────────────────────────────────────────────────┐  │
│  │              Zustand Stores                     │  │
│  │   filterStore / themeStore / playerStore        │  │
│  ├────────────────────────────────────────────────┤  │
│  │          TanStack Query (API Layer)             │  │
│  ├────────────────────────────────────────────────┤  │
│  │            React Router (6 routes)              │  │
│  ├──────────┬──────────┬──────────┬──────────────┤  │
│  │ MovieGrid│  Player  │Dashboard │  Settings     │  │
│  │ FilterPanel│ DPlayer │ Recharts │  RHF + Zod   │  │
│  │ Virtuoso │ Framer M.│ StatCards│              │  │
│  └──────────┴──────────┴──────────┴──────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 二、项目目录结构

```
JAV_MovieManager_v2/
│
├── jav-manager-api/                    # .NET 9 后端
│   ├── Controllers/
│   │   ├── MoviesController.cs         # 影片 CRUD + 筛选
│   │   ├── StreamController.cs         # 视频流（Range 请求）
│   │   ├── ActorsController.cs         # 演员
│   │   ├── GenresController.cs         # 类型
│   │   ├── TagsController.cs           # 标签
│   │   ├── DirectorsController.cs      # 导演
│   │   ├── StudiosController.cs        # 片商
│   │   ├── StatsController.cs          # 统计数据
│   │   ├── HistoryController.cs        # 播放历史
│   │   ├── SettingsController.cs       # 用户设置
│   │   └── ImageController.cs          # 封面/海报
│   ├── Services/
│   │   ├── MovieService.cs             # 影片业务逻辑
│   │   ├── FileScannerService.cs       # NFO 扫描（移植旧FileScanner）
│   │   ├── StreamService.cs            # 视频流
│   │   ├── ActorService.cs             # 演员业务
│   │   ├── ScrapeService.cs            # 演员信息爬取（移植旧ScrapeService）
│   │   └── StatsService.cs             # 统计计算
│   ├── Models/
│   │   ├── Movie.cs
│   │   ├── Actor.cs
│   │   ├── Genre.cs
│   │   ├── Tag.cs
│   │   ├── Director.cs
│   │   ├── Studio.cs
│   │   ├── PlaybackHistory.cs          # 新增
│   │   ├── PlayList.cs
│   │   ├── PlayListItem.cs
│   │   └── DTOs/
│   │       ├── MovieViewModel.cs
│   │       ├── ActorViewModel.cs
│   │       ├── FilterRequest.cs
│   │       ├── SearchRequest.cs
│   │       └── StatsResponse.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── SqliteConfiguration.cs
│   │   └── Migrations/
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Program.cs                      # 最小API入口
│   └── jav-manager-api.csproj
│
├── jav-manager-web/                    # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui 组件（自动生成）
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx          # FilterPanel 用
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── command.tsx         # cmdk 搜索
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── toggle.tsx          # 主题切换
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx       # 主布局壳
│   │   │   │   └── Navbar.tsx          # 顶部导航
│   │   │   ├── movies/
│   │   │   │   ├── MovieGrid.tsx       # 影片网格（包装react-virtuoso）
│   │   │   │   ├── MovieCard.tsx       # 影片卡片（blurhash+悬停动画）
│   │   │   │   └── MovieDetail.tsx     # 影片详情页
│   │   │   ├── player/
│   │   │   │   ├── DPlayerWrapper.tsx  # DPlayer 的 React 封装
│   │   │   │   └── VideoPlayer.tsx     # 播放器容器（Framer Motion动画）
│   │   │   ├── filter/
│   │   │   │   ├── FilterPanel.tsx     # 弹出筛选面板（Drawer）
│   │   │   │   ├── ActorSearch.tsx     # cmdk 演员搜索
│   │   │   │   └── SavedFilters.tsx    # 保存的筛选方案
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCards.tsx       # 统计卡片
│   │   │   │   ├── TopChart.tsx        # Top10 排行（Recharts）
│   │   │   │   ├── TrendChart.tsx      # 时间趋势（Recharts）
│   │   │   │   └── Heatmap.tsx         # 月度热力图
│   │   │   └── settings/
│   │   │       └── SettingsViewer.tsx   # 设置页面
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts          # 搜索防抖
│   │   │   └── useMediaQuery.ts        # 响应式
│   │   ├── services/
│   │   │   ├── api.ts                  # API 基础配置（baseURL等）
│   │   │   ├── movieService.ts         # 影片 API hooks
│   │   │   ├── actorService.ts         # 演员 API hooks
│   │   │   ├── statsService.ts         # 统计 API hooks
│   │   │   └── settingsService.ts      # 设置 API hooks
│   │   ├── stores/
│   │   │   ├── filterStore.ts          # 筛选状态
│   │   │   ├── themeStore.ts           # 主题状态
│   │   │   └── playerStore.ts          # 播放器状态
│   │   ├── lib/
│   │   │   ├── utils.ts                # 通用工具函数
│   │   │   └── constants.ts            # 常量
│   │   ├── types/
│   │   │   ├── movie.ts                # Movie 类型
│   │   │   ├── actor.ts                # Actor 类型
│   │   │   ├── filter.ts               # 筛选类型
│   │   │   └── stats.ts                # 统计类型
│   │   ├── App.tsx                     # 应用入口
│   │   ├── main.tsx                    # Vite 入口
│   │   └── index.css                   # Tailwind 入口
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── jav-manager-tray/                   # WPF 托盘壳
    ├── App.xaml
    ├── App.xaml.cs
    ├── MainWindow.xaml
    ├── MainWindow.xaml.cs              # 隐藏窗口 + 启动API + 打开浏览器
    ├── NotifyIconViewModel.cs          # 托盘菜单
    ├── jav-manager-tray.csproj
    └── app.manifest
```

---

## 三、数据库 Schema

### 3.1 Movie（影片）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| ImdbId | TEXT | PK | 番号，如 ABCD-123 |
| Title | TEXT | | 影片标题 |
| Plot | TEXT | | 简介 |
| Year | INTEGER | | 发行年份 |
| Runtime | INTEGER | | 时长（分钟） |
| Director | TEXT | | 导演 |
| Studio | TEXT | | 片商 |
| PosterFileLocation | TEXT | | 海报路径 |
| FanArtLocation | TEXT | | 封面图/背景图路径 |
| MovieLocation | TEXT | | 影片文件路径（多个用\|分隔） |
| DateAdded | TEXT | | 入库日期 (yyyy-MM-dd) |
| ReleaseDate | TEXT | | 发行日期 |
| PlayedCount | INTEGER | DEFAULT 0 | 播放次数 |
| LastPlayedAt | TEXT | | 上次播放时间 (ISO 8601 datetime) |
| Progress | REAL | DEFAULT 0 | 上次播放进度百分比（续播用） |
| Rating | REAL | DEFAULT 0 | 评分（从演员Overall聚合） |
| Favorite | INTEGER | DEFAULT 0 | 是否喜欢 (0/1) |

### 3.2 Actor（演员）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| Name | TEXT | UNIQUE | 演员名 |
| DateofBirth | TEXT | | 生日 (yyyy-MM-dd) |
| Height | TEXT | | 身高，如 "165cm" |
| Cup | TEXT | | 罩杯，如 "D Cup" |
| Bust | TEXT | | 胸围 |
| Waist | TEXT | | 腰围 |
| Hips | TEXT | | 臀围 |
| Looks | TEXT | | 颜值评分 (1-10) |
| Body | TEXT | | 身材评分 (1-10) |
| SexAppeal | TEXT | | 性感度评分 (1-10) |
| Overall | TEXT | | 综合评分 (1-10) |
| LastUpdated | TEXT | | 最后更新日期 |
| Favorite | INTEGER | DEFAULT 0 | 是否喜欢 (0/1) |

### 3.3 Genre（类型）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| Name | TEXT | UNIQUE | 类型名 |

### 3.4 Tag（标签）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| Name | TEXT | UNIQUE | 标签名 |

### 3.5 PlaybackHistory（播放历史）— v2 新增

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| MovieId | TEXT | FK → Movie(ImdbId), NOT NULL | 关联影片 |
| StartedAt | TEXT | NOT NULL | 开始播放时间 (ISO 8601) |
| EndedAt | TEXT | | 结束/暂停时间，未正常结束为空 |
| Duration | INTEGER | | 本次观看秒数 |
| Percentage | REAL | | 看完比例 (0-100) |
| CreatedAt | TEXT | NOT NULL | 记录创建时间 |

**索引建议**: `CREATE INDEX idx_history_movie ON PlaybackHistory(MovieId);`
**索引建议**: `CREATE INDEX idx_history_started ON PlaybackHistory(StartedAt);`

### 3.6 MovieActors（影片-演员关联）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| ImdbId | TEXT | FK → Movie(ImdbId) | 影片番号 |
| ActorName | TEXT | FK → Actor(Name) | 演员名 |

### 3.7 MovieGenres（影片-类型关联）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| ImdbId | TEXT | FK → Movie(ImdbId) | 影片番号 |
| GenreName | TEXT | FK → Genre(Name) | 类型名 |

### 3.8 MovieTags（影片-标签关联）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| ImdbId | TEXT | FK → Movie(ImdbId) | 影片番号 |
| TagName | TEXT | FK → Tag(Name) | 标签名 |

### 3.9 PlayList（播放列表）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| Name | TEXT | | 播放列表名 |
| CreatedAt | TEXT | | 创建时间 |

### 3.10 PlayListItem（播放列表项）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| PlayListId | INTEGER | FK → PlayList(Id) | 播放列表 ID |
| ImdbId | TEXT | | 影片番号 |
| SortOrder | INTEGER | | 排序序号 |

### 3.11 UserSettings（用户设置）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| Id | INTEGER | PK, AUTOINCREMENT | 主键 |
| Key | TEXT | UNIQUE | 设置键 |
| Value | TEXT | | 设置值 |

### 3.12 ER 关系图

```
Movie ──┬── MovieActors ──── Actor
        ├── MovieGenres ──── Genre
        ├── MovieTags ────── Tag
        └── PlaybackHistory (1:N)

PlayList ─── PlayListItem (1:N) ─── Movie

UserSettings (独立)
```

### 3.13 与旧数据库的差异

| 变更 | 说明 |
|---|---|
| `PlaybackHistory` | 新增表，记录每次播放 |
| `Movie.Progress` | 新增字段，支持续播 |
| `Movie.LastPlayedAt` | 新增字段 |
| `Movie.Rating` | 新增字段 |
| `Movie.Favorite` | 替代旧的 `Liked` 字段 |
| `Actor.Favorite` | 新增字段 |
| `PlayList.CreatedAt` | 新增字段 |

---

## 四、API 接口设计

Base URL: `http://localhost:{port}/api`

### 4.1 影片 `/api/movies`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/movies` | 获取所有影片，支持 `?sort=` 和 `?page=&pageSize=` |
| GET | `/api/movies/{imdbId}` | 获取单个影片详情（含关联的Actor/Genre/Tag） |
| GET | `/api/movies/recent` | 获取最近添加的影片（默认30天内） |
| GET | `/api/movies/years` | 获取所有年份列表 |
| GET | `/api/movies/favorites` | 获取喜欢影片列表 |
| POST | `/api/movies/filter` | **统一筛选接口**（核心接口） |
| POST | `/api/movies/search` | 模糊搜索（番号/标题） |
| POST | `/api/movies/scan` | 触发 NFO 扫描入库 |
| POST | `/api/movies/favorite/{imdbId}` | 切换喜欢状态，返回新状态 |

#### 统一筛选接口 `POST /api/movies/filter`

```json
// Request
{
  "searchTerm": "",
  "actors": ["演员A"],
  "genres": [],
  "tags": [],
  "directors": [],
  "studios": [],
  "yearFrom": 2018,
  "yearTo": 2024,
  "heightFrom": 140,
  "heightTo": 190,
  "cups": ["D", "E"],
  "ageFrom": 18,
  "ageTo": 50,
  "ratingFrom": 3.0,
  "playedMin": 0,
  "playedMax": null,
  "favoriteOnly": false,
  "isAndOperator": true,
  "sortBy": "dateAdded",
  "sortOrder": "desc",
  "page": 1,
  "pageSize": 50
}

// Response
{
  "totalCount": 230,
  "page": 1,
  "pageSize": 50,
  "items": [
    {
      "imdbId": "ABCD-123",
      "title": "...",
      "director": "...",
      "studio": "...",
      "posterFileLocation": "...",
      "fanArtLocation": "...",
      "movieLocation": "...",
      "dateAdded": "2025-01-15",
      "year": 2024,
      "runtime": 120,
      "playedCount": 5,
      "progress": 0,
      "rating": 4.2,
      "favorite": false,
      "actors": ["演员A", "演员B"],
      "genres": ["类型1"],
      "tags": ["标签1"]
    }
  ]
}
```

### 4.2 视频流 `/api/stream`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/stream/{imdbId}` | 视频文件流，支持 `Range` 头（返回 206 Partial Content） |
| GET | `/api/stream/{imdbId}/info` | 视频元信息 JSON |

```json
// GET /api/stream/{imdbId}/info  Response
{
  "imdbId": "ABCD-123",
  "filePath": "D:\\Movies\\ABCD-123.mp4",
  "fileSize": 2147483648,
  "duration": "01:58:30",
  "resolution": "1920x1080",
  "codec": "h264"
}
```

**关键实现**：使用 `FileStreamResult` 配合 `EnableRangeProcessing = true`，DPlayer 会自动发送 Range 请求实现拖动进度条。

### 4.3 图片 `/api/images`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/images/poster/{imdbId}` | 影片海报图片 |
| GET | `/api/images/fanart/{imdbId}` | 影片封面/背景图 |
| GET | `/api/images/placeholder/poster` | 默认海报占位图 |

### 4.4 演员 `/api/actors`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/actors` | 获取所有演员，支持 `?search=` |
| GET | `/api/actors/{name}` | 演员详情 |
| GET | `/api/actors/favorites` | 喜欢演员 |
| GET | `/api/actors/local` | 本地有影片的演员 |
| POST | `/api/actors/filter` | 演员筛选（身高/罩杯/年龄） |
| POST | `/api/actors/favorite/{name}` | 切换喜欢 |
| POST | `/api/actors/scrape` | 触发爬取演员信息 |

### 4.5 类型 `/api/genres`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/genres` | 所有类型 |
| GET | `/api/genres/favorites` | 喜欢类型 |

### 4.6 标签 `/api/tags`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/tags` | 所有标签 |
| GET | `/api/tags/favorites` | 喜欢标签 |

### 4.7 导演 `/api/directors`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/directors` | 所有导演 |

### 4.8 片商 `/api/studios`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/studios` | 所有片商 |

### 4.9 统计 `/api/stats`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/stats/dashboard` | 仪表盘汇总 |
| GET | `/api/stats/top-actors?top=10` | Top N 演员播放排行 |
| GET | `/api/stats/top-tags?top=10` | Top N 标签播放排行 |
| GET | `/api/stats/top-studios?top=10` | Top N 片商播放排行 |
| GET | `/api/stats/trend?days=30` | 最近N天每日播放趋势 |
| GET | `/api/stats/heatmap?year=2025` | 某年每日热力图数据 |
| GET | `/api/stats/{imdbId}` | 单影片播放统计 |

#### 仪表盘汇总 `GET /api/stats/dashboard`

```json
{
  "totalMovies": 230,
  "totalPlayCount": 1520,
  "totalWatchDuration": 3672000,
  "totalActorsWatched": 85,
  "favoriteCount": 42,
  "topActors": [
    { "name": "演员A", "count": 45, "duration": 36000 },
    { "name": "演员B", "count": 38, "duration": 28000 }
  ],
  "topTags": [
    { "name": "标签1", "count": 120 }
  ],
  "recentTrend": [
    { "date": "2025-06-01", "count": 8 },
    { "date": "2025-06-02", "count": 5 }
  ]
}
```

### 4.10 设置 `/api/settings`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/settings` | 所有设置 |
| GET | `/api/settings/{key}` | 单个设置 |
| PUT | `/api/settings/{key}` | 更新设置 |
| POST | `/api/settings/initialize` | 首次初始化 |

### 4.11 播放历史 `/api/history`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/history/{imdbId}` | 单影片播放历史 |
| POST | `/api/history` | 记录播放 |
| PATCH | `/api/history/{id}` | 更新结束状态 |

```json
// POST /api/history
{
  "movieId": "ABCD-123",
  "startedAt": "2025-06-15T20:30:00Z",
  "endedAt": "2025-06-15T21:00:00Z",
  "duration": 1800,
  "percentage": 45.5
}
```

---

## 五、前端组件结构

### 5.1 路由设计

| 路径 | 组件 | 说明 |
|---|---|---|
| `/` | MovieGrid | 媒体库主页 |
| `/movie/:imdbId` | MovieDetail | 影片详情 |
| `/play/:imdbId` | VideoPlayer | 全屏播放器 |
| `/actors` | ActorGrid | 演员浏览（可选） |
| `/dashboard` | Dashboard | 统计仪表盘 |
| `/settings` | SettingsViewer | 设置页面 |

### 5.2 组件层级树

```
App.tsx
└── ThemeProvider
    └── QueryClientProvider (TanStack)
        └── BrowserRouter
            └── AppLayout
                ├── Navbar
                │   ├── Logo + 标题
                │   ├── NavigationMenu
                │   ├── SearchBar (cmdk Command)
                │   ├── FilterButton → 打开 FilterPanel
                │   └── ThemeToggle (sun/moon)
                │
                └── <Outlet> (路由内容区)
                    │
                    ├── [/] MovieGrid
                    │   ├── FilterPanel (Drawer)
                    │   │   ├── ActorSearch (Command)
                    │   │   ├── 维度选择区
                    │   │   ├── 演员属性区（身高/罩杯/年龄）
                    │   │   ├── 评分/播放/喜欢
                    │   │   ├── 排序选择
                    │   │   └── [应用] [重置] [保存方案]
                    │   └── react-virtuoso
                    │       └── MovieCard * N
                    │           ├── BlurhashImage (封面)
                    │           ├── 信息区（番号/标题/评分）
                    │           └── hover: 详细信息层
                    │
                    ├── [/play/:imdbId] VideoPlayer
                    │   └── AnimatePresence
                    │       └── DPlayerWrapper
                    │
                    ├── [/dashboard] Dashboard
                    │   ├── StatCards (4个)
                    │   ├── TopChart (Recharts Bar)
                    │   ├── TrendChart (Recharts Line)
                    │   └── Heatmap
                    │
                    └── [/settings] SettingsViewer
                        └── Form (React Hook Form + Zod)
                            ├── 影片目录
                            ├── 扫描触发
                            └── 其他设置
```

### 5.3 核心组件交互说明

#### MovieCard → VideoPlayer 过渡

```
用户点击 MovieCard
  → navigate(`/play/${imdbId}`)
  → VideoPlayer 页面加载
  → Framer Motion AnimatePresence 展开容器
  → DPlayerWrapper 初始化 DPlayer 实例
  → DPlayer 向 /api/stream/{imdbId} 发起 Range 请求
  → 播放开始，每30秒 POST /api/history 记录
```

#### FilterPanel → MovieGrid 数据流

```
用户修改筛选条件 (filterStore)
  → 点击"应用"
  → TanStack Query 将 filterStore 状态组装为 POST body
  → POST /api/movies/filter
  → 返回 { totalCount, items }
  → MovieGrid 重新渲染
  → react-virtuoso 虚拟滚动
```

---

## 六、状态管理（Zustand）

### 6.1 filterStore

```typescript
interface FilterState {
  searchTerm: string;
  selectedActors: string[];
  selectedGenres: string[];
  selectedTags: string[];
  selectedDirectors: string[];
  selectedStudios: string[];
  yearRange: [number, number];
  heightRange: [number, number];
  selectedCups: string[];
  ageRange: [number, number];
  ratingMin: number;
  playedMin: number;
  playedMax: number | null;
  favoriteOnly: boolean;
  sortBy: 'dateAdded' | 'title' | 'rating' | 'playedCount';
  sortOrder: 'asc' | 'desc';
  isAndOperator: boolean;
  savedFilters: SavedFilter[];
}

interface FilterActions {
  setSearchTerm: (term: string) => void;
  toggleActor: (name: string) => void;
  toggleTag: (name: string) => void;
  toggleGenre: (name: string) => void;
  setYearRange: (range: [number, number]) => void;
  setHeightRange: (range: [number, number]) => void;
  setAgeRange: (range: [number, number]) => void;
  toggleCup: (cup: string) => void;
  setRatingMin: (rating: number) => void;
  setPlayedRange: (min: number, max: number | null) => void;
  toggleFavoriteOnly: () => void;
  setSortBy: (field: string) => void;
  toggleSortOrder: () => void;
  resetAll: () => void;
  saveFilter: (name: string) => void;
  applySavedFilter: (name: string) => void;
  deleteSavedFilter: (name: string) => void;
  buildApiRequest: () => FilterRequestBody;
}
```

### 6.2 themeStore

```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}
```

### 6.3 playerStore

```typescript
interface PlayerState {
  currentMovieId: string | null;
  isOpen: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

interface PlayerActions {
  open: (imdbId: string) => void;
  close: () => void;
  setPlaying: (playing: boolean) => void;
  updateTime: (current: number, duration: number) => void;
}
```

---

## 七、数据流图

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  filterStore │    │  themeStore  │    │ playerStore  │
│  (Zustand)   │    │  (Zustand)   │    │  (Zustand)   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              React Components 消费                   │
│  MovieGrid 读 filterStore → TanStack Query → API   │
│  Navbar 读 themeStore → 切换 Tailwind class          │
│  VideoPlayer 读 playerStore → DPlayer 控制          │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│            TanStack Query (缓存层)                    │
│  useMovies(filter)   → GET/POST /api/movies/...     │
│  useDashboard()       → GET /api/stats/dashboard     │
│  useActorList()       → GET /api/actors              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────────────┐
│              ASP.NET Core Web API                    │
│  Controllers → Services → EF Core → SQLite           │
└─────────────────────────────────────────────────────┘
```

---

## 八、旧项目架构参考

旧项目位于 `D:\Personal_file\VibeCoding\clone\JAV_MovieManager`，以下文件对新项目有直接参考价值：

| 旧项目文件 | 新项目对应 | 移植策略 |
|---|---|---|
| `MovieManager.ClassLibrary/Movie/Movie.cs` | `Models/Movie.cs` | 参考字段定义，新增PlaybackHistory相关字段 |
| `MovieManager.ClassLibrary/Actor/Actor.cs` | `Models/Actor.cs` | 参考字段定义，新增Favorite字段 |
| `MovieManager.BusinessLogic/FileScanner.cs` | `Services/FileScannerService.cs` | 移植NFO扫描逻辑，升级到.NET 9 |
| `MovieManager.BusinessLogic/XmlProcessor.cs` | `Services/XmlProcessor.cs` | 直接移植XML解析逻辑 |
| `MovieManager.BusinessLogic/ScrapeService.cs` | `Services/ScrapeService.cs` | 移植爬虫逻辑，升级HttpClient |
| `MovieManager.BusinessLogic/MovieService.cs` | `Services/MovieService.cs` | 参考筛选SQL构建逻辑 |
| `MovieManager.Data/DatabaseContext.cs` | `Data/AppDbContext.cs` | EF Core 9 重写 |
| `MovieManager.Endpoint/Controllers/MovieController.cs` | `Controllers/MoviesController.cs` | 参考API结构 |
| `MovieManager.Endpoint/Program.cs` | TrayApp + API Program.cs | 参考启动+端口检测逻辑 |

---

## 九、变更记录

| 日期 | 变更 | 决策人 |
|---|---|---|
| 2026-05-02 | 初始创建，从 design-document.md 独立 | 用户 |
