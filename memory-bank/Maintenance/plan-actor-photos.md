# 演员头像方案

> 项目路径：`D:\Personal_file\VibeCoding\Program\JAV_MovieManager_v2`
>
> 基于用户反馈：原项目演员头像来自本地目录，用户在设置中配置路径。

---

## 一、需求

1. Actors 页面每个演员卡片显示头像缩略图
2. 用户在 Settings 中配置演员头像目录路径
3. 点击演员可跳转首页并只显示该演员的影片

---

## 二、数据来源

原项目流程：
- 爬虫下载演员的头像图片到某个本地目录
- 用户在设置中填写演员头像目录路径
- 展示时根据演员名匹配目录中的 `.jpg` 文件

本方案沿用此模式，使用命名约定：头像文件名 = 演员名.jpg（如 `蒼井そら.jpg`）

---

## 三、后端改动

### 3.1 新建设置项 `ActorPhotoDirectory`

UserSettings 表新增 key：`ActorPhotoDirectory`，值为演员头像目录的本地路径。

### 3.2 ImageController 新增接口

```
GET /api/images/actor/{name}
```

逻辑：
1. 查 UserSettings 中 `ActorPhotoDirectory` 的值
2. 拼接路径：`{ActorPhotoDirectory}/{name}.jpg`
3. 检查文件是否存在，存在则 ServeImage，不存在返回 NoContent

**文件**：`jav-manager-api/Controllers/ImageController.cs`，新增约 15 行。

---

## 四、前端改动

### 4.1 Settings 增加头像目录配置

SettingsViewer 中增加 Actor Photo Directory 输入框。

**文件**：
- `SettingsViewer.tsx`：新增 `actorPhotoDirectory` 字段（Zod schema + Controller + 保存逻辑）
- `settingsService.ts`：useSaveSettings 已支持任意 key-value，无需修改

### 4.2 ActorGrid 卡片增加头像

每个 actor 卡片渲染 `<img src="/api/images/actor/{name}" />`，失败时显示默认头像占位。

**文件**：
- `ActorGrid.tsx`：约 5 行改动

### 4.3 演员卡片点击 → 筛选该演员的影片

点击后：`filterStore.setFilter("actors", [actor.name])` → `navigate("/")`。

首页的 filterStore 会立即生效（B07 已修复），自动显示该演员参演的影片。

**文件**：
- `ActorGrid.tsx`：约 3 行改动

---

## 五、改动量估计

| 层 | 文件 | 改动 |
|---|---|---|
| 后端 API | `ImageController.cs` | +15 行 |
| 后端 Settings | 无需代码改动（Key-Value 模式） | 0 |
| 前端 Settings | `SettingsViewer.tsx` | +10 行 |
| 前端 Actors | `ActorGrid.tsx` | +10 行 |
| **合计** | 3 文件 | ~35 行 |

---

## 六、依赖与注意事项

- 依赖用户在 Settings 中配置了正确的头像目录
- 头像文件名必须与 Actor.Name 完全匹配（含特殊字符时需确认文件系统兼容性）
- 无头像的演员显示白色占位圆或默认图标
- 爬虫下载头像的功能属于后续阶段（需要 ScrapeService 增加头像下载逻辑）
