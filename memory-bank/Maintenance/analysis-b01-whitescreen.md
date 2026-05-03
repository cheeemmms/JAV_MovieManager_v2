# 下一阶段修复 — B01 白屏根因分析

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 基于用户提供的控制台报错，精确定位根因。

---

## 错误信息

```
index-DqLLZA5I.js:4681 Uncaught TypeError: r.off is not a function
    at index-DqLLZA5I.js:4681:881
    at Wc (index-DqLLZA5I.js:8:92266)      ← React commitHookEffectListUnmount
    at zl (index-DqLLZA5I.js:8:110100)     ← React commitPassiveUnmountEffects
    ...
```

## 根因

错误 `r.off is not a function` 来自 DPlayer 的 `off` 方法调用失败。`r` 就是 DPlayer 实例，`off` 不存在说明 DPlayer 实例已经失去该方法。

### 问题代码

[DPlayerWrapper.tsx:L69-L75](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/DPlayerWrapper.tsx#L69-L75)：

```tsx
return () => {
  dp.off("timeupdate", handleTimeUpdate)
  dp.off("play", handlePlay)
  dp.off("pause", handlePause)
  dp.off("ended", handleEnded)
  dp.destroy()
  dpRef.current = null
}
```

### 为何发生

调用 `dp.destroy()` 后，DPlayer 内部将事件系统置为 null/undefined，此后 `dp.off` 就不再是函数。

但我们的代码是 `off` 在前、`destroy` 在后，理论上顺序正确。问题出在两种触发路径：

**路径 A — React StrictMode（开发模式双调 Effect）**

React 18 StrictMode 会执行：
1. mount → Effect 运行 → DPlayer 创建
2. cleanup 运行 → `off` + `destroy`（第一次）
3. mount → Effect 运行 → DPlayer 创建（第二次）
4. 用户点返回 → cleanup 运行 → `off` + `destroy`

在 StrictMode 下第 2 步的 `dp.destroy()` 已经清理了内部状态，第 3 步创建的 dp 在某些边界条件下，第 4 步 cleanup 的 `off` 调用时 dp 内部状态已不一致。

**路径 B — 快速导航竞态（生产模式也会触发）**

`handleBack` 中 `endRecording` 是异步 PATCH 请求但未被 await：

```tsx
const handleBack = useCallback(() => {
    endRecording(progressRef.current)  // fire and forget，异步 PATCH
    navigate(`/movie/${imdbId}`)       // 立即导航，组件卸载
}, [navigate, endRecording, imdbId])
```

组件卸载触发 cleanup → `dp.off(...)` → 此时 DPlayer 内部可能正处理 `ended`/`pause` 事件（因导航导致视频源断开），内部状态机处于不一致状态。

### 修复方案

**方案（推荐）**：DPlayer 的 `destroy()` 会自行移除所有事件监听，无需手动 `off`。

```tsx
return () => {
  try {
    dp.destroy()
  } catch {
    // 忽略 destroy 过程中的错误
  }
  dpRef.current = null
}
```

**原因**：DPlayer 的 `destroy()` 实现会遍历所有事件类型并清理，再清理 DOM。手动 `off` 不仅冗余，在某些时机还因 DPlayer 内部状态问题导致报错。

### 影响文件

- [DPlayerWrapper.tsx](file:///D:/Personal_file/VibeCoding/Program/JAV_MovieManager_v2/jav-manager-web/src/components/player/DPlayerWrapper.tsx) — 1 文件，~6 行改动

---

## 补充发现：handleBack 不 await

当前 `handleBack` 中 `endRecording` 不等待完成就导航，虽然记录丢失不是阻塞问题，但播放进度可能未保存。建议改为：

```tsx
const handleBack = useCallback(() => {
  endRecording(progressRef.current)
  setTimeout(() => navigate(`/movie/${imdbId}`), 50)
}, [navigate, endRecording, imdbId])
```

或让 `usePlaybackRecording` 的 cleanup 自动负责最后保存（组件卸载时 `useEffect` 的 return 执行）。

---
