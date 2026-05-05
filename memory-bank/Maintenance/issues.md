# 待解决问题

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> **本文角色**：跟踪所有**问题与需求**。当前 Bug、已修复记录、搁置项、以及计划中的新功能需求，均在此文件。
>
> 配套文件：
> - 📋 [progress.md](./progress.md) — 进度跟踪（任务完成状态、时间线）
> - 📐 [plans.md](./plans.md) — 实施方案（代码级详细方案，供 LLM 执行用）

---

## 目录

- [一、当前待修复（阶段 F 回归 — 3 项未解决）](#一当前待修复阶段-f-回归--3-项未解决)
- [二、已解决（阶段 C）](#二已解决阶段-c)
- [三、已解决（阶段 D）](#三已解决阶段-d)
- [四、已解决（阶段 E）](#四已解决阶段-e)
- [五、已解决（阶段 F）](#五已解决阶段-f)
- [六、搁置](#六搁置)
- [七、新增功能需求：Remote Access（阶段 G）](#七新增功能需求remote-access阶段-g)
- [变更记录](#变更记录)

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

## 七、新增功能需求：Remote Access（阶段 G）✅

> 创建日期：2026-05-05
> 完成日期：2026-05-05
>
> **目标**：支持在家庭局域网内通过手机浏览器安全访问项目前端并播放影片。
>
> **核心原则**：默认关闭，主动开启，随时可关。`RemoteAccess.Enabled=false` 时项目行为与现在**完全一致**。
>
> 详细实施方案见 📐 [plans.md § 阶段 G](./plans.md#阶段-gremote-access手机浏览器远程访问)
>
> 进度跟踪见 📋 [progress.md § 七](./progress.md#七阶段-gremote-access手机浏览器远程访问)

---

### 功能需求清单

| # | 需求 | 优先级 | 说明 |
|---|------|--------|------|
| G01 | 配置文件开关（`RemoteAccess.Enabled`） | P0 | `false` 时一切和现在一样 |
| G02 | HTTPS + 自签证书自动生成 | P0 | 防 ARP 欺骗抓包 |
| G03 | Token 密码认证（30天滑动过期） | P0 | 手机端登录验证 |
| G04 | 本机 IP 免认证（localhost + 所有网卡 IP） | P0 | 电脑端无需输入密码 |
| G05 | 登录失败速率限制（5次/15分钟/IP） | P0 | 防暴力破解 |
| G06 | Settings 页面远程访问管理 UI | P0 | 设置密码、查看 IP、管理会话 |
| G07 | 手机端登录页面 | P0 | `/login` 路由 |
| G08 | 端口转发公网暴露检测 + 警告 | P1 | 启动时探测，UI 警告 |
| G09 | Windows 防火墙状态检查 + 提示 | P1 | 帮助排查手机连不上问题 |
| G10 | 局域网 IP 列表显示 + 二维码 | P1 | 手机扫码直接打开 |
| G11 | 活跃会话管理（查看/撤销） | P1 | 查看哪些设备在登录 |
| G12 | Navbar 响应式汉堡菜单 | P2 | 手机端导航 |
| G13 | 筛选面板移动端全屏化 | P2 | 手机端筛选 |
| G14 | MovieCard 触屏交互优化 | P2 | 触屏 hover 替代 |

---

### 安全模型（已评审通过）

```
请求到达 → [RemoteAccess.Enabled?]
  ├── false → 和现在完全一样（localhost绑定，无认证，无HTTPS）
  └── true → HTTPS + 认证全部生效
       └── [RemoteIpAddress 是否本机IP?]
            ├── 是 → 免认证通过（电脑端 = 管理员）
            └── 否 → Token 验证（手机端 = 受限客户端）
                 ├── 有效 + 未过期 → 正常访问，滑动续期
                 └── 无效/缺失/过期 → 401
                      └── [POST /api/auth/login]
                           ├── 成功 → 清除该IP计数
                           └── 失败 → 计数+1
                                └── 连续5次 → 锁15分钟（按IP）
```

- **本机 IP 白名单**：`127.0.0.1` / `::1` + 本机所有网卡 IPv4（`NetworkInterface.GetAllNetworkInterfaces()`）
- **Token 策略**：`SHA256(Guid.NewGuid())` → 存数据库（TokenHash / CreatedAt / ExpiresAt / LastActiveAt / UserAgent）。30天过期，距过期 < 7 天时自动续 30 天。前端存 `localStorage`
- **密码存储**：`UserSettings` 表，Key=`AccessPassword`，Value=`{salt}:{SHA256(password+salt)}`
- **HTTPS 策略**：自签证书，`UseHttps=true` 时自动检查 `Certs/cert.pfx`，不存在则用 `X509Certificate2` + RSA 2048 生成，有效期 10 年
- **运行模式**：用户使用生产模式（`dotnet run`），后端直接托管前端。手机访问 `https://电脑IP:5000`，不需要 Vite dev server

---

### 攻击场景覆盖

| 场景 | 威胁 | 防御 | 结论 |
|------|------|------|------|
| 访客 WiFi 连接 + 浏览器访问 IP | 直接看到影片库 | Token 认证 + 登录页 | ✅ 安全 |
| 端口扫描 + 工具破解 | 暴力尝试密码 | 速率限制（5次/15分钟） | ✅ 安全 |
| ARP 欺骗 + 网络抓包 | 嗅探 Token/密码 | HTTPS 加密 | ✅ 安全 |
| 弱密码（如"1234"） | 被猜中 | 速率限制（5次/15分钟） | ✅ 安全 |
| 路由器误开端口转发 | 互联网访问 | 启动探测 + UI 红色警告 | ✅ 防御 |
| Windows 防火墙拦截 | 手机连不上 | 启动检测 + UI 提示 | ✅ 提示 |
| 电脑本身被入侵 | 直接读数据库/文件 | 超出本项目防御范围 | — |

---

### 配置节设计

```json
{
  "RemoteAccess": {
    "Enabled": false,
    "BindAddress": "0.0.0.0",
    "Port": 5000,
    "UseHttps": true,
    "CertificatePath": "Certs/cert.pfx",
    "CertificatePassword": ""
  }
}
```

用户只需将 `Enabled` 改为 `true`，其他字段使用默认值即可。密码通过 Settings 页面 UI 设置，无需手动编辑 JSON。

---

## 八、阶段 G 期间发现并修复的问题

| # | 问题 | 根因 | 修复 |
|---|------|------|------|
| G-I01 | 手机白屏 `N.slice is not a function` | FilterPanel 的 `fetchFilterOptions` 用原生 `fetch`，401 返回 JSON 对象被当数组 `.slice()` | 改用 `fetchJson`，加 `res.ok` 检查 |
| G-I02 | 手机白屏（iOS 隐私模式） | `localStorage` 直接访问抛异常 → React 崩溃 | 全部 storage 操作加 try-catch 安全包装 |
| G-I03 | 多个 API 同时 401 → 多次 `/login` 跳转 | `AuthRedirector` 无防重入 | 加 `navigating` ref 防抖 |
| G-I04 | 登录后海报/头像不显示 | `<img src>` 由浏览器加载不走 `fetchJson`，不带 `X-Auth-Token` → 401 | 后端 TokenAuthMiddleware 支持 `?token=` query 参数，前端 `getMediaUrl()` 注入 |
| G-I05 | 登录后视频不加载 | 同上 + `<video>` 同机制 | 同上 |
| G-I06 | Android Chrome 视频全挂 `EXTERNAL_RENDERER_FAILED (code 4)` | Chrome 媒体引擎独立验证自签 HTTPS 证书 → 拒绝 | Kestrel 双端口：HTTPS:5000(页面) + HTTP:5001(媒体) |
| G-I07 | Android Chrome H.264 视频仍 code 4 | code 4 实际是自签证书问题，非编码问题 | HTTPS→HTTP 切换解决 |
| G-I08 | iPad 媒体全部失效 | `getMediaBase()` 对所有 HTTPS 都切 HTTP，iPad Safari 不接受 HTTP 混入 | 仅 Android 切 HTTP |
| G-I09 | 移动端 DPlayer 自动播放被拦截 | `autoplay=true` 默认值 | 改为 `autoplay=false`，加 `playsinline` |
| G-I10 | 移动端 HEVC 无法播放 | Chromium 不含 HEVC 解码器（专利），Android/iOS 均需系统播放器 | 移动端 `<video controls>` 调系统播放器，桌面端保持 DPlayer |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，从 phase-c/d 路线图提取 |
| 2026-05-03 | 阶段 D 全部完成：D01-D05 全部 ✅ |
| 2026-05-03 | D06 修复 + D07 磁吸双区域：D06-D07 全部 ✅ |
| 2026-05-03 | 阶段 E 新增 6 项问题（E01-E06） |
| 2026-05-03 | 阶段 E 全部完成：6 项全部 ✅ |
| 2026-05-03 | 阶段 F 新增 5 项：F01-F05 |
| 2026-05-03 | 阶段 F 全部完成：5 项全部 ✅ |
| 2026-05-03 | 用户验证：F03/F04/F05 均未解决 → 标记为回归，深度分析根因 |
| 2026-05-05 | 阶段 G 规划：Remote Access 移动端访问（14项需求，6 Phase，见 plans.md） |
| 2026-05-05 | 重组文档结构：加入目录、明确三文档分工、添加交叉引用 |
| 2026-05-05 | 阶段 G 完成：14项全部实现。期间发现并修复 10 个问题（G-I01~G-I10） |
| 2026-05-05 | 新增"八、阶段 G 期间发现并修复的问题"表，记录 HTTPS/HTTP 双端口、移动端原生播放器、storage 安全包装等关键修复 |
