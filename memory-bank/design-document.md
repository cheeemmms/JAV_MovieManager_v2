# JAV MovieManager v2.0 — 设计总文档

## 给智能体的第一句话

你正在对一个 **JAV（日本成人影片）电影管理器** 进行 **全面重写**（v1 → v2）。本文档是知识库入口，所有技术细节已拆分到4个子文档中。**请先完整阅读本文档，再按顺序阅读子文档。**

- **旧项目（只读参考，不要修改）**: `D:\Personal_file\VibeCoding\clone\JAV_MovieManager`
- **新项目（你需要在其中写代码）**: `D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`

---

## 一、项目背景

### 旧项目是什么

旧项目 JAV_MovieManager 是一个用 .NET 5 + React 17 + Ant Design 4 构建的影片管理器，核心功能：
- 扫描本地 `.nfo` 元数据文件入库
- 爬取演员信息（生日、三围、评分）
- 按演员/标签/年份等维度筛选影片
- 生成 `.dpl` 播放列表用 PotPlayer 外部播放

### 为什么要重写

旧项目技术栈过时（.NET 5 / EF 6 非Core / React 17 / CRA），且存在以下痛点：
1. **播放体验差**: 必须跳转到外部 PotPlayer，无法在浏览器内观看
2. **UI 不够现代**: Ant Design 4 风格老旧，无暗黑模式，无动画
3. **筛选体验差**: 侧边栏 Checkbox 树，演员多了找不到，不支持评分/播放次数筛选
4. **无播放统计**: 只有一个简单的播放次数，没有仪表盘

### 核心目标

1. 浏览器内播放视频（替代外部 PotPlayer 调用）
2. Plex/Jellyfin 媒体库风格的现代化 UI
3. 弹出面板式筛选系统，支持评分统计筛选 + 演员属性联动
4. 轻量播放统计 + 数据仪表盘

---

## 二、文档索引

本知识库由5个文件组成，**请按顺序阅读**：

| # | 文件 | 内容 | 何时读 |
|---|---|---|---|
| 1 | `design-document.md`（本文件） | 项目概述、背景、索引 | **首先阅读** |
| 2 | [tech-stack.md](tech-stack.md) | 完整技术栈选型、版本、对比旧项目 | 开始写代码前必读 |
| 3 | [architecture.md](architecture.md) | 目录结构、数据库Schema、API设计、组件树、状态设计 | 写代码时的权威参考 |
| 4 | [implementation-plan.md](implementation-plan.md) | 开发任务拆解、执行顺序、命名规范 | 开发执行指南 |
| 5 | [progress.md](progress.md) | 任务进度跟踪表（动态更新） | 每完成一个任务就更新 |

---

## 三、技术栈快照

> 详细技术栈见 [tech-stack.md](tech-stack.md)

```
前端: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion
播放器: DPlayer（React Wrapper 封装）
图表: Recharts
状态: Zustand（filterStore / themeStore / playerStore）
数据: TanStack Query
表单: React Hook Form + Zod
通知: sonner
虚拟滚动: react-virtuoso
图片: blurhash + medium-zoom
搜索: cmdk + use-debounce
时间: date-fns
路由: react-router-dom

后端: .NET 9 + ASP.NET Core Web API + EF Core 9 + SQLite + Serilog
桌面壳: WPF TrayApp
```

---

## 四、架构快照

> 详见 [architecture.md](architecture.md)

```
jav-manager-tray (WPF) → 启动 jav-manager-api (Kestrel) → 打开浏览器
                                 ↕ HTTP REST
                          jav-manager-web (React + Vite)
                                 ↕ EF Core
                             SQLite 数据库文件
```

### 数据库核心表

- `Movie` — 影片（ImdbId为主键的番号）
- `Actor` — 演员（含身体数据+评分）
- `Genre` / `Tag` — 类型/标签
- `MovieActors` / `MovieGenres` / `MovieTags` — 多对多关联
- `PlaybackHistory` — **v2 新增**，播放历史记录
- `PlayList` / `PlayListItem` — 播放列表
- `UserSettings` — 用户设置

### 前端路由

| 路径 | 组件 | 说明 |
|---|---|---|
| `/` | MovieGrid | 媒体库主页 |
| `/movie/:imdbId` | MovieDetail | 影片详情 |
| `/play/:imdbId` | VideoPlayer | 全屏播放器 |
| `/actors` | ActorGrid | 演员浏览 |
| `/dashboard` | Dashboard | 统计仪表盘 |
| `/settings` | SettingsViewer | 设置页面 |

---

## 五、开发阶段

> 详细规划见 [implementation-plan.md](implementation-plan.md)，进度跟踪见 [progress.md](progress.md)

| 阶段 | 状态 |
|---|---|
| 阶段 A：产品设计 | ✅ 已完成 (2026-05-02) |
| 阶段 B：MVP 开发 (M0-M6) | 🔲 待开始 |
| 阶段 C：增强功能 | 🔲 后续 |

---

## 六、核心决策记录

| 决策 | 结论 |
|---|---|
| 实施策略 | **全面重写**（非渐进式改造） |
| 前端组件库 | **shadcn/ui**（Tailwind 生态） |
| 播放器 | **DPlayer**（浏览器内播放） |
| PotPlayer | **完全舍弃** |
| 状态管理 | **Zustand** |
| 筛选交互 | **弹出面板式**（非侧边栏） |
| 入库方式 | **保留 NFO 扫描**（从旧项目移植） |
| 视频流 | **Range 请求直链**（MP4 全兼容） |
| 托盘壳 | **保留 WPF TrayApp** |

---

## 七、旧项目关键文件（移植参考）

以下文件在新项目中会被参考/移植，**不要复制粘贴**，而是理解业务逻辑后用新技术栈重写：

| 旧文件 | 新文件 | 移植说明 |
|---|---|---|
| `MovieManager.BusinessLogic/FileScanner.cs` | `Services/FileScannerService.cs` | NFO扫描 + 影片匹配 + 海报匹配 |
| `MovieManager.BusinessLogic/XmlProcessor.cs` | `Services/XmlProcessor.cs` | NFO XML 解析 |
| `MovieManager.BusinessLogic/MovieService.cs` | `Services/MovieService.cs` | CRUD + 筛选SQL构建 |
| `MovieManager.BusinessLogic/ScrapeService.cs` | `Services/ScrapeService.cs` | 演员信息爬虫 |
| `MovieManager.Data/DatabaseContext.cs` | `Data/AppDbContext.cs` | EF Core 9 重写 |
| `MovieManager.ClassLibrary/Movie/Movie.cs` | `Models/Movie.cs` | 参考字段定义 |
| `MovieManager.ClassLibrary/Actor/Actor.cs` | `Models/Actor.cs` | 参考字段定义 |
| `MovieManager.Endpoint/Program.cs` | TrayApp 启动逻辑 | 端口检测 + 自动打开浏览器 |

---

## 八、变更记录

| 日期 | 变更 | 操作人 |
|---|---|---|
| 2026-05-02 | 初始创建，汇总所有设计决策 | 用户 |
| 2026-05-02 | 拆分为 5 个文档（design-document + tech-stack + architecture + implementation-plan + progress） | 用户 |
| 2026-05-03 | M5 辅助功能完成：SettingsViewer / MovieDetail / sonner 通知 | AI |
| 2026-05-03 | 全项目 lint 清零：tsc 0 错误 + eslint 0 错误 0 警告 | AI |
