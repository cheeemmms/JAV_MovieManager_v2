# Debug 记录

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 本文档记录开发过程中遇到的问题及解决方案。

---

## 记录列表

| # | 日期 | 问题 | 严重度 | 状态 |
|---|---|---|---|---|
| 1 | 2026-05-03 | TrayApp 启动后浏览器无法连接 localhost:5000 | 🔴 阻塞 | ✅ 已解决 |
| 2 | 2026-05-03 | PublishSingleFile + Serilog 导致 API 启动崩溃 | 🔴 阻塞 | ✅ 已解决 |
| 3 | 2026-05-03 | 发布版 API 启动时 SQLite 无法创建数据库文件 | 🔴 阻塞 | ✅ 已解决 |
| 4 | 2026-05-03 | 设置页面一直转圈加载（React 19 + RHF watch() 不兼容） | 🔴 阻塞 | ✅ 已解决 |
| 5 | 2026-05-03 | 双击 TrayApp exe 无法启动（WPF PublishSingleFile DllNotFound） | 🔴 阻塞 | ✅ 已解决 |

---

## Debug #1：浏览器无法连接 localhost:5000

### 现象

运行 TrayApp 后浏览器成功弹出，但页面显示"拒绝连接"（ERR_CONNECTION_REFUSED）。

### 根因分析

共 3 个原因叠加导致：

1. **`dotnet run --urls` 参数传递无效** — `dotnet run` 不会自动将 `--urls` 转发给应用，必须使用 `--` 分隔符或环境变量
2. **`launchSettings.json` 覆盖端口** — `dotnet run` 默认读取 launchSettings 中的 `applicationUrl: http://localhost:5297`，导致 API 监听 5297 而非 5000
3. **`Program.cs` 无显式端口绑定** — 完全依赖命令行参数，而该参数未被正确传递

### 修复内容

| 文件 | 修改 |
|---|---|
| `jav-manager-tray/MainWindow.xaml.cs` | 1. 添加环境变量 `ASPNETCORE_URLS=http://localhost:5000` 到 ProcessStartInfo<br>2. `dotnet run` 参数改为 `--no-launch-profile` 禁用 launchSettings<br>3. 设置 `ASPNETCORE_ENVIRONMENT=Production` |
| `jav-manager-api/Program.cs` | 添加显式端口绑定：`app.Urls.Add(urls)`，从环境变量/appsettings 读取 |
| `jav-manager-api/appsettings.json` | 1. 新增 `ApiSettings.Urls: "http://localhost:5000"`<br>2. CORS 增加 `http://localhost:5000` |

### 验证方法

```bash
# 方式1：直接启动 API 验证端口
cd jav-manager-api
$env:ASPNETCORE_URLS="http://localhost:5000"
dotnet run --no-launch-profile
# 浏览器访问 http://localhost:5000 应显示前端页面

# 方式2：完整构建
powershell -ExecutionPolicy Bypass -File build.ps1
.\publish\jav-manager-tray.exe
```

---

## Debug #2：PublishSingleFile + Serilog 导致 API 启动崩溃

### 现象

修复端口问题后，运行发布版 `jav-manager-api.exe` 立即崩溃（退出码 -532462766），错误栈指向 `builder.Build()` 中 Serilog 的 DI 初始化。

### 根因分析

- `PublishSingleFile=true` + `PublishTrimmed=true` 将 Serilog 的部分运行时类型裁剪掉
- EF Core + MVC + Serilog 均不完全支持 IL trimming
- WPF 项目完全不支持 trimming（已单独处理）

### 修复内容

| 文件 | 修改 |
|---|---|
| `jav-manager-api/jav-manager-api.csproj` | 移除 `PublishTrimmed` 和 `TrimMode`（保留 `PublishSingleFile`）|
| `jav-manager-api/jav-manager-api.csproj` | 最终也移除了 `PublishSingleFile`，因为单文件模式下 Serilog 仍有 DI 解析问题 |

### 结论

- **TrayApp**：保留 `PublishSingleFile=true`（WPF 无 Serilog，无问题）
- **API**：不使用 `PublishSingleFile`，发布为普通目录（含 exe + dll + wwwroot）

---

## Debug #3：发布版 API 启动时 SQLite 无法创建数据库

### 现象

修复 Debug #2 后，API exe 启动时崩溃：`SQLite Error 14: 'unable to open database file'`。

### 根因分析

- 连接字符串 `Data Source=Data/jav-manager.db` 中路径是相对路径
- 发布版 API 的启动目录可能没有 `Data/` 子目录
- `EnsureCreated()` 尝试创建数据库但父目录 `Data/` 不存在

### 修复内容

| 文件 | 修改 |
|---|---|
| `jav-manager-api/Program.cs` | 在 `EnsureCreated()` 前添加自动创建 `Data/` 目录的逻辑 |

### 最终验证结果

- ✅ `http://localhost:5000/` → 200 OK（前端 index.html）
- ✅ `http://localhost:5000/api/movies` → 200 OK
- ✅ SQLite 数据库自动创建，所有表 + 索引正确创建

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，记录 Debug #1 |
| 2026-05-03 | 新增 Debug #2（PublishSingleFile + Serilog 崩溃）和 Debug #3（SQLite Data 目录） |
| 2026-05-03 | 新增 Debug #4（设置页面转圈 — React 19 + RHF watch() 兼容性问题） |

---

## Debug #4：设置页面一直转圈加载

### 现象

前端首页正常加载，但切换到 Settings 页面后一直显示加载动画（转圈），无法进入表单。

### 根因分析

- `SettingsViewer.tsx` 使用 `react-hook-form` 的 `watch()` 在 render 中订阅表单值变化
- React 19 中 `watch()` 的重渲染机制与 React 的并发特性冲突，导致组件无法稳定完成渲染
- `isLoading` 状态始终为 true，因为 TanStack Query 的 `useQuery` 在组件持续重渲染时无法正确报告加载完成
- progress.md 中 P5 问题已记录了该警告，但此前只添加了 `eslint-disable` 压制警告，未根本修复

### 修复内容

| 文件 | 修改 |
|---|---|
| `SettingsViewer.tsx` | 1. 移除 `watch()`，改用 `Controller` 组件 (`react-hook-form`)<br>2. `select` 元素用 `<Controller render>` 包裹<br>3. `Checkbox` 用 `<Controller render>` 包裹<br>4. 移除 `eslint-disable react-hooks/incompatible-library` |

### 关键代码变更

```tsx
// Before (有问题)
const dateRange = watch("dateRange")
const scrapeActorInfo = watch("scrapeActorInfo")
const forceUpdate = watch("forceUpdate")

<Checkbox checked={scrapeActorInfo} onCheckedChange={(c) => setValue(...)} />

// After (修复后)
import { Controller } from "react-hook-form"

<Controller name="scrapeActorInfo" control={control}
  render={({ field }) => (
    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
  )}
/>
```

### 验证结果

- ✅ tsc 0 错误
- ✅ eslint 0 错误 0 警告
- ✅ `/api/settings` → 200 OK |

---

## Debug #5：双击 TrayApp exe 无法启动

### 现象

双击 `publish/jav-manager-tray.exe` 后既没有系统托盘图标，也没有拉起浏览器，进程短暂出现后立即消失。

### 根因分析

- M6 为 TrayApp 配置了 `PublishSingleFile=true`
- **WPF 应用不支持 PublishSingleFile**：WPF 依赖大量原生 DLL（`WindowsBase`、`PresentationCore`、`PresentationFramework` 等），单文件模式下这些原生组件无法正确加载
- 错误信息：`System.DllNotFoundException` at `MS.Internal.WindowsBase.NativeMethodsSetLastError.SetWindowLongPtrWndProc`

### 修复内容

| 文件 | 修改 |
|---|---|
| `jav-manager-tray/jav-manager-tray.csproj` | 移除 `PublishSingleFile=true`，保留 `SelfContained=true` + `RuntimeIdentifier=win-x64` |

### 最终发布状态

| 项目 | PublishSingleFile | 原因 |
|---|---|---|
| jav-manager-tray | ❌ 不使用 | WPF 不兼容 |
| jav-manager-api | ❌ 不使用 | EF Core + Serilog 不兼容裁剪 |

### 验证结果

- ✅ TrayApp exe 正常启动 → 系统托盘图标出现
- ✅ API 自动启动在 `http://localhost:5000`
- ✅ 浏览器自动打开
- ✅ `http://localhost:5000/` → 200 OK

---

## 变更记录
