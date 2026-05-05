# 维护进度跟踪

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> **本文角色**：跟踪**实施进度**。每个任务的状态、时间线、依赖关系均在此文件。是三个文档中最频繁更新的文件。
>
> 配套文件：
> - 🐛 [issues.md](./issues.md) — 问题清单（Bug、需求、安全模型、攻击场景）
> - 📐 [plans.md](./plans.md) — 实施方案（代码级详细方案，供 LLM 执行用）

---

## 目录

- [一、整体阶段进度](#一整体阶段进度)
- [二、阶段 C：增强功能 ✅](#二阶段-c增强功能-)
- [三、阶段 D：UX 增强 ✅](#三阶段-dux-增强-)
- [四、阶段 E：修复与增强 ✅](#四阶段-e修复与增强-)
- [五、阶段 F：回归修复 + 新功能](#五阶段-f回归修复--新功能)
- [六、阶段 G：Remote Access（手机浏览器远程访问）🔲](#六阶段-gremote-access手机浏览器远程访问)
- [七、状态图例](#七状态图例)
- [变更记录](#变更记录)

---

## 一、整体阶段进度

| 阶段 | 状态 | 开始日期 | 完成日期 |
|---|---|---|---|
| 阶段 C：增强功能 | ✅ 已完成 | 2026-05-03 | 2026-05-03 |
| 阶段 D：UX 增强 | ✅ 已完成 | 2026-05-03 | 2026-05-03 |
| 阶段 E：修复与增强 | ✅ 已完成 | 2026-05-03 | 2026-05-03 |
| 阶段 F：回归修复 + 新功能 | 🔄 回归 | 2026-05-03 | — |
| 阶段 G：Remote Access | ✅ 已完成 | 2026-05-05 | 2026-05-05 |

---

## 二、阶段 C：增强功能 ✅

| # | 项目 | 文件 | 状态 |
|---|---|---|---|
| C.1.1 | B01 白屏 — DPlayerWrapper 移除手动 off | DPlayerWrapper.tsx | ✅ |
| C.1.2 | 页面居中 — 4 页面统一 max-w-[1400px] | 4 文件 | ✅ |
| C.1.3 | Tags 可点击 — MovieDetail 5 区域点击跳转 | MovieDetail.tsx | ✅ |
| C.1.4 | Dashboard Top Movies — 后端+前端 | 4 文件 | ✅ |
| C.2.1 | 演员头像 — ImageController + Settings + ActorGrid | 3 文件 | ✅ |
| C.2.2 | 筛选面板重设计 — 分组折叠 + Tab 切换 | FilterPanel.tsx | ✅ |

---

## 三、阶段 D：UX 增强 ✅

| 顺序 | # | 项目 | 文件 | 状态 |
|---|---|---|---|---|
| 1 | D01 | Logo 清除筛选回首页 | Navbar.tsx | ✅ |
| 2 | D03 | 一排 6 列海报 | MovieGrid.tsx | ✅ |
| 3 | D04 | 详情页主图改为 fanart | MovieDetail.tsx | ✅ |
| 4 | D05 | 筛选面板右侧推入 | AppLayout + FilterPanel | ✅ |
| 5 | D02 | 筛选激活 tag 条 | ActiveFiltersBar + AppLayout | ✅ |

**依赖**：D01/D03/D04 独立，D05 是核心架构改动，D02 依赖 D05。全部已完成 ✅

### 阶段 D 补充修复

| # | 项目 | 文件 | 状态 |
|---|---|---|---|
| D06 | medium-zoom bug — 移除 zoomable + 恢复 poster + 布局重构 | MovieDetail.tsx | ✅ |
| D07 | 详情页磁吸双区域 — snap-scroll + 大海报(fanart) + Synopsis | MovieDetail.tsx | ✅ |

**D06 说明**：移除 `zoomable` 属性杜绝 medium-zoom DOM 残留导致海报白屏/主页残留；主图从 fanart 改回 poster（aspect-[2/3] + 阴影悬浮）；Play 按钮加宽；Tags/Genres 浅色背景 + hover 上浮效果。

**D07 说明**：`snap-y snap-mandatory` 双区域布局。区域一 Hero（min-h-screen，模糊背景铺满全屏）；下滑磁吸进入区域二（大海报 fanart max-w-xl + Synopsis 下方居中），`whileInView` 淡入动画。

---

## 四、阶段 E：修复与增强 ✅

| 顺序 | # | 项目 | 文件 | 状态 |
|---|---|---|---|---|
| 1 | E01 | Actor 头像 URL 修复（单复数匹配） | ActorGrid.tsx | ✅ |
| 2 | E04 | 过度滚动修复（overscroll-behavior） | index.css | ✅ |
| 3 | E05 | Actor 点击跳转后回到顶部 | ActorGrid.tsx | ✅ |
| 4 | E02 | 随机播放按钮（Fisher-Yates 洗牌） | Navbar + shuffleStore | ✅ |
| 5 | E03 | Heatmap GitHub 风格改版（按天聚合） | StatsService + Heatmap | ✅ |
| 6 | E06 | 主页返回保持滚动位置 | MovieGrid.tsx | ✅ |

**依赖**：E01/E04/E05 独立（P0，一行修复）；E02 独立（P1，新组件）；E03 需前后端联动（P1）；E06 最复杂（P2，需区分浏览器返回/导航点击）。

### E01：Actor 头像 URL 修复

前端 `/images/actor/` → `/image/actor/`（后端路由为 `ImageController` → `/api/image/actor/`）。

### E02：随机播放按钮

Navbar 右侧 + `ShuffleIcon`，Fisher-Yates 洗牌全部影片 ID → sessionStorage → 循环取下一个。

### E03：Heatmap GitHub 风格

后端 `StatsService` 新增按天聚合（365 天），前端 `Heatmap.tsx` 重写为 7 行 × N 列绿色方格网格。

### E04：过度滚动修复

`index.css` 添加 `html { overscroll-behavior-y: none; }`。

### E05：Actor 点击跳转回顶部

`handleActorClick` 中 `navigate` 前 `window.scrollTo(0, 0)`。

### E06：主页返回保持滚动位置

sessionStorage 保存 VirtuosoGrid 滚动位置。`history.action === "POP"` 恢复位置，`"PUSH"` 从顶部开始。

---

## 五、阶段 F：回归修复 + 新功能

| 顺序 | # | 项目 | 文件 | 状态 |
|---|---|---|---|---|
| 1 | F01 | Settings 保存失败修复（连锁修复头像 204） | SettingsController.cs | ✅ |
| 2 | F02 | 过度滚动强化修复 | index.css | ✅ |
| 3 | F03 | 浏览器返回位置恢复修复 | MovieGrid.tsx | ❌ |
| 4 | F04 | 播放页同女优推荐 | VideoPlayer.tsx | ❌ |
| 5 | F05 | 播放器字幕支持 | StreamController + DPlayerWrapper | ❌ |

**回归分析**：F03 root cause — `containerWidth=0` 导致第一次 effect 用错误 `itemsPerRow` 计算 rowIndex 并清除 sessionStorage，后续正确值到达时数据已丢失。F04 root cause — 需运行时排查数据流（actor 名匹配 / API 响应）。F05 root cause — 后端无字幕文件时返回 204，DPlayer 收到 204 不显示字幕按钮。

### F01：Settings 保存失败

`SettingsController.cs` `[HttpPut]` 返回 `return Ok()` 导致前端 `res.json()` 解析失败。改为 `return Ok(new { success = true })`。

### F02：过度滚动强化

`html, body, #root { overscroll-behavior: none; }`。

### F03：返回位置恢复

`useEffect` + `gridRef.current?.scrollToIndex(saved)` + 300ms delay 等待数据就绪。**回归中**，修正方案见 [issues.md § F03-R](./issues.md#f03-r浏览器返回位置恢复--深度分析)。

### F04：同女优推荐

VideoPlayer 中取第一个女优 → `POST /api/movies/filter` → MovieCard Grid 展示。**回归中**，排查方案见 [issues.md § F04-R](./issues.md#f04-r播放页同女优推荐--深度分析)。

### F05：字幕支持

后端检测同目录 `.srt`/`.ass`/`.vtt` → Ude 自动检测编码 → UTF-8 返回。DPlayer `subtitle.url` 配置。**回归中**，修正方案见 [issues.md § F05-R](./issues.md#f05-r播放器字幕--深度分析)。

---

## 六、阶段 G：Remote Access（手机浏览器远程访问）✅

> 创建日期：2026-05-05
> 完成日期：2026-05-05
>
> **目标**：在家庭局域网内，通过手机浏览器安全访问项目并播放影片。
>
> **设计原则**：默认关闭（`RemoteAccess.Enabled=false`），不影响现有功能。开启后强制 HTTPS + Token 认证 + 速率限制。
>
> 需求与安全模型见 🐛 [issues.md § 七](./issues.md#七新增功能需求remote-access阶段-g)
>
> 详细实施方案见 📐 [plans.md § 阶段 G](./plans.md#阶段-gremote-access手机浏览器远程访问)
>
> **信任模型**：电脑端（本机IP）= 管理员免认证；手机端 = 受限客户端需密码登录。
>
> **运行模式**：生产模式（`dotnet run`），后端直接托管前端。手机访问 `https://电脑IP:5000`。Vite dev server 不需要暴露。

### G.1：基础设施（Phase 1）

| # | 项目 | 文件 | 操作 | 状态 |
|---|------|------|------|------|
| G.1.1 | 新增 RemoteAccess 配置节（6字段） | appsettings.json | 修改 | ✅ |
| G.1.2 | Program.cs 条件绑定逻辑 | Program.cs | 修改 | ✅ |

### G.2：HTTPS + 自签证书（Phase 2）

| # | 项目 | 文件 | 操作 | 状态 |
|---|------|------|------|------|
| G.2.1 | 自签证书自动生成 + Kestrel HTTPS 配置 + HTTP:5001 双端口 | Program.cs（内联） | 修改 | ✅ |

### G.3：认证后端（Phase 3）

| # | 项目 | 文件 | 操作 | 状态 |
|---|------|------|------|------|
| G.3.1 | Token 验证中间件（header+query 双通道） | Middleware/TokenAuthMiddleware.cs | 新建 | ✅ |
| G.3.2 | 登录速率限制 | Middleware/RateLimitMiddleware.cs | 新建 | ✅ |
| G.3.3 | 登录/登出/状态接口 | Controllers/AuthController.cs | 新建 | ✅ |
| G.3.4 | 网络工具（IP获取+端口检测） | Services/NetworkHelper.cs | 新建 | ✅ |
| G.3.5 | Settings 密码/网络/会话接口 | Controllers/SettingsController.cs | 修改 | ✅ |
| G.3.6 | AccessToken 数据模型 | Models/AccessToken.cs + AppDbContext.cs | 新建+修改 | ✅ |

### G.4：前端认证（Phase 4）

| # | 项目 | 文件 | 操作 | 状态 |
|---|------|------|------|------|
| G.4.1 | API 层 Token 注入 + 401 拦截 + 全部 service 统一 fetchJson | services/api.ts + 5 service 文件 | 修改 | ✅ |
| G.4.2 | 认证服务 | services/authService.ts | 新建 | ✅ |
| G.4.3 | 登录页面 | components/auth/LoginPage.tsx | 新建 | ✅ |
| G.4.4 | 路由调整 + ErrorBoundary + AuthRedirector | App.tsx | 修改 | ✅ |

### G.5：Settings 页面 UI（Phase 5）

| # | 项目 | 文件 | 操作 | 状态 |
|---|------|------|------|------|
| G.5.1 | 远程访问设置区域（密码/网络/会话） | SettingsViewer.tsx | 修改 | ✅ |

**G.5.1 包含**：密码设置、网络信息（IP列表+复制）、公网暴露警告、活跃会话列表、撤销功能、证书警告提示。

### G.6：UI 移动端适配（Phase 6）

| # | 项目 | 文件 | 操作 | 状态 |
|---|------|------|------|------|
| G.6.1 | Navbar 响应式汉堡菜单 | Navbar.tsx | 修改 | ✅ |
| G.6.2 | 筛选面板移动端全屏 | AppLayout.tsx | 修改 | ✅ |
| G.6.3 | MovieCard 触屏优化（hover限定md+，Play始终可见） | MovieCard.tsx | 修改 | ✅ |

---

### 涉及文件汇总（阶段 G）

| 文件 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | 操作 |
|---|---|---|---|---|---|---|---|
| appsettings.json | +12 | | | | | | 修改 |
| Program.cs | +40 | +30 | +5 | | | | 修改 |
| Middleware/TokenAuthMiddleware.cs | | | +80 | | | | 新建 |
| Middleware/RateLimitMiddleware.cs | | | +60 | | | | 新建 |
| Controllers/AuthController.cs | | | +100 | | | | 新建 |
| Services/NetworkHelper.cs | | | +60 | | | | 新建 |
| Controllers/SettingsController.cs | | | +80 | | | | 修改 |
| Models/AccessToken.cs | | | +10 | | | | 新建 |
| Data/AppDbContext.cs | | | +3 | | | | 修改 |
| services/api.ts | | | | +20 | | | 修改 |
| services/authService.ts | | | | +50 | | | 新建 |
| components/auth/LoginPage.tsx | | | | +80 | | | 新建 |
| App.tsx | | | | +10 | | | 修改 |
| SettingsViewer.tsx | | | | | +150 | | 修改 |
| Navbar.tsx | | | | | | +40 | 修改 |
| AppLayout.tsx | | | | | | +1 | 修改 |
| MovieCard.tsx | | | | | | +10 | 修改 |

**总计**：新建 7 文件，修改 10 文件

---

### 阶段 G 后持续修复（2026-05-05）

| # | 项目 | 文件 | 状态 |
|---|------|------|------|
| G-P01 | FilterPanel 原始 fetch → fetchJson（401 导致 .slice() 崩溃） | FilterPanel.tsx | ✅ |
| G-P02 | 全部 localStorage/sessionStorage try-catch 安全包装（iOS 隐私模式） | 7 文件 | ✅ |
| G-P03 | AuthRedirector 防重入（多 API 同时 401） | App.tsx | ✅ |
| G-P04 | 后端 TokenAuthMiddleware 支持 `?token=` query 参数 | TokenAuthMiddleware.cs | ✅ |
| G-P05 | 前端 getMediaUrl() 注入 token query 参数 | api.ts | ✅ |
| G-P06 | 全部媒体 URL（image/stream）改为 getMediaUrl | 4 文件 | ✅ |
| G-P07 | Kestrel HTTP:5001 双端口（Android Chrome 自签证书兼容） | Program.cs | ✅ |
| G-P08 | getMediaBase 仅 Android 切 HTTP（iPad Safari 恢复 HTTPS） | api.ts | ✅ |
| G-P09 | DPlayerWrapper autoplay=false + playsinline + error callback | DPlayerWrapper.tsx | ✅ |
| G-P10 | VideoPlayer 移动端 `<video controls>` 调系统播放器 | VideoPlayer.tsx | ✅ |
| G-P11 | 7 处原始 fetch 统一改为 fetchJson（原缺失 auth token） | 7 文件 | ✅ |
| G-P12 | build.ps1 修复 .preserve 残留 + Certs 目录保护 | build.ps1 | ✅ |

---

## 七、状态图例

| 符号 | 含义 |
|---|---|
| ✅ | 已完成 |
| 🔄 | 进行中 |
| 🔲 | 待开始 |
| ❌ | 已取消 / 回归 |
| ⚠️ | 阻塞 |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，合并 phase-c + phase-d 进度 |
| 2026-05-03 | 阶段 D 全部完成 |
| 2026-05-03 | D06 修复 + D07 磁吸双区域 |
| 2026-05-03 | 阶段 E 规划完成：6 项任务 |
| 2026-05-03 | 阶段 E 全部完成 ✅（tsc 0 / eslint 0 / dotnet build 0） |
| 2026-05-03 | 阶段 F 规划完成：5 项任务 |
| 2026-05-03 | 阶段 F 全部完成 ✅（tsc 0 / eslint 0 / dotnet build 0） |
| 2026-05-03 | 用户验证 F03/F04/F05 均未解决 → 回归 |
| 2026-05-05 | 阶段 G 规划：Remote Access 移动端访问（17项，6 Phase） |
| 2026-05-05 | 重组文档结构：加入目录、明确三文档分工、添加交叉引用 |
| 2026-05-05 | 阶段 G 全部完成：17 项 Phase G + 12 项后续修复（G-P01~G-P12），tsc 0 / eslint 0 / dotnet build 0 |
| 2026-05-05 | 阶段 G 后修复记录：移动端原生播放器、HTTP:5001 双端口、Android-only HTTP 切换、storage try-catch、fetchJson 全局统一 |
| 2026-05-05 | v1.1.1 release 发布到 GitHub（含完整 win64 构建包） |
