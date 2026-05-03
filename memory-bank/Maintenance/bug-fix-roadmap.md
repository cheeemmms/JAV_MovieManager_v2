# BUG 修复路线图

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 本文档定义 7 个 BUG 的总体修复顺序、里程碑划分和依赖关系。

---

## 一、优先级矩阵

BUG 按「严重度 × 修复成本」排定优先级：

```
          修复成本低              修复成本中              修复成本高
         ═══════════           ═══════════           ═══════════
严重度    B02 播放器尺寸          B07 筛选失效
🔴        B04 Dashboard崩溃      B01 白屏竞态

严重度    B05 设置无法保存
🟠        B06 卡片不贴边

严重度
🟡                                                     B03 Actors空白

严重度
🟢
```

**结论**：先消灭 2 个成本最低的阻塞 BUG（B02 + B04），再攻克核心架构 BUG（B07），然后处理交互体验 BUG（B01 + B05），最后补齐功能缺口（B03 + B06）。

---

## 二、修复阶段划分

| 阶段 | 包含 BUG | 目标 | 状态 |
|---|---|---|---|
| **阶段 1：急救修复** | B02, B04 | 消除崩溃和严重视觉问题 | ✅ 已完成 |
| **阶段 2：核心修复** | B07, B05 | 恢复核心功能（筛选 + 设置） | ✅ 已完成 |
| **阶段 3：体验修复** | B01, B06 | 修复导航白屏 + 布局细节 | ✅ 已完成 |
| **阶段 4：补齐修复** | B03 | 填补功能空白 | ✅ 已完成 |

---

## 三、阶段 1：急救修复

**目标**：让 Dashboard 正常显示 + 播放器完整可见。这两个 BUG 修复成本极低、影响面广、无依赖。

| 顺序 | BUG | 任务 | 文件 | 改动量 | 预计耗时 |
|---|---|---|---|---|---|
| 1.1 | **B04** Dashboard 崩溃 | StatsService 添加 AnyAsync 判空 | `jav-manager-api/Services/StatsService.cs` | 3 行 | 5 min |
| 1.2 | **B02** 播放器尺寸不符 | DPlayer 容器加 `min-h-0 overflow-hidden` | `jav-manager-web/src/components/player/VideoPlayer.tsx` | 1 行 | 2 min |

### 验证清单

- [ ] `curl http://localhost:5000/api/stats/dashboard` 返回 200（无评分数据的空库）
- [ ] Dashboard 页面不再显示错误，卡片和图表正常渲染
- [ ] 播放器页面的底部标题/进度条/信息栏完整可见
- [ ] 播放器在不同窗口尺寸（全屏→小窗）切换正常

---

## 四、阶段 2：核心修复

**目标**：恢复筛选功能和设置保存功能。这两个是核心交互路径。

| 顺序 | BUG | 任务 | 文件 | 改动量 | 预计耗时 |
|---|---|---|---|---|---|
| 2.1 | **B07** 筛选失效 | MovieGrid queryKey 加入 filterStore | `MovieGrid.tsx` | ~30 行 | 20 min |
| 2.2 | **B07** 筛选失效（增强） | FilterPanel 关闭时 invalidateQueries | `AppLayout.tsx` | ~8 行 | 10 min |
| 2.3 | **B05** 设置无法保存 | SettingsViewer 防止 reset 循环 | `SettingsViewer.tsx` | ~5 行 | 10 min |

### 依赖关系

```
B07 (2.1) ──→ B07 (2.2) ──→ 验证
B05 (2.3) ──→ 独立 ──→ 验证
B07 与 B05 无相互依赖，可并行或任意顺序
```

### 验证清单

- [ ] 选择一个 Genre → 关闭 FilterPanel → MovieGrid 刷新显示筛选结果
- [ ] 多条件组合筛选（Actor + Year + Rating）正常生效
- [ ] 切换排序方式，MovieGrid 重新排序
- [ ] "Reset All Filters" 恢复默认显示
- [ ] Settings 页面修改值 → Save 按钮可点击 → 点击保存 → toast "Settings saved"
- [ ] 刷新 Settings 页面 → 之前保存的值仍然存在

---

## 五、阶段 3：体验修复

**目标**：修复导航白屏和卡片布局。

| 顺序 | BUG | 任务 | 文件 | 改动量 | 预计耗时 |
|---|---|---|---|---|---|
| 3.1 | **B01** 白屏 | VideoPlayer handleBack 改用绝对路径 | `VideoPlayer.tsx` | 1 行 | 2 min |
| 3.2 | **B01** 白屏（备选） | 让 endRecording await 完成后再导航 | `VideoPlayer.tsx` + `usePlaybackRecording.ts` | ~8 行 | 10 min |
| 3.3 | **B06** 卡片不贴边 | MovieGrid 去掉 container，手动设置边距 | `MovieGrid.tsx` | 1 行 | 2 min |

### 依赖关系

```
B01 (3.1) ──→ 验证
       └── 如不生效 → B01 (3.2)
B06 (3.3) ──→ 独立验证
```

### 验证清单

- [ ] Player → 点返回 → MovieDetail 正常渲染（不白屏）
- [ ] 重复来回 5 次（MovieDetail ↔ Player）不出现白屏
- [ ] 首页卡片网格：最左卡片到左边缘 ≈ 最右卡片到右边缘
- [ ] 在不同窗口宽度下视觉对称

---

## 六、阶段 4：补齐修复

**目标**：Actors 页面从空壳变成有内容的页面。

| 顺序 | BUG | 任务 | 文件 | 改动量 | 预计耗时 |
|---|---|---|---|---|---|
| 4.1 | **B03** Actors | 创建 `actorService.ts` API hooks | 新建 `services/actorService.ts` | ~30 行 | 15 min |
| 4.2 | **B03** Actors | 实现 ActorGrid 组件（含 ActorCard） | `App.tsx` 替换 stub | ~60 行 | 20 min |

### 验证清单

- [ ] `/actors` 页面显示演员列表（非空白）
- [ ] 每个演员卡片显示名称和基本信息
- [ ] 搜索演员名可以过滤结果
- [ ] API 调用正常（打开浏览器 DevTools 确认无 4xx/5xx）

---

## 七、总时间线

```
阶段 1▐  ██              ▏<10min
阶段 2▐     ██████        ▏~40min
阶段 3▐            ██     ▏~15min
阶段 4▐              ███  ▏~35min
       └──────────────────┘
       总计约 1.5 小时
```

### 推荐执行顺序

```
1. B04 (后端) → 并行可选
2. B02 (前端) → 并行可选
       ↓
3. B07 (前端核心) → 依赖 1&2 无直接关系，但建议基础稳定后再改
4. B05 (前端设置) → 可与 B07 并行
       ↓
5. B01 (前端路由) → 建议 B07 完成后验证（筛选 → 详情 → 播放 → 返回链路完整）
6. B06 (前端布局) → 可随时修
       ↓
7. B03 (前端 Actors) → 独立模块，可并行
```

---

## 八、风险与注意事项

| 风险 | 说明 | 缓解措施 |
|---|---|---|
| B07 筛选 queryKey 过大 | 所有筛选字段放入 queryKey 可能导致键值体积大 | 仅放入会实际变化的核心字段，排除 `null` |
| B01 竞态无法完全消除 | React 18 Strict Mode 下 Effect 双调用可能导致偶发白屏 | 添加 ErrorBoundary 兜底 |
| B03 后端 API 返回格式 | ActorController 返回 `ActorViewModel` 可能缺少前端需要的字段（如 movieCount） | 先确认 API 返回内容，再决定前端渲染字段 |
| 修改后需验证完整发布 | 前端 tsc + eslint + 后端编译 + build.ps1 | 每阶段完成后执行全量构建验证 |

---

## 九、变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，定义 4 阶段修复路线图 |
| 2026-05-03 | 全部 7 个 BUG 修复完成：4 阶段执行，tsc 0 错误、eslint 0 错误、dotnet build 0 错误 |
