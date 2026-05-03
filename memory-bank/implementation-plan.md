# 开发规划

> 目标项目：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
> 旧项目参考：`D:\Personal_file\VibeCoding\clone\JAV_MovieManager`
> 当前阶段：**阶段 B MVP 开发中，M0-M5 已完成，M6 待开始**

---

## 一、总体路线图

```
阶段 A: 产品设计    ✅ 已完成
阶段 B: MVP 开发    🔄 进行中（M0-M5 已完成，M6 待开始）
阶段 C: 增强功能    🔲 后续
```

---

## 二、Milestone 0：项目初始化

**目标**：搭建三个项目的骨架，安装所有依赖，确保项目可编译/可启动。

### M0.1 创建后端项目

| 任务ID | 任务 | 详细说明 | 依赖 |
|---|---|---|---|
| M0.1.1 | 创建 .NET 9 Web API 项目 | `dotnet new webapi -n jav-manager-api` | 无 |
| M0.1.2 | 添加 NuGet 包 | EF Core SQLite, Serilog, CORS | M0.1.1 |
| M0.1.3 | 配置 appsettings.json | 数据库路径、日志配置、端口 | M0.1.1 |
| M0.1.4 | 配置 Program.cs | CORS、Serilog、端口检测 | M0.1.2 |

**验证标准**：`dotnet run` 启动后 `http://localhost:{port}/api` 返回 200。

### M0.2 创建前端项目

| 任务ID | 任务 | 详细说明 | 依赖 |
|---|---|---|---|
| M0.2.1 | 创建 Vite + React + TS 项目 | `npm create vite@latest jav-manager-web -- --template react-ts` | 无 |
| M0.2.2 | 安装所有依赖 | 见 tech-stack.md 的完整安装命令 | M0.2.1 |
| M0.2.3 | 配置 Tailwind CSS | `tailwind.config.ts`, `index.css` | M0.2.2 |
| M0.2.4 | 初始化 shadcn/ui | `npx shadcn@latest init` | M0.2.3 |
| M0.2.5 | 添加基础 shadcn 组件 | button, card, dialog, drawer, slider, checkbox, command, separator, toggle, navigation-menu | M0.2.4 |
| M0.2.6 | 配置 React Router | 6个路由骨架 | M0.2.1 |
| M0.2.7 | 配置 TanStack Query | QueryClientProvider 包裹 | M0.2.2 |
| M0.2.8 | 创建 Zustand Stores 骨架 | filterStore, themeStore, playerStore 空壳 | M0.2.2 |

**验证标准**：`npm run dev` 启动后可看到空白 React 页面。

### M0.3 创建托盘壳项目

| 任务ID | 任务 | 详细说明 | 依赖 |
|---|---|---|---|
| M0.3.1 | 创建 WPF 项目 | 参考旧 TrayApp 结构 | 无 |
| M0.3.2 | 实现 MainWindow 启动逻辑 | 隐藏窗口 + 启动API进程 + 打开浏览器 | M0.3.1 |

**验证标准**：运行 TrayApp → 自动打开浏览器 → 看到前端页面。

---

## 三、Milestone 1：后端核心

**目标**：完成所有数据模型、数据库迁移、核心业务服务和 API 端点。

### M1.1 数据层

| 任务ID | 任务 | 详细说明 | 旧项目参考 |
|---|---|---|---|
| M1.1.1 | 创建所有 Entity Model | Movie, Actor, Genre, Tag, PlaybackHistory, PlayList, PlayListItem, UserSettings | `ClassLibrary/` 下各 .cs 文件 |
| M1.1.2 | 创建 AppDbContext | DbSet 配置、OnModelCreating | `Data/DatabaseContext.cs` |
| M1.1.3 | 创建 Initial Migration | `dotnet ef migrations add InitialCreate` | 无 |
| M1.1.4 | 创建 DTOs | MovieViewModel, ActorViewModel, FilterRequest, SearchRequest, StatsResponse | `ClassLibrary/` 下 ViewModel |

### M1.2 核心服务

| 任务ID | 任务 | 详细说明 | 旧项目参考 |
|---|---|---|---|
| M1.2.1 | 实现 FileScannerService | NFO 扫描 + 影片文件匹配 + 海报/封面匹配 | `BusinessLogic/FileScanner.cs` |
| M1.2.2 | 实现 XmlProcessor | 解析 NFO XML 文件 | `BusinessLogic/XmlProcessor.cs` |
| M1.2.3 | 实现 MovieService | CRUD + 统一筛选 + 模糊搜索 + 收藏切换 | `BusinessLogic/MovieService.cs` |
| M1.2.4 | 实现 ActorService | 查询 + 演员属性筛选 + 收藏 | `BusinessLogic/ActorService.cs` |
| M1.2.5 | 实现 StreamService | 视频文件 Range 流、视频信息 | 新增 |
| M1.2.6 | 实现 ScrapeService | 演员信息爬取（移植旧代码，升级 HttpClient） | `BusinessLogic/ScrapeService.cs` |
| M1.2.7 | 实现 StatsService | 统计计算：仪表盘汇总、排行榜、趋势、热力图 | 新增 |

### M1.3 API 端点

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M1.3.1 | 实现 MoviesController | 所有影片相关端点 |
| M1.3.2 | 实现 StreamController | 视频流端点 |
| M1.3.3 | 实现 ActorsController | 演员相关端点 |
| M1.3.4 | 实现 GenresController | 类型端点 |
| M1.3.5 | 实现 TagsController | 标签端点 |
| M1.3.6 | 实现 DirectorsController + StudiosController | 导演/片商端点 |
| M1.3.7 | 实现 StatsController | 统计端点 |
| M1.3.8 | 实现 HistoryController | 播放历史端点 |
| M1.3.9 | 实现 SettingsController | 设置端点 |
| M1.3.10 | 实现 ImageController | 图片端点 |

### M1.4 基础设施

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M1.4.1 | CORS 配置 | 允许前端跨域 |
| M1.4.2 | Serilog 配置 | 结构化日志 |
| M1.4.3 | 端口自动检测 | 端口被占用时自动递增（参考旧 Program.cs） |

**验证标准**：所有 API 端点可通过 Swagger 或 Postman 测试通过。

---

## 四、Milestone 2：前端媒体库

**目标**：完成布局框架、主题系统、影片网格展示和筛选面板。

### M2.1 布局与主题

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M2.1.1 | 实现 AppLayout | 导航栏 + 内容区布局 |
| M2.1.2 | 实现 Navbar | Logo、导航菜单、搜索入口、筛选按钮、主题切换 |
| M2.1.3 | 实现 ThemeProvider + themeStore | 暗黑/浅色/系统 三模式切换 |
| M2.1.4 | 实现 ThemeToggle | sun/moon 图标按钮 |

### M2.2 媒体库核心

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M2.2.1 | 实现 MovieCard | 卡片组件：blurhash 占位 → 海报加载 → 悬停动画（Framer Motion） |
| M2.2.2 | 实现 MovieGrid | 包装 react-virtuoso，集成 TanStack Query 加载数据 |
| M2.2.3 | 实现 API Service 层 | `services/movieService.ts` 封装 TanStack Query hooks |
| M2.2.4 | 对接后端 API | 首页默认加载"最近添加"，打通数据流 |

### M2.3 搜索与筛选

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M2.3.1 | 实现 SearchBar | cmdk Command 组件，顶部搜索番号/标题 |
| M2.3.2 | 实现 FilterPanel | Drawer 弹出面板，包含所有筛选维度 |
| M2.3.3 | 实现 ActorSearch | cmdk 演员搜索定位 |
| M2.3.4 | 实现各维度选择器 | TagSelector, GenreSelector, DirectorSelector, StudioSelector |
| M2.3.5 | 实现范围滑块 | YearRange, HeightRange, AgeRange (shadcn/ui Slider) |
| M2.3.6 | 实现 CupSelector | 罩杯 A-Z 标签云多选 |
| M2.3.7 | 实现评分/播放筛选 | RatingMin slider + PlayCountFilter |
| M2.3.8 | 实现排序选择器 | 按日期/名称/评分/播放次数 |
| M2.3.9 | 实现 filterStore | 完整 Zustand store + buildApiRequest() |
| M2.3.10 | 实现 SavedFilters | 保存/加载/删除筛选方案 |

### M2.4 图片相关

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M2.4.1 | 实现 BlurhashImage | 封装 blurhash + react-blurhash |
| M2.4.2 | 集成 medium-zoom | 海报点击放大 |

**验证标准**：可在浏览器中浏览影片卡片、搜索、筛选、排序。

---

## 五、Milestone 3：视频播放器

**目标**：在浏览器内完整播放影片，记录播放历史。

### M3.1 DPlayer 封装

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M3.1.1 | 实现 DPlayerWrapper | React 组件封装 DPlayer 初始化/销毁 |
| M3.1.2 | 实现 VideoPlayer 容器 | 路由页面 `/play/:imdbId`，Framer Motion 进入/退出动画 |
| M3.1.3 | 集成 playerStore | 打开/关闭播放器、播放状态同步 |

### M3.2 播放历史

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M3.2.1 | 实现播放记录 hook | 每30秒 POST /api/history |
| M3.2.2 | 实现结束记录 | 暂停/关闭时 PATCH /api/history/{id} |
| M3.2.3 | 实现进度保存 | 写入 Movie.Progress + Movie.LastPlayedAt |
| M3.2.4 | 实现续播提示 | 打开有进度的影片时提示"继续上次播放？" |

### M3.3 播放器功能

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M3.3.1 | 键盘快捷键 | 空格暂停、左右快进、F全屏、Esc退出 |
| M3.3.2 | 影片信息栏 | 播放器下方显示番号/标题/演员 |
| M3.3.3 | 喜欢按钮 | 播放器内一键收藏 |
| M3.3.4 | H.265 检测 | 检测浏览器解码能力，不支持的给出提示 |

**验证标准**：点击影片卡片 → 播放器平滑展开 → 视频正常播放 → 进度可拖拽。

---

## 六、Milestone 4：统计仪表盘

**目标**：可视化仪表盘，展示观影统计数据。

### M4.1 后端统计

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M4.1.1 | StatsService 完成 | 仪表盘汇总、排行榜、趋势、热力图计算 |

### M4.2 前端仪表盘

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M4.2.1 | 实现 StatCards | 4个统计卡片 + 数字动画 |
| M4.2.2 | 实现 TopChart | Recharts BarChart，演员/标签/片商 TopN |
| M4.2.3 | 实现 TrendChart | Recharts LineChart，最近N天趋势 |
| M4.2.4 | 实现 Heatmap | 月度观影热力图（CSS Grid 手写或 Nivo） |
| M4.2.5 | 实现 statsService | TanStack Query hooks |
| M4.2.6 | Dashboard 页面组装 | 路由 /dashboard |

**验证标准**：仪表盘页面展示统计数据，图表可交互。

---

## 七、Milestone 5：辅助功能

**目标**：设置页面、影片详情、通知等。

### M5.1 设置页面

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M5.1.1 | 实现 SettingsViewer | React Hook Form + Zod 表单 |
| M5.1.2 | 影片目录配置 | 添加/删除扫描目录 |
| M5.1.3 | NFO 扫描触发 | 手动触发扫描 + 进度反馈 |
| M5.1.4 | 其他设置 | 端口、日志级别等 |

### M5.2 影片详情

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M5.2.1 | 实现 MovieDetail | 影片详情页 `/movie/:imdbId` |
| M5.2.2 | 详情内容 | 封面、番号、标题、简介、演员列表、标签、评分 |

### M5.3 通知与反馈

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M5.3.1 | 配置 sonner | 全局 Toaster |
| M5.3.2 | 操作反馈 | 扫描完成、收藏成功、播放列表操作等 toast |

**验证标准**：设置可正确保存，影片详情页展示完整信息。

---

## 八、Milestone 6：桌面壳 + 部署

**目标**：WPF 托盘应用集成，一键部署。

### M6.1 TrayApp

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M6.1.1 | 实现托盘菜单 | 打开网页、退出 |
| M6.1.2 | 实现启动流程 | 启动 API → 等待就绪 → 打开浏览器 |
| M6.1.3 | 实现进程管理 | 退出时关闭 API 进程 |

### M6.2 部署

| 任务ID | 任务 | 详细说明 |
|---|---|---|
| M6.2.1 | 前端构建配置 | Vite build → 输出到 API 的 wwwroot |
| M6.2.2 | 后端发布配置 | Self-Contained 发布 |
| M6.2.3 | 打包脚本 | 一键构建全项目 |
| M6.2.4 | 整体测试 | 端到端功能验证 |

**验证标准**：双击 TrayApp.exe → 系统托盘出现 → 浏览器打开 → 所有功能正常。

---

## 九、依赖关系图

```
M0 (项目初始化) ──→ M1 (后端核心) ──→ M2 (前端媒体库) ──→ M3 (播放器)
                      │                    │
                      └──→ M4 (统计: 后端部分)    │
                           │                    │
                           └──→ M4 (统计: 前端部分) ←──┘
                                                          │
M5 (辅助功能) ←── M2 + M3 基本完成后                        │
M6 (部署)     ←── 所有功能完成后                            │
```

---

## 十、给智能体的执行建议

### 执行顺序

1. **严格按 Milestone 顺序执行**，M0 → M1 → M2 ... M6
2. 每个 Milestone 内，任务可以适当并行（如多个 Controller 可同时写）
3. 前后端可以交叉进行：M1 完成后，M2 和 M4 后端可以同时开工

### 命名规范

- C# 文件：PascalCase（如 `MovieService.cs`）
- TypeScript 文件：camelCase 或 PascalCase（组件文件用 PascalCase：`MovieCard.tsx`，工具文件用 camelCase：`api.ts`）
- API 路由：小写 + 复数（`/api/movies`）
- 数据库表：单数（`Movie` 不是 `Movies`）

### 代码风格

- C#：使用 file-scoped namespace，primary constructor 优先
- TypeScript：使用 interface 而非 type，函数组件用 `export function Xxx()`
- 不添加冗余注释，代码自解释

### 旧代码参考

遇到业务逻辑不清晰时，优先查看 architecture.md 第九节列出的旧项目文件。

---

## 十一、变更记录

| 日期 | 变更 | 决策人 |
|---|---|---|
| 2026-05-02 | 初始创建，从 design-document.md 独立并扩展 | 用户 |
