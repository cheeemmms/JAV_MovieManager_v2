# 筛选面板（FilterPanel）改进方案

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 基于用户反馈"filters适配有问题，建议重制"及后续讨论，提出以下改进方案。

---

## 一、当前问题诊断

| # | 问题 | 详细说明 |
|---|---|---|
| 1 | **线性滚动太长** | 14 个控件顺次堆叠，用户必须滚动很久才能找到目标控件 |
| 2 | **宽度偏窄** | 400px 下 Slider 标签+数值拥挤，Cup Size A-K 按钮换行占大量空间 |
| 3 | **无分组层级** | Genres / Tags / Directors / Studios 四个 MultiSelect 各占一行，视觉权重相同，没有"基础筛选 vs 高级筛选"的概念 |
| 4 | **无筛选反馈** | 用户不知道当前筛选条件匹配了多少影片，也没有显式"应用"按钮 |
| 5 | **Drawer 方向不标准** | `direction="right"` 不是 shadcn/ui Drawer 的 prop（vaul 底层支持但非标准），实际可能被忽略 |
| 6 | **占满高度** | Drawer 从顶到底覆盖全屏高度，close 按钮和底部 Reset 间距太远 |

---

## 二、改进后的布局

```
┌─ Filters ───────────────────────────────── 480px ─┐
│ 24 movies match                                      │  ← 实时计数
│─────────────────────────────────────────────────────│
│ ▼ Basic                        (default expanded)    │
│   ┌─────┬─────┬─────┬──────┐                        │
│   │Genres│Tags │Direct│Studio│  ← Tab 切换，同一区域  │
│   └─────┴─────┴─────┴──────┘                        │
│   [HD] [SI] [NS] [+ 5 more...]                      │  ← 只显示前 8 个，超出折叠
│─────────────────────────────────────────────────────│
│ ▼ Actors                       (default expanded)    │
│   🔍 Search actors...                                │
│   [蒼井] × [波多] ×                                  │  ← 已选标签
│─────────────────────────────────────────────────────│
│ ▼ Actor Body                   (collapsed)           │
│   Height: 140cm ───●─── 180cm                        │
│   Cup: [A][B][C][D][E][F][G][H][I][J][K]             │
│   Age:   18 ───●─── 60                               │
│─────────────────────────────────────────────────────│
│ ▼ More Filters                 (collapsed)           │
│   Year:   1980 ───●─── 2026                          │
│   Rating: ★────●────★ (0-10)                         │
│   Plays:  0 ───●─── 50                               │
│   ☑ Favorites only                                   │
│─────────────────────────────────────────────────────│
│ ▼ Sort                         (collapsed)           │
│   [Date Added] [Year] [Title] [Rating] [Plays]       │
│   ↑ Desc                                              │
│─────────────────────────────────────────────────────│
│ 📂 Saved Filters                                     │
│   [My Favorites] ×  [HD Only] ×                      │
├─────────────────────────────────────────────────────┤
│  24 of 230 movies              [Reset] [Apply]        │
└─────────────────────────────────────────────────────┘
```

---

## 三、各模块改进细节

### 3.1 实时计数横幅

Drawer 顶部显示当前筛选条件下匹配的影片数，替代原来的描述文字。

- **实现**：FilterPanel 内部维护 `matchCount` 状态，FilterStore 变化时 POST `/api/movies/filter` 只取 `totalCount`（不取 items），debounce 300ms
- **或者更轻量**：直接用 TanStack Query `useInfiniteQuery` 的 `data.pages[0].totalCount`（需要缩短 staleTime）

### 3.2 Basic — Tab 切换四维度

当前 Genres / Tags / Directors / Studios 是四个独立 MultiSelect，各自占一整个区域。改为 Tab 切换：

```
┌───┬───┬───┬───┐
│Genres│Tags│Dir.│Stud.│
├───┴───┴───┴───┤
│ [HD] [SI] ...  │   ← 选中 Tab 对应的选项按钮云
└───────────────┘
```

- 每个 Tab 下显示该维度的前 N 个常用选项（按影片数量排序）
- 每个选项显示为可点选的 chip/tag 按钮，已选中高亮
- 选项超过 N 个时显示 "... +X more" 展开按钮
- Tab 标签上显示已选数（如 "Genres (3)"）

### 3.3 Actors — ActorSearch + 已选标签

ActorSearch 保持当前 cmdk 搜索方式，已选演员显示为可删除的 tag：

```
🔍 Search actors...
[x 蒼井そら] [x 波多野結衣] [+ Add...]
```

### 3.4 Actor Body — 演员身体属性（默认折叠）

将 Height / Cup / Age 归入一组，折叠以减少视觉噪音：

- Height Range（双端 Slider）
- Cup Size（A-K 按钮云）
- Age Range（双端 Slider）

### 3.5 More Filters — 高级筛选（默认折叠）

将 Year / Rating / Plays / Favorites / AND 归入一组：

- Year Range（双端 Slider）
- Min Rating（单端 Slider）
- Play Count（双端 Slider）
- Favorites Only（Checkbox）
- Match all filters / AND（Checkbox）

### 3.6 Sort — 独立区域（默认折叠）

Sort By 按钮组 + 升降序切换，从当前混杂在选项列表中独立出来。

### 3.7 Saved Filters

保持现有功能（localStorage 保存/加载），UI 精简为横向排列的 chip 标签。

### 3.8 底部操作栏

```
24 of 230 movies      [Reset] [Apply]
```

- `24 of 230`：实时显示匹配影片数 / 总影片数
- `[Apply]`：关闭 Drawer（关闭时触发 invalidateQueries）
- `[Reset]`：重置所有筛选 + 关闭

---

## 四、交互行为变更

| 行为 | 当前 | 改进后 |
|---|---|---|
| 筛选生效时机 | 关闭 Drawer 时 | 关闭 Drawer 时（不变） |
| 匹配数反馈 | 无 | 底部实时显示 |
| 控件分组 | 无（平铺） | 5 组折叠面板（2 展开 + 3 折叠） |
| 四维度选择器 | 各占独立区域 | Tab 切换，节省 75% 空间 |
| Drawer 宽度 | 400px | 480px |
| 内容滚动 | 整面板滚 | 每折叠组独立，滚动区缩小 |

---

## 五、技术实现要点

### 5.1 折叠面板组件

复用项目已有的 shadcn/ui 组件或手写轻量 Accordion：

```tsx
{/* 轻量折叠——用 details/summary 或 useState 控制 */}
const [sections, setSections] = useState({
  basic: true,
  actors: true,
  body: false,
  more: false,
  sort: false,
})
```

### 5.2 Tab 切换四维度

新建一个 `DimensionTabs` 小型组件，包含 4 个 Tab 按钮 + 对应的按钮云。

### 5.3 匹配计数

**方案 A（轻量）**：FilterPanel 关闭时已触发 invalidateQueries，MovieGrid 重新请求，自然拿到 totalCount。不做额外请求。

**方案 B（实时）**：useEffect 监听 filterStore 变化，debounce 300ms → POST `/api/movies/filter` 仅 `pageSize=0` 只取 `totalCount`。

推荐方案 A（简单，避免额外 API 请求压力），底部计数从 MovieGrid 的 `data.pages[0].totalCount` 读。

### 5.4 Drawer 兼容

移除 `direction="right"` prop。shadcn/ui 的 Drawer 默认从底部弹出。如需右侧 Drawer，可改用 Sheet 组件（如果项目有）或手动 CSS。

---

## 六、改动文件清单

| 文件 | 改动 | 预估量 |
|---|---|---|
| `FilterPanel.tsx` | 重写布局结构（折叠面板 + Tab） | ~200 行 |
| 新建 `DimensionTabs.tsx` | 四维度 Tab 切换组件 | ~50 行 |
| `MultiSelect.tsx` | 精简、改为按钮云样式 | ~20 行 |
| `ActorSearch.tsx` | 已选标签样式微调 | ~5 行 |
| **合计** | 3 文件 + 1 新建 | ~275 行 |

---

## 七、不做的改进（后续考虑）

| 功能 | 原因 |
|---|---|
| AND/OR 逻辑切换的实际后端支持 | 后端需要重写筛选 SQL，工作量较大 |
| 筛选预览（Drawer 不关闭即展示结果） | 增加复杂度且可能性能差 |
| 可视化日期范围选择器 | 非核心需求 |
