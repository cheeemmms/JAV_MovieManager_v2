# 🎬 JAV MovieManager v2

<p align="center">
  <img src="https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet" alt=".NET 9" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn/ui-latest-000000?style=flat-square&logo=shadcnui" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=flat-square" alt="GPL-3.0 License" />
</p>

<p align="center">
  <strong>一款内嵌网页播放器的现代化 JAV 影片管理器。</strong><br />
  全面重写 — .NET 9 + React 18 + Tailwind CSS + DPlayer。
</p>

---

> **本项目是对** [JAV_MovieManager](https://github.com/4evergaeul/JAV_MovieManager)（作者 [@4evergaeul](https://github.com/4evergaeul)）**的全面重写**。原项目基于 .NET 5 + React 17 + Ant Design 4 构建，依赖 PotPlayer 进行外部播放。v2 将整个技术栈重写为 .NET 9 + React 18 + TypeScript + Tailwind CSS + shadcn/ui，用内嵌 DPlayer 替代了 PotPlayer，实现浏览器内视频播放。

---

## ⚠️ 免责声明

本软件用于管理和浏览存储在本地文件系统上的**合法获取的**成人影片合集。使用本软件即表示您知晓：

- 本应用管理的所有媒体文件均存储在**您自己的本地电脑**上。
- 您需自行确保所管理的内容符合所在司法管辖区的所有适用法律。
- 本项目**不提供、不分发、不链接任何受版权保护的内容或成人内容**。
- 开发者对任何滥用本软件的行为概不负责。

---

## 🤖 AI 创作声明

本项目在**AI 编程助手**的辅助下完成开发，涵盖架构设计、代码生成、调试及部署脚本等全生命周期。所有 AI 生成的代码均经人工开发者审查、测试并确认后方才提交至仓库。

---

## ✨ 功能特性

### 📀 媒体库
- **虚拟滚动网格** — 流畅 60fps 浏览数千部影片（react-virtuoso）
- **Blurhash 占位图** — Plex/Jellyfin 风格的模糊加载效果
- **响应式列数** — 2–6 列自适应窗口宽度
- **悬停预览** — Framer Motion 动画覆盖层，含播放按钮和元数据

### 🔍 高级筛选
- **多维筛选** — 演员、类型、标签、导演、片商、罩杯
- **范围滑块** — 按发行年份、演员身高、演员年龄筛选
- **评分 & 播放次数** — 查找观看最多或评分最高的内容
- **AND/OR 模式** — 切换交集/并集匹配
- **保存筛选方案** — 保存和加载常用筛选组合
- **右侧面板推入** — 筛选面板推挤内容而非覆盖

### 🎥 内嵌视频播放器
- **DPlayer 整合** — 全功能 HTML5 播放器，H.265/HEVC 检测
- **键盘快捷键** — 空格（播放/暂停）、←→（快进快退）、F（全屏）、Esc（返回）
- **字幕支持** — 自动检测 `.srt` / `.ass` / `.vtt` 文件（UTF-8 自动转码）
- **播放历史** — 记录观看时长、进度和完成百分比
- **续播提示** — 从上次退出的位置继续观看
- **同女优推荐** — 在播放器中向下滚动查看同女优的其他影片

### 📊 统计仪表盘
- **概览卡片** — 影片总数、总观看时长、女优数量、平均评分
- **排行榜** — 观看最多的演员/类型/片商（Recharts 柱状图）
- **30 天趋势** — 每日播放活动（Recharts 折线图）
- **GitHub 风格热力图** — 全年播放活动可视化

### 👤 演员浏览
- **照片网格** — 使用本地照片浏览演员
- **点击筛选** — 点击任意演员即可按该演员筛选媒体库
- **身体数据** — 身高、罩杯、三围及来自爬虫的评分数据

### 🎨 用户体验
- **三种主题模式** — 浅色、深色、跟随系统
- **随机播放** — Fisher-Yates 洗牌算法遍历全部收藏
- **Toast 通知** — 非侵入式操作反馈
- **滚动位置恢复** — 浏览器后退按钮回到之前浏览位置

### ⚙️ 后端
- **NFO 元数据扫描** — 从已有 `.nfo` 文件导入影片
- **演员信息爬取** — 自动获取演员资料和身体数据
- **SQLite 数据库** — 零配置、单文件数据库
- **HTTP Range 流传输** — 高效的视频流播放（支持拖拽进度条）

---

## 🚀 快速开始（面向用户）

### 前置要求
- Windows 10/11（x64）
- 按 `.nfo` 元数据文件组织的影片目录
- 网页浏览器（推荐 Chrome、Edge 或 Firefox）

### 安装

1. 从 [Releases](https://github.com/cheeemmms/JAV_MovieManager_v2/releases) 下载最新的 `publish.zip`
2. 解压到任意文件夹（如 `D:\JAV_MovieManager\`）
3. 双击 `jav-manager-tray.exe`
4. 程序将出现在系统托盘中，并自动打开默认浏览器

### 首次配置

1. 浏览器中打开 `http://localhost:5000`
2. 点击导航栏中的 **Settings（设置）**
3. 输入您的**影片目录路径**（即 `.nfo` 文件所在位置）
4. 点击 **Scan（扫描）** 导入媒体库
5. 等待扫描完成 — 您的影片将出现在首页

### 端口配置

默认端口为 `5000`。如需更改，编辑 `api/appsettings.json`：

```json
{
  "ApiSettings": {
    "Urls": "http://localhost:5000"
  }
}
```

---

## 🔄 软件更新（面向用户）

新版本发布时，请按以下步骤更新，同时保留数据库和设置：

1. **关闭应用** — 右键托盘图标 → Exit
2. **下载**新版 zip 文件（从 [Releases](https://github.com/cheeemmms/JAV_MovieManager_v2/releases) 页面）
3. **解压**到**单独临时文件夹**（如 `D:\temp\jav-manager-new\`）
4. 在当前安装目录**打开 PowerShell**（Shift+右键 → "在此处打开 PowerShell 窗口"）
5. 运行更新脚本：
   ```powershell
   powershell -ExecutionPolicy Bypass -File update.ps1 -NewVersionPath D:\temp\jav-manager-new
   ```
6. 提示时输入 `yes` 确认
7. 重启 `jav-manager-tray.exe`

脚本会自动保留 `api\Data\`（数据库）和 `api\Logs\`（日志）目录。

### 重置数据库

如需从头开始（删除所有影片、历史记录和设置）：

```powershell
# 先关闭应用
Remove-Item publish\api\Data\jav-manager.db
# 重启 — 将自动创建空白数据库
```

---

## 🛠 开发环境搭建

### 前置要求
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)（Node.js 自带）

### 克隆与安装

```bash
git clone https://github.com/cheeemmms/JAV_MovieManager_v2.git
cd JAV_MovieManager_v2

# 安装前端依赖
cd jav-manager-web
npm install

# 回到项目根目录
cd ..
```

### 开发模式

在两个终端中同时运行后端和前端：

```bash
# 终端 1：启动 API
cd jav-manager-api
dotnet run --launch-profile http

# 终端 2：启动开发服务器
cd jav-manager-web
npm run dev
```

然后在浏览器打开 `http://localhost:5173`。Vite 开发服务器会自动将 API 请求代理到后端。

### 生产构建

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

输出在 `publish/` 目录：

```
publish/
├── jav-manager-tray.exe     # 桌面托盘程序
├── update.ps1               # 用户更新脚本
└── api/
    ├── jav-manager-api.exe  # 后端服务器
    ├── wwwroot/             # 前端静态文件
    ├── *.dll                # .NET 程序集
    ├── Data/                # SQLite 数据库（更新时保留）
    └── Logs/                # Serilog 日志（更新时保留）
```

### 代码质量检查

```bash
# 前端类型检查
cd jav-manager-web
npx tsc --noEmit
npx eslint src/

# 后端编译检查
cd jav-manager-api
dotnet build
```

---

## 📁 项目结构

```
JAV_MovieManager_v2/
├── jav-manager-api/           # .NET 9 后端
│   ├── Controllers/           # REST API 端点
│   ├── Services/              # 业务逻辑
│   ├── Models/                # 实体模型与 DTO
│   ├── Data/                  # EF Core DbContext 与迁移
│   └── Program.cs             # 应用入口
│
├── jav-manager-web/           # React 18 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   │   ├── movies/        # MovieGrid, MovieCard, MovieDetail
│   │   │   ├── player/        # VideoPlayer, DPlayerWrapper
│   │   │   ├── filter/        # FilterPanel, ActorSearch, SavedFilters
│   │   │   ├── dashboard/     # StatCards, TopChart, TrendChart, Heatmap
│   │   │   ├── settings/      # SettingsViewer
│   │   │   ├── actors/        # ActorGrid
│   │   │   ├── layout/        # AppLayout, Navbar
│   │   │   └── ui/            # shadcn/ui 基础组件
│   │   ├── services/          # API hooks（TanStack Query）
│   │   ├── stores/            # Zustand 状态管理
│   │   ├── hooks/             # 自定义 React hooks
│   │   └── types/             # TypeScript 类型定义
│   └── vite.config.ts
│
├── jav-manager-tray/          # WPF 系统托盘程序
│   └── MainWindow.xaml.cs     # 托盘图标 + API 生命周期管理
│
├── build.ps1                  # 一键生产构建脚本
├── update.ps1                 # 用户端更新脚本
└── memory-bank/               # 开发文档
    ├── design-document.md
    ├── architecture.md
    ├── tech-stack.md
    └── Maintenance/           # 问题跟踪
```

---

## 🗄️ 数据库

项目使用单文件 SQLite 数据库，位于 `publish/api/Data/jav-manager.db`。

### 核心表
| 表 | 说明 |
|---|---|
| `Movies` | 影片元数据（标题、年份、海报、文件路径） |
| `Actors` | 演员资料（身体数据、评分） |
| `Genres` / `Tags` | 分类标签 |
| `MovieActors` / `MovieGenres` / `MovieTags` | 多对多关联 |
| `PlaybackHistory` | 播放历史（开始时间、时长、完成百分比） |
| `UserSettings` | 键值对应用设置 |

### 数据库结构变更

当前使用 `EnsureCreated()` — 如果数据库文件已存在则直接使用。未来结构变更将使用 EF Core Migrations：

```bash
cd jav-manager-api
dotnet ef migrations add MigrationName
dotnet ef database update
```

---

## ⚠️ 已知问题

- **浏览器返回按钮** — 滚动位置恢复到大致位置，可能偏差 1-2 行
- **H.265/HEVC** — 部分浏览器（尤其是 Windows 上的 Chromium 系）可能不支持 HEVC 硬件解码。检测到不支持会显示警告横幅

---

## 📄 许可证

本项目基于 **GNU General Public License v3.0** 授权。详见 [LICENSE](LICENSE)。

原始项目 [JAV_MovieManager](https://github.com/4evergaeul/JAV_MovieManager) 由 [@4evergaeul](https://github.com/4evergaeul) 创作。

---

<p align="center">
  <sub>Built with ❤️ (and a lot of AI assistance) in 2026</sub>
</p>
