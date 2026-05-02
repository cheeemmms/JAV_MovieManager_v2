# 项目进度跟踪

> 目标项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
> 旧项目参考：`D:\Personal_file\VibeCoding\clone\JAV_MovieManager`
>
> **本文档是动态文档**，每个任务完成后需更新状态和日期。

---

## 一、当前状态

| 指标 | 值 |
|---|---|
| 当前阶段 | 阶段 A 完成，等待进入阶段 B |
| 当前 Milestone | 无（开发尚未开始） |
| 总任务数 | 73 |
| 已完成 | 0 |
| 进行中 | 0 |
| 待开始 | 73 |
| 进度 | 0% |

---

## 二、整体阶段进度

| 阶段 | 状态 | 开始日期 | 完成日期 |
|---|---|---|---|
| 阶段 A：产品设计 | ✅ 已完成 | 2026-05-02 | 2026-05-02 |
| 阶段 B：MVP 开发 | 🔲 待开始 | - | - |
| 阶段 C：增强功能 | 🔲 待开始 | - | - |

---

## 三、Milestone 进度

| Milestone | 任务数 | 完成 | 进度 | 状态 |
|---|---|---|---|---|
| M0：项目初始化 | 12 | 0 | 0% | 🔲 待开始 |
| M1：后端核心 | 19 | 0 | 0% | 🔲 待开始 |
| M2：前端媒体库 | 18 | 0 | 0% | 🔲 待开始 |
| M3：视频播放器 | 11 | 0 | 0% | 🔲 待开始 |
| M4：统计仪表盘 | 8 | 0 | 0% | 🔲 待开始 |
| M5：辅助功能 | 7 | 0 | 0% | 🔲 待开始 |
| M6：桌面壳 + 部署 | 6 | 0 | 0% | 🔲 待开始 |

---

## 四、详细任务跟踪

### M0：项目初始化

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M0.1.1 | 创建 .NET 9 Web API 项目 | 🔲 | - | - | |
| M0.1.2 | 添加 NuGet 包 | 🔲 | - | - | |
| M0.1.3 | 配置 appsettings.json | 🔲 | - | - | |
| M0.1.4 | 配置 Program.cs | 🔲 | - | - | |
| M0.2.1 | 创建 Vite + React + TS 项目 | 🔲 | - | - | |
| M0.2.2 | 安装所有前端依赖 | 🔲 | - | - | |
| M0.2.3 | 配置 Tailwind CSS | 🔲 | - | - | |
| M0.2.4 | 初始化 shadcn/ui | 🔲 | - | - | |
| M0.2.5 | 添加基础 shadcn 组件 | 🔲 | - | - | |
| M0.2.6 | 配置 React Router | 🔲 | - | - | |
| M0.2.7 | 配置 TanStack Query | 🔲 | - | - | |
| M0.2.8 | 创建 Zustand Stores 骨架 | 🔲 | - | - | |
| M0.3.1 | 创建 WPF 托盘壳项目 | 🔲 | - | - | |
| M0.3.2 | MainWindow 启动逻辑 | 🔲 | - | - | |

### M1：后端核心

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M1.1.1 | 创建所有 Entity Model | 🔲 | - | - | |
| M1.1.2 | 创建 AppDbContext | 🔲 | - | - | |
| M1.1.3 | 创建 Initial Migration | 🔲 | - | - | |
| M1.1.4 | 创建 DTOs | 🔲 | - | - | |
| M1.2.1 | 实现 FileScannerService | 🔲 | - | - | 参考旧 FileScanner.cs |
| M1.2.2 | 实现 XmlProcessor | 🔲 | - | - | 参考旧 XmlProcessor.cs |
| M1.2.3 | 实现 MovieService | 🔲 | - | - | 参考旧 MovieService.cs |
| M1.2.4 | 实现 ActorService | 🔲 | - | - | |
| M1.2.5 | 实现 StreamService | 🔲 | - | - | 新增 |
| M1.2.6 | 实现 ScrapeService | 🔲 | - | - | 参考旧 ScrapeService.cs |
| M1.2.7 | 实现 StatsService | 🔲 | - | - | 新增 |
| M1.3.1 | MoviesController | 🔲 | - | - | |
| M1.3.2 | StreamController | 🔲 | - | - | |
| M1.3.3 | ActorsController | 🔲 | - | - | |
| M1.3.4 | GenresController | 🔲 | - | - | |
| M1.3.5 | TagsController | 🔲 | - | - | |
| M1.3.6 | Directors/StudiosController | 🔲 | - | - | |
| M1.3.7 | StatsController | 🔲 | - | - | |
| M1.3.8 | HistoryController | 🔲 | - | - | |
| M1.3.9 | SettingsController | 🔲 | - | - | |
| M1.3.10 | ImageController | 🔲 | - | - | |
| M1.4.1 | CORS 配置 | 🔲 | - | - | |
| M1.4.2 | Serilog 配置 | 🔲 | - | - | |
| M1.4.3 | 端口自动检测 | 🔲 | - | - | 参考旧 Program.cs |

### M2：前端媒体库

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M2.1.1 | AppLayout | 🔲 | - | - | |
| M2.1.2 | Navbar | 🔲 | - | - | |
| M2.1.3 | ThemeProvider + themeStore | 🔲 | - | - | |
| M2.1.4 | ThemeToggle | 🔲 | - | - | |
| M2.2.1 | MovieCard | 🔲 | - | - | blurhash + Framer Motion |
| M2.2.2 | MovieGrid + react-virtuoso | 🔲 | - | - | |
| M2.2.3 | API Service 层 | 🔲 | - | - | TanStack Query hooks |
| M2.2.4 | 对接后端 API | 🔲 | - | - | |
| M2.3.1 | SearchBar (cmdk) | 🔲 | - | - | |
| M2.3.2 | FilterPanel (Drawer) | 🔲 | - | - | |
| M2.3.3 | ActorSearch (cmdk) | 🔲 | - | - | |
| M2.3.4 | 各维度选择器 | 🔲 | - | - | Tag/Genre/Director/Studio |
| M2.3.5 | 范围滑块 | 🔲 | - | - | Year/Height/Age |
| M2.3.6 | CupSelector | 🔲 | - | - | |
| M2.3.7 | 评分/播放筛选 | 🔲 | - | - | |
| M2.3.8 | 排序选择器 | 🔲 | - | - | |
| M2.3.9 | filterStore 完整实现 | 🔲 | - | - | |
| M2.3.10 | SavedFilters | 🔲 | - | - | |
| M2.4.1 | BlurhashImage | 🔲 | - | - | |
| M2.4.2 | medium-zoom 集成 | 🔲 | - | - | |

### M3：视频播放器

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M3.1.1 | DPlayerWrapper | 🔲 | - | - | DPlayer React 封装 |
| M3.1.2 | VideoPlayer 容器 | 🔲 | - | - | Framer Motion 动画 |
| M3.1.3 | playerStore 集成 | 🔲 | - | - | |
| M3.2.1 | 播放记录 hook | 🔲 | - | - | |
| M3.2.2 | 结束记录 | 🔲 | - | - | |
| M3.2.3 | 进度保存 | 🔲 | - | - | |
| M3.2.4 | 续播提示 | 🔲 | - | - | |
| M3.3.1 | 键盘快捷键 | 🔲 | - | - | |
| M3.3.2 | 影片信息栏 | 🔲 | - | - | |
| M3.3.3 | 喜欢按钮 | 🔲 | - | - | |
| M3.3.4 | H.265 检测 | 🔲 | - | - | |

### M4：统计仪表盘

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M4.1.1 | StatsService 完成 | 🔲 | - | - | |
| M4.2.1 | StatCards | 🔲 | - | - | |
| M4.2.2 | TopChart | 🔲 | - | - | Recharts BarChart |
| M4.2.3 | TrendChart | 🔲 | - | - | Recharts LineChart |
| M4.2.4 | Heatmap | 🔲 | - | - | |
| M4.2.5 | statsService API hooks | 🔲 | - | - | |
| M4.2.6 | Dashboard 页面组装 | 🔲 | - | - | |

### M5：辅助功能

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M5.1.1 | SettingsViewer | 🔲 | - | - | RHF + Zod |
| M5.1.2 | 影片目录配置 | 🔲 | - | - | |
| M5.1.3 | NFO 扫描触发 | 🔲 | - | - | |
| M5.1.4 | 其他设置 | 🔲 | - | - | |
| M5.2.1 | MovieDetail 页面 | 🔲 | - | - | |
| M5.2.2 | 详情内容 | 🔲 | - | - | |
| M5.3.1 | sonner 配置 | 🔲 | - | - | |
| M5.3.2 | 操作反馈 | 🔲 | - | - | |

### M6：桌面壳 + 部署

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M6.1.1 | 托盘菜单 | 🔲 | - | - | |
| M6.1.2 | 启动流程 | 🔲 | - | - | |
| M6.1.3 | 进程管理 | 🔲 | - | - | |
| M6.2.1 | 前端构建配置 | 🔲 | - | - | |
| M6.2.2 | 后端发布配置 | 🔲 | - | - | |
| M6.2.3 | 打包脚本 | 🔲 | - | - | |
| M6.2.4 | 整体测试 | 🔲 | - | - | |

---

## 五、状态图例

| 符号 | 含义 |
|---|---|
| ✅ | 已完成 |
| 🔄 | 进行中 |
| 🔲 | 待开始 |
| ❌ | 已取消 |
| ⚠️ | 遇到阻塞 |
| ⏸️ | 暂停 |

---

## 六、问题/阻塞记录

| 日期 | ID | 问题描述 | 状态 | 解决方案 | 解决日期 |
|---|---|---|---|---|---|
| - | - | 暂无 | - | - | - |

---

## 七、决策记录

| 日期 | 决策 | 原因 |
|---|---|---|
| 2026-05-02 | 全面重写而非渐进式改造 | 旧项目技术栈过时（React 17, EF6, .NET 5），重写成本低于改造 |
| 2026-05-02 | 前端用 shadcn/ui 而非 Ant Design | 用户偏好 Tailwind 生态 |
| 2026-05-02 | 播放器用 DPlayer | 开源成熟，功能完整，支持浏览器内播放 |
| 2026-05-02 | 完全舍弃 PotPlayer | 用户决定浏览器内播放全覆盖 |
| 2026-05-02 | 状态管理用 Zustand | 轻量，比 Redux 更适合此规模项目 |
| 2026-05-02 | 保留 NFO 扫描入库机制 | 旧项目核心入库方式，无需改变 |

---

## 八、变更记录

| 日期 | 变更 | 修改人 |
|---|---|---|
| 2026-05-02 | 初始创建 | 用户 |
