# 维护进度跟踪

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> **动态文档**，每个任务完成后更新状态。

---

## 一、整体阶段进度

| 阶段 | 状态 | 开始日期 | 完成日期 |
|---|---|---|---|
| 阶段 C：增强功能 | ✅ 已完成 | 2026-05-03 | 2026-05-03 |
| 阶段 D：UX 增强 | ✅ 已完成 | 2026-05-03 | 2026-05-03 |
| 阶段 E：修复与增强 | ✅ 已完成 | 2026-05-03 | 2026-05-03 |
| 阶段 F：回归修复 + 新功能 | 🔄 回归 | 2026-05-03 | — |

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

## 三、阶段 D：UX 增强

| 顺序 | # | 项目 | 文件 | 状态 |
|---|---|---|---|---|
| 1 | D01 | Logo 清除筛选回首页 | Navbar.tsx | ✅ |
| 2 | D03 | 一排 6 列海报 | MovieGrid.tsx | ✅ |
| 3 | D04 | 详情页主图改为 fanart | MovieDetail.tsx | ✅ |
| 4 | D05 | 筛选面板右侧推入 | AppLayout + FilterPanel | ✅ |
| 5 | D02 | 筛选激活 tag 条 | ActiveFiltersBar + AppLayout | ✅ |

**依頼**：D01/D03/D04 独立，D05 是核心架构改动，D02 依赖 D05。全部已完成 ✅

### 阶段 D 补充修复

| # | 项目 | 文件 | 状态 |
|---|---|---|---|
| D06 | medium-zoom bug — 移除 zoomable + 恢复 poster + 布局重构 | MovieDetail.tsx | ✅ |
| D07 | 详情页磁吸双区域 — snap-scroll + 大海报(fanart) + Synopsis | MovieDetail.tsx | ✅ |

**D06 说明**：移除 `zoomable` 属性杜绝 medium-zoom DOM 残留导致海报白屏/主页残留；主图从 fanart 改回 poster（aspect-[2/3] + 阴影悬浮）；Play 按钮加宽；Tags/Genres 浅色背景 + hover 上浮效果。

**D07 说明**：`snap-y snap-mandatory` 双区域布局。区域一 Hero（min-h-screen，模糊背景铺满全屏）；下滑磁吸进入区域二（大海报 fanart max-w-xl + Synopsis 下方居中），`whileInView` 淡入动画。

---

## 四、阶段 E：修复与增强

| 顺序 | # | 项目 | 文件 | 状态 |
|---|---|---|---|---|
| 1 | E01 | Actor 头像 URL 修复（单复数匹配） | ActorGrid.tsx | ✅ |
| 2 | E04 | 过度滚动修复（overscroll-behavior） | index.css | ✅ |
| 3 | E05 | Actor 点击跳转后回到顶部 | ActorGrid.tsx | ✅ |
| 4 | E02 | 随机播放按钮（Fisher-Yates 洗牌） | Navbar + shuffleStore | ✅ |
| 5 | E03 | Heatmap GitHub 风格改版（按天聚合） | StatsService + Heatmap | ✅ |
| 6 | E06 | 主页返回保持滚动位置 | MovieGrid.tsx | ✅ |

**依頼**：E01/E04/E05 独立（P0，一行修复）；E02 独立（P1，新组件）；E03 需前后端联动（P1）；E06 最复杂（P2，需区分浏览器返回/导航点击）。

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

`useEffect` + `gridRef.current?.scrollToIndex(saved)` + 300ms delay 等待数据就绪。

### F04：同女优推荐

VideoPlayer 中取第一个女优 → `POST /api/movies/filter` → MovieCard Grid 展示。

### F05：字幕支持

后端检测同目录 `.srt`/`.ass`/`.vtt` → Ude 自动检测编码 → UTF-8 返回。DPlayer `subtitle.url` 配置。

---

## 六、状态图例

| 符号 | 含义 |
|---|---|
| ✅ | 已完成 |
| 🔄 | 进行中 |
| 🔲 | 待开始 |
| ❌ | 已取消 |
| ⚠️ | 阻塞 |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，合并 phase-c + phase-d 进度 |
| 2026-05-03 | 阶段 D 全部完成：D01 Logo清除筛选 + D03 6列海报 + D04 fanart主图 + D05 筛选面板右推 + D02 激活tag条 |
| 2026-05-03 | D06 修复 medium-zoom bug + 详情页布局重构（番号在上、海报阴影、Play加宽、Tags美化） |
| 2026-05-03 | D07 详情页磁吸双区域（snap-scroll Hero + Fanart/Synopsis） |
| 2026-05-03 | 阶段 E 规划完成：6 项任务（E01-E06）待开始 |
| 2026-05-03 | 阶段 E 全部完成：6 项全部 ✅（tsc 0 / eslint 0 / dotnet build 0） |
| 2026-05-03 | 阶段 F 规划完成：5 项任务（F01-F05）待开始 |
| 2026-05-03 | 阶段 F 全部完成：5 项全部 ✅（tsc 0 / eslint 0 / dotnet build 0） |
| 2026-05-03 | 用户验证 F03/F04/F05 均未解决 → 回归，深度分析根因 |
