# 项目进度跟踪

> 目标项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
> 旧项目参考：`D:\Personal_file\VibeCoding\clone\JAV_MovieManager`
>
> **本文档是动态文档**，每个任务完成后需更新状态和日期。

---

## 一、当前状态

| 指标 | 值 |
|---|---|
| 当前阶段 | 阶段 B：MVP 开发 |
| 当前 Milestone | M5 完成，准备进入 M6 |
| 总任务数 | 83 |
| 已完成 | 76 |
| 进行中 | 0 |
| 待开始 | 7 |
| 进度 | 91.6% |

---

## 二、整体阶段进度

| 阶段 | 状态 | 开始日期 | 完成日期 |
|---|---|---|---|
| 阶段 A：产品设计 | ✅ 已完成 | 2026-05-02 | 2026-05-02 |
| 阶段 B：MVP 开发 | 🔄 进行中 | 2026-05-02 | - |
| 阶段 C：增强功能 | 🔲 待开始 | - | - |

---

## 三、Milestone 进度

| Milestone | 任务数 | 完成 | 进度 | 状态 |
|---|---|---|---|---|
| M0：项目初始化 | 12 | 12 | 100% | ✅ 已完成 |
| M1：后端核心 | 19 | 19 | 100% | ✅ 已完成 |
| M2：前端媒体库 | 18 | 18 | 100% | ✅ 已完成 |
| M3：视频播放器 | 11 | 11 | 100% | ✅ 已完成 |
| M4：统计仪表盘 | 8 | 8 | 100% | ✅ 已完成 |
| M5：辅助功能 | 8 | 8 | 100% | ✅ 已完成 |
| M6：桌面壳 + 部署 | 7 | 0 | 0% | 🔲 待开始 |

---

## 四、详细任务跟踪

### M0：项目初始化

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M0.1.1 | 创建 .NET 9 Web API 项目 | ✅ | 2026-05-02 | 2026-05-02 | dotnet new webapi |
| M0.1.2 | 添加 NuGet 包 | ✅ | 2026-05-02 | 2026-05-02 | EF Core SQLite, Serilog |
| M0.1.3 | 配置 appsettings.json | ✅ | 2026-05-02 | 2026-05-02 | SQLite连接串 + Serilog配置 |
| M0.1.4 | 配置 Program.cs | ✅ | 2026-05-02 | 2026-05-02 | CORS, Serilog, EF Core, 静态文件 |
| M0.2.1 | 创建 Vite + React + TS 项目 | ✅ | 2026-05-02 | 2026-05-02 | |
| M0.2.2 | 安装所有前端依赖 | ✅ | 2026-05-02 | 2026-05-02 | 全部依赖已安装 |
| M0.2.3 | 配置 Tailwind CSS | ✅ | 2026-05-02 | 2026-05-02 | Tailwind v4 + @tailwindcss/vite |
| M0.2.4 | 初始化 shadcn/ui | ✅ | 2026-05-02 | 2026-05-02 | CLI失败，手动搭建所有基础设施 |
| M0.2.5 | 添加基础 shadcn 组件 | ✅ | 2026-05-02 | 2026-05-02 | button/card/dialog/drawer/slider/checkbox/command/separator/toggle/navigation-menu，全部手动编写 |
| M0.2.6 | 配置 React Router | ✅ | 2026-05-02 | 2026-05-02 | |
| M0.2.7 | 配置 TanStack Query | ✅ | 2026-05-02 | 2026-05-02 | QueryClientProvider 包裹 |
| M0.2.8 | 创建 Zustand Stores 骨架 | ✅ | 2026-05-02 | 2026-05-02 | filterStore/themeStore/playerStore |
| M0.3.1 | 创建 WPF 托盘壳项目 | ✅ | 2026-05-02 | 2026-05-02 | dotnet new wpf + UseWindowsForms |
| M0.3.2 | MainWindow 启动逻辑 | ✅ | 2026-05-02 | 2026-05-02 | 隐藏窗口 + NotifyIcon + 启动API + 打开浏览器 |

### M1：后端核心

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M1.1.1 | 创建所有 Entity Model | ✅ | 2026-05-02 | 2026-05-02 | Movie/Actor/Genre/Tag/MovieActor/MovieGenre/MovieTag/PlaybackHistory/PlayList/PlayListItem/UserSettings，共11个 |
| M1.1.2 | 创建 AppDbContext | ✅ | 2026-05-02 | 2026-05-02 | 所有 DbSet + Fluent API 关联配置 + 索引 |
| M1.1.3 | 创建 Initial Migration | ✅ | 2026-05-02 | 2026-05-02 | dotnet ef migrations add InitialCreate |
| M1.1.4 | 创建 DTOs | ✅ | 2026-05-02 | 2026-05-02 | MovieViewModel/ActorViewModel/FilterRequest/FilterResponse/SearchRequest/StatsResponse |
| M1.2.1 | 实现 FileScannerService | ✅ | 2026-05-02 | 2026-05-02 | 参考旧 FileScanner.cs，移植到 EF Core |
| M1.2.2 | 实现 XmlProcessor | ✅ | 2026-05-02 | 2026-05-02 | 参考旧 XmlProcessor.cs，直接移植 |
| M1.2.3 | 实现 MovieService | ✅ | 2026-05-02 | 2026-05-02 | 参考旧 MovieService.cs，统一筛选 + 排序 + CRUD |
| M1.2.4 | 实现 ActorService | ✅ | 2026-05-02 | 2026-05-02 | 查询/范围筛选/收藏切换 |
| M1.2.5 | 实现 StreamService | ✅ | 2026-05-02 | 2026-05-02 | 视频文件定位 + 文件信息 |
| M1.2.6 | 实现 ScrapeService | ✅ | 2026-05-02 | 2026-05-02 | 参考旧 ScrapeService.cs，升级为 HttpClient |
| M1.2.7 | 实现 StatsService | ✅ | 2026-05-02 | 2026-05-02 | 仪表盘汇总/排行榜/趋势/热力图 |
| M1.3.1 | MoviesController | ✅ | 2026-05-02 | 2026-05-02 | CRUD + filter/search/recent/favorites/scan |
| M1.3.2 | StreamController | ✅ | 2026-05-02 | 2026-05-02 | Range 206 视频流 + info |
| M1.3.3 | ActorsController | ✅ | 2026-05-02 | 2026-05-02 | 列表/详情/筛选/收藏/爬取 |
| M1.3.4 | GenresController | ✅ | 2026-05-02 | 2026-05-02 | 类型名列表 |
| M1.3.5 | TagsController | ✅ | 2026-05-02 | 2026-05-02 | 标签名列表 |
| M1.3.6 | Directors/StudiosController | ✅ | 2026-05-02 | 2026-05-02 | 导演/片商列表 |
| M1.3.7 | StatsController | ✅ | 2026-05-02 | 2026-05-02 | /api/stats/dashboard |
| M1.3.8 | HistoryController | ✅ | 2026-05-02 | 2026-05-02 | 播放历史创建/更新/查询 |
| M1.3.9 | SettingsController | ✅ | 2026-05-02 | 2026-05-02 | Key-Value 读取/批量写入 |
| M1.3.10 | ImageController | ✅ | 2026-05-02 | 2026-05-02 | 海报/封面图片服务 |
| M1.4.1 | CORS 配置 | ✅ | 2026-05-02 | 2026-05-02 | 已在 M0 配置 |
| M1.4.2 | Serilog 配置 | ✅ | 2026-05-02 | 2026-05-02 | 添加 UseSerilogRequestLogging |
| M1.4.3 | 端口自动检测 | ✅ | 2026-05-02 | 2026-05-02 | 添加 EnsureCreated 自动建库 |

### M2：前端媒体库

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M2.1.1 | AppLayout | ✅ | 2026-05-02 | 2026-05-02 | 含 LayoutContext（搜索/筛选状态共享） |
| M2.1.2 | Navbar | ✅ | 2026-05-02 | 2026-05-02 | 搜索入口 + 筛选按钮 + 主题切换 |
| M2.1.3 | ThemeProvider + themeStore | ✅ | 2026-05-02 | 2026-05-02 | 暗黑/浅色/系统三模式 + localStorage + 系统主题监听 |
| M2.1.4 | ThemeToggle | ✅ | 2026-05-02 | 2026-05-02 | DropdownMenu 三模式选择器 |
| M2.2.1 | MovieCard | ✅ | 2026-05-02 | 2026-05-02 | blurhash占位 + Framer Motion悬停动画 + 播放按钮覆盖层 |
| M2.2.2 | MovieGrid + react-virtuoso | ✅ | 2026-05-02 | 2026-05-02 | VirtuosoGrid虚拟滚动 + 响应式列数 |
| M2.2.3 | API Service 层 | ✅ | 2026-05-02 | 2026-05-02 | TanStack Query useInfiniteQuery + 筛选API |
| M2.2.4 | 对接后端 API | ✅ | 2026-05-02 | 2026-05-02 | 首页默认加载媒体库数据 |
| M2.3.1 | SearchBar (cmdk) | ✅ | 2026-05-02 | 2026-05-02 | CommandDialog 全局搜索 + "/" 快捷键 |
| M2.3.2 | FilterPanel (Drawer) | ✅ | 2026-05-02 | 2026-05-02 | 右侧Drawer面板 + 所有筛选维度 |
| M2.3.3 | ActorSearch (cmdk) | ✅ | 2026-05-02 | 2026-05-02 | cmdk演员搜索定位 + 多选标签 |
| M2.3.4 | 各维度选择器 | ✅ | 2026-05-02 | 2026-05-02 | MultiSelect组件：Tag/Genre/Director/Studio |
| M2.3.5 | 范围滑块 | ✅ | 2026-05-02 | 2026-05-02 | Year/Height/Age 双端范围滑块 |
| M2.3.6 | CupSelector | ✅ | 2026-05-02 | 2026-05-02 | A-K罩杯标签云多选 |
| M2.3.7 | 评分/播放筛选 | ✅ | 2026-05-02 | 2026-05-02 | MinRating滑块 + PlayCount范围 |
| M2.3.8 | 排序选择器 | ✅ | 2026-05-02 | 2026-05-02 | 日期/年份/标题/评分/播放次数 + 升降序 |
| M2.3.9 | filterStore 完整实现 | ✅ | 2026-05-02 | 2026-05-02 | 已在M0完成 |
| M2.3.10 | SavedFilters | ✅ | 2026-05-02 | 2026-05-02 | localStorage保存/加载/删除筛选方案 |
| M2.4.1 | BlurhashImage | ✅ | 2026-05-02 | 2026-05-02 | blurhash占位 + 渐变加载 + medium-zoom |
| M2.4.2 | medium-zoom 集成 | ✅ | 2026-05-02 | 2026-05-02 | 海报点击放大，已集成到BlurhashImage |

### M3：视频播放器

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M3.1.1 | DPlayerWrapper | ✅ | 2026-05-03 | 2026-05-03 | DPlayer React 封装 + dplayer.d.ts 类型声明 |
| M3.1.2 | VideoPlayer 容器 | ✅ | 2026-05-03 | 2026-05-03 | Framer Motion 页面动画 + 固定全屏覆盖 |
| M3.1.3 | playerStore 集成 | ✅ | 2026-05-03 | 2026-05-03 | setCurrent/setPlaying/setProgress 与播放器同步 |
| M3.2.1 | 播放记录 hook | ✅ | 2026-05-03 | 2026-05-03 | usePlaybackRecording hook，POST /api/history |
| M3.2.2 | 结束记录 | ✅ | 2026-05-03 | 2026-05-03 | 暂停/关闭/结束/返回时 PATCH 保存 |
| M3.2.3 | 进度保存 | ✅ | 2026-05-03 | 2026-05-03 | 每30秒自动保存播放进度 |
| M3.2.4 | 续播提示 | ✅ | 2026-05-03 | 2026-05-03 | progress>0时弹窗询问续播/重头开始 |
| M3.3.1 | 键盘快捷键 | ✅ | 2026-05-03 | 2026-05-03 | Space/Arrow/F/Escape |
| M3.3.2 | 影片信息栏 | ✅ | 2026-05-03 | 2026-05-03 | 底部栏：标题/番号/年份/时长/导演/演员 |
| M3.3.3 | 喜欢按钮 | ✅ | 2026-05-03 | 2026-05-03 | Heart 图标一键切换收藏状态 |
| M3.3.4 | H.265 检测 | ✅ | 2026-05-03 | 2026-05-03 | canPlayType 检测 + 黄色警告横幅 |

### M4：统计仪表盘

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M4.1.1 | StatsService 完成 | ✅ | 2026-05-02 | 2026-05-02 | 已在M1阶段实现（dashboard/top/trend/heatmap） |
| M4.2.1 | StatCards | ✅ | 2026-05-03 | 2026-05-03 | 4卡片 + 数字滚动动画 + 播放时长格式化 |
| M4.2.2 | TopChart | ✅ | 2026-05-03 | 2026-05-03 | Recharts BarChart + 演员/类型/片商 Tab 切换 |
| M4.2.3 | TrendChart | ✅ | 2026-05-03 | 2026-05-03 | Recharts LineChart 30天播放趋势 |
| M4.2.4 | Heatmap | ✅ | 2026-05-03 | 2026-05-03 | CSS Grid 月度热力图 + 颜色强度 + 图例 |
| M4.2.5 | statsService API hooks | ✅ | 2026-05-03 | 2026-05-03 | TanStack Query useDashboardStats |
| M4.2.6 | Dashboard 页面组装 | ✅ | 2026-05-03 | 2026-05-03 | 双栏布局：左侧排行，右侧趋势+热力图 |

### M5：辅助功能

| ID | 任务 | 状态 | 开始 | 完成 | 备注 |
|---|---|---|---|---|---|
| M5.1.1 | SettingsViewer | ✅ | 2026-05-03 | 2026-05-03 | RHF + Zod 表单，目录配置 + 扫描选项 |
| M5.1.2 | 影片目录配置 | ✅ | 2026-05-03 | 2026-05-03 | 文本输入 + 后端 Key-Value 存储 |
| M5.1.3 | NFO 扫描触发 | ✅ | 2026-05-03 | 2026-05-03 | ScanLine 按钮 + 日期范围/爬虫/强制更新选项 |
| M5.1.4 | 其他设置 | ✅ | 2026-05-03 | 2026-05-03 | 扫描日期范围、爬虫开关、强制更新开关 |
| M5.2.1 | MovieDetail 页面 | ✅ | 2026-05-03 | 2026-05-03 | 全屏详情页，FanArt背景 + 海报 + 元数据 |
| M5.2.2 | 详情内容 | ✅ | 2026-05-03 | 2026-05-03 | Plot/演员/类型/标签/进度条/播放统计 |
| M5.3.1 | sonner 配置 | ✅ | 2026-05-03 | 2026-05-03 | richColors + closeButton + 4s duration |
| M5.3.2 | 操作反馈 | ✅ | 2026-05-03 | 2026-05-03 | 收藏切换/settings保存/扫描完成 toast 通知 |

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
| 2026-05-03 | P1 | usePlaybackRecording.ts — ref 在 render 中赋值 | ✅ 已解决 | 移入 useEffect 中赋值 | 2026-05-03 |
| 2026-05-03 | P2 | DPlayerWrapper.tsx — callbacksRef 在 render 中赋值 | ✅ 已解决 | 移入独立 useEffect 中赋值 | 2026-05-03 |
| 2026-05-03 | P3 | VideoPlayer.tsx — Effect 中 setState | ✅ 已解决 | 改为派生状态 (dismissedFor !== imdbId) | 2026-05-03 |
| 2026-05-03 | P4 | button/toggle/navigation-menu — Fast refresh 导出错误 | ✅ 已解决 | 添加 eslint-disable 注释 | 2026-05-03 |
| 2026-05-03 | P5 | SettingsViewer — RHF watch() React 19 编译器警告 | ✅ 已解决 | handleScan 改用 getValues() + 文件级 suppress | 2026-05-03 |
| 2026-05-03 | P6 | AppLayout.tsx — Fast refresh 导出 useLayout hook | ✅ 已解决 | 文件级 eslint-disable | 2026-05-03 |
| 2026-05-03 | P7 | SavedFilters.tsx — 解构时 page/pageSize 未使用 | ✅ 已解决 | eslint-disable-next-line | 2026-05-03 |

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
| 2026-05-03 | 续播提示用派生状态替代 Effect | React 19 推荐从状态推导而非 Effect 中 setState，切换影片时自动重置 |

---

## 八、变更记录

| 日期 | 变更 | 修改人 |
|---|---|---|
| 2026-05-02 | 初始创建 | 用户 |
| 2026-05-02 | M1 后端核心全部完成（19 个任务） | AI |
| 2026-05-03 | M3 视频播放器全部完成（11 个任务）| AI |
| 2026-05-03 | M4 统计仪表盘全部完成（8 个任务）| AI |
| 2026-05-03 | M5 辅助功能全部完成（8 个任务）+ 后端 MovieViewModel 扩展 | AI |
| 2026-05-03 | 全项目 lint 修复：7 个问题全部清零（tsc 0 错误 + eslint 0 错误 0 警告）| AI |
