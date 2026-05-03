# 待解决问题

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 本文档跟踪所有待解决和搁置的问题。

---

## 一、当前待修复（阶段 F 回归 — 3 项未解决）

| # | 问题 | 严重度 | 状态 |
|---|---|---|---|
| F03-R | 浏览器返回位置恢复失效 | 🟡 中等 | 🔲 |
| F04-R | 播放页同女优推荐未显示 | 🟡 中等 | 🔲 |
| F05-R | 播放器字幕未生效 | 🟡 中等 | 🔲 |

---

### F03-R：浏览器返回位置恢复 — 深度分析

**现象**：每次浏览器返回都回到顶部，从未恢复。

**根因分析**：

1. **`containerWidth` 初始为 0 → `itemsPerRow = 2` → 第一次 useEffect 用错误的 row 数计算 `rowIndex`**。组件挂载时 `containerWidth` 为 0（ResizeObserver 回调尚未触发），`itemsPerRow` 默认为 2。第一个 effect 运行后 `clearScrollPosition()` 删除了 sessionStorage。当 ResizeObserver 触发、`containerWidth` 更新、`itemsPerRow` 变为正确值（如 6）时，effect 再次运行，但 sessionStorage 已被清空。

2. **`scrollToIndex` 在 VirtuosoGrid 初始化完成前被调用**。200ms timeout 可能不够，grid 内部的虚拟列表尚未完成初始化，`scrollToIndex` 被忽略。

3. **根本设计缺陷**：不应使用 effect + scrollToIndex 异步恢复，而应在首次渲染时直接用 `initialTopMostItemIndex` 正确传入。VirtuosoGrid 原生支持该 prop。

**修正方案**：
- 保存 `movieIndex`（不变）
- 恢复时在 `useMemo` 中计算 `initialTopMostItemIndex = Math.floor(movieIndex / itemsPerRow)`
- 处理 `containerWidth` 为 0 的情况：延迟到 `containerWidth > 0` 时再传入
- **不调用 `clearScrollPosition()`** — 让 sessionStorage 中的值自然被下次保存覆盖

---

### F04-R：播放页同女优推荐 — 深度分析

**现象**：播放页底部完全没有出现同女优推荐区域，连空状态都看不到。

**排查方向**（逐一验证）：

| 检查点 | 当前状态 | 需验证 |
|---|---|---|
| `movie.actors` 是否有值 | `GetByImdbIdAsync` 包含 `MovieActors` 的 Include，`MapToViewModel` 映射了 `Actors` | 运行时 console.log 确认 |
| `primaryActor` 是否为 null | 依赖 `movie?.actors?.[0]`，loading 期间为 null | `useQuery.enabled` 正确监听变化 |
| API `POST /api/movies/filter` 是否返回数据 | Filter 逻辑正确，`isAndOperator: false` 使用 OR 匹配 | 打开 Network 面板查看响应 |
| `sameActorMovies` 是否进入渲染 | 条件 `sameActorMovies && sameActorMovies.length > 0` | 加 console.log |
| 布局是否隐藏了该区域 | 播放器容器 `overflow-y-auto`，推荐区域在底部 | 向下滚动查看 |

**最可能原因**：前端 `primaryActor` 虽然非 null，但 `enabled` 检查顺序或 API 请求体中的 actor 名称与数据库不一致（如全角/半角括号等）。

**修正方案**：在 VideoPlayer 中添加 console.log 临时调试，确认数据流每一步的状态。根据实际断点确定修复位置。

---

### F05-R：播放器字幕 — 深度分析

**现象**：播放器没有任何字幕切换按钮，字幕功能完全未激活。

**根因分析**：

1. **DPlayer 需要字幕 URL 返回有效内容才会显示字幕按钮**。后端 `/api/stream/{imdbId}/subtitle` 返回 **204 No Content**（无字幕文件时），DPlayer 不会显示字幕开关。
2. **字幕文件可能找不到**：后端在影片同目录下查找 `{影片文件名}.vtt` / `.srt` / `.ass`。如果字幕文件命名与影片文件名不完全一致（如多了 `_chs` 后缀），则找不到。
3. **DPlayer `subtitle.type` 配置为 `"webvtt"`**。即使后端成功找到并转换了字幕，前端的 type 设置是否正确传递需要验证。

**修正方案**：
- **方案 A**：后端始终返回空 VTT 内容（而非 204），DPlayer 会显示字幕按钮（无字幕时为空）
- **方案 B**：前端预先 fetch subtitle URL，若为 204 则不传 subtitleUrl，DPlayer 不显示按钮
- **推荐方案 A**：更简单，用户始终能看到字幕按钮，无字幕时点击无效果

**字幕文件命名匹配增强**：后端可扩展查找逻辑，也匹配 `{影片文件名}_*` 模式（如 `ABCD-123_chs.srt`）。

---

## 二、已解决（阶段 C）

| # | 问题 | 状态 |
|---|---|---|
| C01 | B01 播放页返回白屏（dp.off 报错） | ✅ |
| C02 | 页面靠左对齐 | ✅ |
| C03 | MovieDetail Tags/Genres/Actors 可点击跳转筛选 | ✅ |
| C04 | Dashboard 显示最常观看的电影 | ✅ |
| C05 | Actors 页面演员头像 + 点击筛选 | ✅ |
| C06 | 筛选面板重设计（分组折叠 + Tab 切换） | ✅ |

## 三、已解决（阶段 D）

| # | 问题 | 状态 |
|---|---|---|
| D01 | 点击 Logo 清除筛选回首页 | ✅ |
| D02 | 筛选激活 tag 条（筛选面板关闭时显示） | ✅ |
| D03 | 一排 6 列海报（≥1200px 容器宽度） | ✅ |
| D04 | 详情页主图改为 fanart.jpg（横版） | ✅ |
| D05 | 筛选面板从右侧推入挤压海报墙（非覆盖层） | ✅ |
| D06 | 详情页 poster 点击放大白屏（medium-zoom DOM 残留） | ✅ |
| D07 | 详情页增加大海报 + Synopsis（下滑磁吸双区域） | ✅ |

## 四、已解决（阶段 E）

| # | 问题 | 状态 |
|---|---|---|
| E01 | Actor 页面头像不显示（前后端 URL 单复数不匹配） | ✅ |
| E02 | 顶栏添加随机播放按钮（Fisher-Yates 洗牌 + 循环迭代） | ✅ |
| E03 | Dashboard Monthly Heatmap 改为 GitHub 贡献图风格（按天聚合） | ✅ |
| E04 | Actor/Dashboard/Settings 页面过度滑动到空白区域 | ✅ |
| E05 | Actor 页面点击女优跳转后需上滑才能看到影片 | ✅ |
| E06 | 主页点击影片返回后应保持原滚动位置 | ✅ |

## 五、已解决（阶段 F）

| # | 问题 | 状态 |
|---|---|---|
| F01 | Settings 保存失败（连锁导致头像 204） | ✅ |
| F02 | 过度滚动仍存在（含主页） | ✅ |
| F03 | 浏览器返回位置恢复失效 | ❌ 回归 |
| F04 | 播放页同女优推荐 | ❌ 回归 |
| F05 | 播放器字幕支持 | ❌ 回归 |

---

## 六、搁置

| # | 问题 | 原因 |
|---|---|---|
| C07 | 播放器进度条悬浮预览图 | 依赖 FFmpeg 生成 sprite + VTT |
| C08 | 网页汉化 | 量大（15 文件 ~150 处），暂缓 |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，从 phase-c/d 路线图提取 |
| 2026-05-03 | 阶段 D 全部完成：D01-D05 全部 ✅ |
| 2026-05-03 | D06 修复 + D07 磁吸双区域：D06-D07 全部 ✅ |
| 2026-05-03 | 阶段 E 新增 6 项问题（E01-E06）：头像URL/随机播放/Heatmap改版/过度滑动/跳转回顶/返回位置 |
| 2026-05-03 | 阶段 E 全部完成：6 项全部 ✅ |
| 2026-05-03 | 阶段 F 新增 5 项：F01 Settings/头像连锁bug / F02 过度滚动加固 / F03 返回位置 / F04 同女优推荐 / F05 字幕 |
| 2026-05-03 | 阶段 F 全部完成：5 项全部 ✅ |
| 2026-05-03 | 用户验证：F03/F04/F05 均未解决 → 标记为回归，深度分析根因 |
