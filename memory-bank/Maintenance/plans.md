# 阶段 D：UX 增强 — 实施方案

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`

---

## D01：Logo 清除筛选回首页

**文件**：`Navbar.tsx`

`<Link to="/">` 添加 onClick 调用 `resetFilters()`：

```tsx
<Link
  to="/"
  className="mr-6 font-bold text-lg"
  onClick={() => useFilterStore.getState().resetFilters()}
>
  JAV Manager
</Link>
```

---

## D02：筛选激活 tag 条

**文件**：新建 `ActiveFiltersBar.tsx`，`AppLayout.tsx` 引入

**显示时机**：筛选面板关闭 + 至少 1 个标签式筛选激活时。

**显示内容**：

| filterStore 字段 | 显示 |
|---|---|
| actors | `{name} ×` |
| genres | `{name} ×` |
| tags | `{name} ×` |
| directors | `{name} ×` |
| studios | `{name} ×` |
| cups | `{cup} Cup ×` |

**不显示**：searchTerm / year 范围 / height 范围 / age 范围 / rating / play 范围 / favoriteOnly / AND / 排序。

点击 `×` 从 filterStore 中移除该项。

---

## D03：一排 6 列海报

**文件**：`MovieGrid.tsx`

**当前**：`≥1536px → 6`，**目标**：`≥1200px → 6`

```
< 500   → 2
< 700   → 3
< 960   → 4
< 1200  → 5
≥ 1200  → 6
```

Loading 骨架屏的 grid 响应式类需同步更新。

---

## D04：详情页主图改为 fanart.jpg

**文件**：`MovieDetail.tsx`

左侧主图从 posterUrl 改为 fanartUrl，容器从 `aspect-[2/3] w-64` 改为 `aspect-video w-full max-w-md`。背景保持 fanart 模糊不变。

---

## D05：筛选面板右侧推入（核心架构改动）

**影响**：`AppLayout.tsx` + `FilterPanel.tsx`

**目标布局**（flex row）：

```
┌── AppLayout (flex row) ────────────────────────┐
│ ┌── flex-1 min-w-0 ──┐ ┌── transition-all ──┐ │
│ │ Navbar              │ │ FilterPanel        │ │
│ │ ActiveFiltersBar    │ │  分组折叠 + Tab    │ │
│ │ <Outlet />          │ │                    │ │
│ └─────────────────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**AppLayout.tsx**：
- 改用 flex row 布局
- 左侧 `flex-1 min-w-0` 放 Navbar + Outlet
- 右侧 `transition-all duration-300`：打开 `w-[480px]`，关闭 `w-0 overflow-hidden`
- filterOpen 状态提升到 AppLayout

**FilterPanel.tsx**：
- 移除 `<Drawer>` / `<DrawerContent>` 包裹
- 改为普通 div，props 改为 `{ onClose: () => void }`
- 保留内部折叠分组 + Tab 结构

**关闭动画**：`transition-all duration-300 ease-in-out`

---

## 涉及文件

| 文件 | D01 | D02 | D03 | D04 | D05 |
|---|---|---|---|---|---|
| Navbar.tsx | +2 | | | | |
| ActiveFiltersBar.tsx（新建） | | +50 | | | |
| MovieGrid.tsx | | | ~10 | | ~5 |
| MovieDetail.tsx | | | | ~5 | |
| AppLayout.tsx | | +3 | | | ~30 |
| FilterPanel.tsx | | | | | ~15 |

---

## 变更记录

| 日期 | 变更 |
|---|---|
| 2026-05-03 | 初始创建，从 phase-d-roadmap 提取详细方案 |
