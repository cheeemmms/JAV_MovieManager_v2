# 技术栈

> 目标项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
> 旧项目参考：`D:\Personal_file\VibeCoding\clone\JAV_MovieManager`

---

## 一、选型原则

1. 全面重写，不直接复用旧项目代码，但旧项目的业务逻辑（NFO扫描、爬虫、筛选SQL）可作为参考实现
2. 前端从 React 17 + Ant Design 4 升级到 React 18 + Tailwind CSS + shadcn/ui
3. 后端从 .NET 5 升级到 .NET 9 + EF Core 9
4. 完全舍弃 PotPlayer 依赖，改用浏览器内播放

---

## 二、前端技术栈

| 类别 | 选型 | 版本 | 用途 | 备注 |
|---|---|---|---|---|
| 框架 | React | 18.x | 核心框架 | 旧项目为 React 17 |
| 语言 | TypeScript | 5.x | 类型安全 | 旧项目为 JavaScript |
| 构建 | Vite | 5.x | 构建工具 | 旧项目为 Create React App |
| 样式 | Tailwind CSS | 3.x | 原子化CSS | 替代 Ant Design 样式体系 |
| UI组件 | shadcn/ui | latest | Button, Card, Dialog, Drawer, Slider, Checkbox, Separator, Command 等 | 基于 Radix UI 的 headless 组件 |
| 动画 | Framer Motion | 11.x | 页面过渡、卡片悬停、播放器展开/收起 | |
| 播放器 | DPlayer | latest | 浏览器内视频播放 | React Wrapper 封装，替代 PotPlayer |
| 图表 | Recharts | 2.x | 统计图表（柱状图、折线图） | |
| 数据请求 | TanStack Query | 5.x | API 数据获取、缓存、自动刷新 | 即 React Query v5 |
| 状态管理 | Zustand | 4.x | 全局状态管理（筛选、主题、播放器） | 轻量替代 Redux |
| 表单验证 | React Hook Form + Zod | 7.x / 3.x | 设置页面、手动入库表单 | shadcn/ui Form 组件集成 |
| Toast 通知 | sonner | latest | 操作反馈通知 | shadcn/ui 推荐搭配 |
| 虚拟滚动 | react-virtuoso | latest | 大量影片卡片虚拟滚动 | 千万级数据无压力 |
| 图片占位 | blurhash + react-blurhash | latest | 封面加载前模糊占位 | Plex/Jellyfin 风格 |
| 图片放大 | medium-zoom | latest | 海报点击放大查看 | |
| 搜索定位 | cmdk | latest | 演员/影片搜索定位 | shadcn/ui Command 组件底层 |
| 防抖 | use-debounce | latest | 搜索输入防抖 | |
| 时间处理 | date-fns | 3.x | 仪表盘时间计算、筛选时间范围 | shadcn/ui 依赖 |
| 路由 | react-router-dom | 6.x | 页面路由 | |

### 前端对比（旧 → 新）

| 维度 | 旧 (MovieManager.Web) | 新 (jav-manager-web) |
|---|---|---|
| 框架 | React 17 (JS) | React 18 (TS) |
| 构建 | Create React App | Vite |
| UI库 | Ant Design 4 | Tailwind + shadcn/ui |
| 状态 | 无（props 传递） | Zustand |
| 数据请求 | 手写 fetch | TanStack Query |
| 播放器 | 无（调用外部PotPlayer） | DPlayer 嵌入 |
| 筛选 | 侧边栏 CheckboxTree | 弹出面板 + cmdk |

### 前端依赖安装命令（供智能体参考）

```bash
npm create vite@latest jav-manager-web -- --template react-ts
cd jav-manager-web
npm install \
  tailwindcss @tailwindcss/vite \
  framer-motion \
  dplayer \
  recharts \
  @tanstack/react-query \
  zustand \
  react-hook-form zod @hookform/resolvers \
  sonner \
  react-virtuoso \
  blurhash react-blurhash \
  medium-zoom \
  cmdk \
  use-debounce \
  date-fns \
  react-router-dom
npx shadcn@latest init
```

---

## 三、后端技术栈

| 类别 | 选型 | 版本 | 用途 | 备注 |
|---|---|---|---|---|
| 框架 | ASP.NET Core Web API | .NET 9.0 | RESTful API 服务 | 旧项目为 .NET 5 |
| ORM | Entity Framework Core | 9.x | 数据访问 | 旧项目为 EF 6 (非Core) |
| 数据库 | SQLite | 3.x | 本地数据库文件 | 与旧项目相同 |
| 日志 | Serilog | latest | 结构化日志 | 与旧项目相同 |
| 视频流 | FileStreamResult | 内置 | 支持 HTTP Range 请求（206） | 新增 |
| CORS | ASP.NET Core 内置 | 内置 | 跨域支持 | |
| XML解析 | System.Xml.Linq | 内置 | NFO 文件解析 | 旧项目 XmlProcessor |

### 后端对比（旧 → 新）

| 维度 | 旧 (MovieManager.Endpoint) | 新 (jav-manager-api) |
|---|---|---|
| .NET版本 | .NET 5 | .NET 9 |
| EF版本 | EF 6 (非Core) | EF Core 9 |
| 启动方式 | Program.cs Main → CreateHostBuilder | 现代最小API风格 |
| 配置 | appsettings.json | appsettings.json |
| 项目结构 | 单层 Controllers | Controllers + Services 分层 |
| 视频流 | 无 | StreamController (Range支持) |
| 统计 | 无 | StatsController + StatsService |

### 旧项目关键参考文件（业务逻辑移植用）

以下文件在新项目中不需要直接复制，但业务逻辑需要参考：

| 旧文件 | 路径 | 新项目中对应 |
|---|---|---|
| FileScanner.cs | `MovieManager.BusinessLogic/FileScanner.cs` | FileScannerService.cs |
| MovieService.cs | `MovieManager.BusinessLogic/MovieService.cs` | MovieService.cs |
| ScrapeService.cs | `MovieManager.BusinessLogic/ScrapeService.cs` | 保留逻辑，升级 HTTP 客户端 |
| XmlProcessor.cs | `MovieManager.BusinessLogic/XmlProcessor.cs` | 直接移植 |
| DatabaseContext.cs | `MovieManager.Data/DatabaseContext.cs` | AppDbContext.cs (EF Core 重写) |
| MovieController.cs | `MovieManager.Endpoint/Controllers/MovieController.cs` | MoviesController.cs |
| Movie.cs | `MovieManager.ClassLibrary/Movie/Movie.cs` | Models/Movie.cs |

---

## 四、桌面壳技术栈

| 类别 | 选型 | 版本 | 用途 | 备注 |
|---|---|---|---|---|
| 框架 | WPF | .NET 9 | 系统托盘应用 | 与旧项目 TrayApp 同架构 |
| 功能 | 启动后端 Kestrel → 打开默认浏览器 | | 无窗口运行 | |

### 旧项目参考

| 旧文件 | 路径 | 说明 |
|---|---|---|
| MainWindow.xaml.cs | `MovieManager.TrayApp/MainWindow.xaml.cs` | 启动后隐藏主窗口 |
| App.xaml.cs | `MovieManager.TrayApp/App.xaml.cs` | 应用入口 |
| Program.cs | `MovieManager.Endpoint/Program.cs` | API 启动 + 端口检测 + 打开浏览器 |

---

## 五、不再使用的旧技术

| 技术 | 原因 |
|---|---|
| PotPlayer 便携版 | 改用浏览器内 DPlayer |
| PotPlayerService (.dpl 播放列表) | 不再需要外部播放器 |
| Ant Design 4 | 改用 Tailwind + shadcn/ui |
| react-checkbox-tree | 改用弹出面板 + cmdk |
| Entity Framework 6 (非Core) | 升级到 EF Core 9 |
| System.Data.SQLite (旧版) | 改用 EF Core SQLite Provider |
| Create React App | 改用 Vite |
| JavaScript (前端) | 改用 TypeScript |
| AviSynth 脚本 | 不再需要 |

---

## 六、变更记录

| 日期 | 变更 | 决策人 |
|---|---|---|
| 2026-05-02 | 初始创建，从 design-document.md 独立 | 用户 |
