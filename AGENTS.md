# 仓库开发规范

本仓库当前是长期维护的静态摄影作品集网站。AI 或开发者开始任何结构、实现、样式、测试、部署、依赖或内容资产相关工作前，必须先阅读本文件。本文件是当前唯一的仓库开发规范入口。

## 1. 项目定位

- 当前唯一站点：`apps/photography`。
- 不新增主页站、简历站、后台、数据库、登录、访问统计或服务端依赖。
- 技术栈：React + Vite + TypeScript + Tailwind CSS + Framer Motion。
- 包管理：npm workspace，提交 `package-lock.json`。
- Node：遵循 `.nvmrc` 与根 `package.json` engines。
- 部署：Cloudflare Pages，Root directory 为 `apps/photography`，Build command 为 `npm run build`，Output 为 `dist`。

## 2. 固定工作流

1. 先澄清需求：目标、非目标、影响范围、验收标准。
2. 读取相关文件：优先看 `AGENTS.md`、入口、类型、数据和目标组件。
3. 拆分任务：结构、数据、样式、交互、脚本、验证分别处理。
4. 编码实现：遵循现有架构，不把临时逻辑塞回 `App.tsx`。
5. 验证纠错：至少运行与改动相关的检查，功能性改动优先跑 `npm run check:photography`。
6. 移动端复核：涉及 UI 时必须检查 320 / 390 / 430 / 1440 视口。
7. 提交前复核：`git status --short`，确认没有混入 `资源/`、`dist/`、日志或缓存。
8. 验证通过后提交，提交信息使用中文，并带版本号。

## 3. 目录与依赖边界

```text
apps/
  photography/                 # 唯一活跃站点
资源/                          # 用户手动管理的外部素材，不参与构建和版本管理
```

`资源/` 必须被 `.gitignore` 排除。代码、CSS、Markdown、测试和构建配置不得直接引用 `资源/`。需要使用素材时，先通过脚本生成到 `apps/photography/public/images/photography/`。

```text
apps/photography/
  public/images/photography/   # 站点实际加载图片
  scripts/
    prepare-photos.mjs         # 从资源目录生成站点图片与元数据
    diff-photos.mjs            # 只检查资源、public、photos.json 的差异
    validate-photos.mjs        # 校验元数据、图片尺寸、路径、大小和重复
  src/
    App.tsx                    # 兼容入口，只导出 PhotographyApp
    main.tsx
    app/                       # 应用状态编排与视图状态
    views/                     # 页面级结构：Home、Guide、Showcase
    patterns/                  # 组合能力：瀑布流、渐进图片、详情弹层、主题轨道
    components/                # 小型可复用控件
    data/                      # photos.json、themes.ts
    lib/                       # 图片、数据、预加载等纯逻辑
    motion/                    # reduced motion 与动效工具
    styles/                    # 全局样式
    types/                     # TypeScript 类型
```

依赖方向：`app -> views -> patterns -> components/lib/data/types`。禁止 `components` 依赖 `views`，禁止 `lib` 依赖 UI，禁止组件硬编码单张照片。

## 4. 摄影站体验要求

- 页面流程：主页 -> 引导页 -> 展示页 -> 图片详情弹层。
- 四个主题：`暖 / Apricity`、`湛 / Azure`、`盛 / Lush`、`郁 / Pall`。
- 展示页桌面端保留目录与三列瀑布流；移动端使用顶部主题轨道与两列瀑布流，不做桌面侧栏压缩版。
- 图片详情弹层：背景虚化，桌面左右布局，移动端优先保证大图、关闭和切换按钮可触达。
- 缺失 EXIF 字段显示 `已消失`，并显示“不过回忆还在”。
- 视觉方向：米白底、黑色结构线、克制莫兰第重点色，照片是主角，动效克制。

## 5. 数据与图片流程

摄影元数据位于 `apps/photography/src/data/photos.json`。主题集中在 `apps/photography/src/data/themes.ts`。每张照片至少包含：

```text
src
alt
width
height
category
title
year
themeSlug
themeSubtitle
themeDescription
slug
```

照片添加、删除或替换流程：

```bash
npm run diff:photos
npm run prepare:photos
npm run validate:photos
```

- `diff:photos` 只报告，不改文件，用于确认资源变化。
- `prepare:photos` 从 `资源/摄影图片` 生成站点图片和 `photos.json`。
- `validate:photos` 校验路径、尺寸、大小、slug、重复、主题代号和 public 引用。
- 当前单张站点主图和预览图都必须不超过 5MB；`prepare:photos` 会统一以高保真 JPEG 重编码并在必要时等比缩放，不能绕过脚本手动放入未压缩大图。
- 所有可见照片必须有具体、有意义的 `alt`。

## 6. 代码风格

- TypeScript 保持 `strict`。
- React 使用函数组件、typed props、清晰单向数据流。
- 组件名使用 `PascalCase`，hooks 和普通函数使用 `camelCase`。
- 页面结构放 `views/`，组合交互放 `patterns/`，小控件放 `components/`。
- 可派生数据在 render 或 `useMemo` 中派生，不用 effect 存重复状态。
- effect 必须有清理逻辑，键盘监听、滚动锁定、预加载都应集中在对应 pattern/lib。
- Tailwind class 保持局部、可读；只有真实复用时再抽象。
- 注释只写能降低理解成本的内容。

## 7. 移动端与可访问性

- UI 改动必须检查 320 / 390 / 430 / 1440 视口。
- 移动端不得出现横向页面溢出，除明确设计的内部横向滚动控件外。
- 触控目标最小 44px。
- 交互元素使用语义化 HTML：按钮用 `<button>`，跳转用 `<a>`。
- 详情弹层必须支持 Escape 关闭、左右方向键切换、关闭按钮聚焦、关闭后焦点回到触发图片。
- 动效必须尊重 `prefers-reduced-motion`。
- 页面保留基础 SEO：标题、描述、favicon、Open Graph 图片。

## 8. 常用命令

优先从仓库根目录运行：

```bash
npm install
npm run dev:photography
npm run diff:photos
npm run prepare:photos
npm run validate:photos
npm run typecheck:photography
npm run build:photography
npm run check:photography
```

`npm run check:photography` 是提交前固定验收入口：

```bash
npm run diff:photos
npm run validate:photos
npm run typecheck:photography
npm run build:photography
```

本地开发端口优先使用项目脚本；需要指定端口时使用 `5710-5720` 范围，优先 `5710`。

## 9. 验证要求

- 文档或纯注释变更：读取复核，必要时运行 `git diff --check`。
- 类型、组件、数据流变更：运行 `npm run typecheck:photography`。
- 图片、资源、`photos.json`、脚本变更：运行 `npm run diff:photos` 与 `npm run validate:photos`。
- 功能性或结构性变更：运行 `npm run check:photography`。
- UI 或交互变更：除固定验收外，使用浏览器或 Playwright 检查 320 / 390 / 430 / 1440 视口，无横向溢出、重叠、按钮不可触达或弹层失焦。
- 若某项验证无法运行，交付说明必须写明原因和替代检查。

## 10. 提交规则

- 提交信息固定格式为 `vX.XX：提交内容`，例如 `v1.03：重写仓库开发规范`。
- 版本号按提交顺序递增；如上一次为 `v1.03`，下一次使用 `v1.04`。
- 提交前运行 `git status --short`，只暂存本次需求相关文件。
- 不提交 `资源/`、`node_modules/`、`dist/`、本地 env、日志、缓存或临时截图。
- 不回退用户未要求回退的改动；遇到未提交变更，先理解再协同处理。
