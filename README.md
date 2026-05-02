# JAV MovieManager v2

JAV 影片管理器 —— 基于 React 18 + .NET 9 的全面重制版。

## Credits

本项目是 **JAV_MovieManager** 的深度重制版。

- **原项目**：`JAV_MovieManager`，基于 GPL v3 协议，使用 .NET 5 + React 17 构建
- **本重制版**：使用全新架构（React 18 + .NET 9 + EF Core 9 + Tailwind CSS + shadcn/ui）从零编写，未直接使用原项目代码
- 业务逻辑参考了原项目的 NFO 扫描、爬虫和筛选机制

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| 播放器 | DPlayer (浏览器内播放) |
| 状态管理 | Zustand |
| 数据请求 | TanStack Query |
| 图表 | Recharts |
| 后端 | .NET 9, ASP.NET Core Web API, EF Core 9, SQLite, Serilog |
| 桌面壳 | WPF TrayApp |

## 开发阶段

| 阶段 | 状态 |
|---|---|
| 阶段 A：产品设计 | ✅ 已完成 |
| 阶段 B：MVP 开发 | 🔲 待开始 |
| 阶段 C：增强功能 | 🔲 后续 |

## 项目结构

```
JAV_MovieManager_v2/
├── memory-bank/          # 设计文档
├── jav-manager-api/      # .NET 9 后端
├── jav-manager-web/      # React 前端
└── jav-manager-tray/     # WPF 托盘壳
```
