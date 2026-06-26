# 仓库开发规范

本仓库是静态个人网站 monorepo。AI 或开发者开始任何结构、实现、样式、测试、部署、依赖或内容资产相关工作前，必须先阅读本文件。`规范.md` 保留为简洁摘要；若两者冲突，以本文件为准。修改技术结构、依赖、构建流程或当前状态时，同步更新 `README.md`。

## 1. 项目定位

- 当前重点：`apps/photography` 摄影集网站。
- 后续预留：`apps/home` 主页网站、`apps/resume` 简历网站。
- 站点类型：静态网站，不引入后端、数据库、登录、访问统计或服务端依赖。
- 技术栈：React + Vite + TypeScript + Tailwind CSS，动效使用 Framer Motion。
- 包管理：npm workspace，提交 `package-lock.json`。
- Node：遵循 `.nvmrc` 与根 `package.json` engines。
- 部署：Cloudflare Pages，摄影站配置为 Root directory `apps/photography`，Build command `npm run build`，Output `dist`。

## 2. 工作方式

- 大任务或模糊需求不得一次性直接执行；先澄清目标、边界和验收方式，再拆成可验证的小任务。
- 实施时分步推进，每个关键阶段后运行对应检查。
- 发现需要新增统一规范时，先更新本文件，再按新规范执行。
- 不要回退或覆盖用户未明确要求回退的改动。遇到已有未提交变更，先理解并在其基础上工作。
- 不提交密钥、手机号、身份证、服务器凭据、政府 ID 或其他敏感信息。

## 3. 目录与资产边界

```text
apps/
  photography/   # 当前实现重点
  home/          # 后续主页网站占位
  resume/        # 后续简历网站占位
资源/            # 用户手动管理的外部素材暂存区，不参与构建和版本管理
```

`资源/` 必须被 `.gitignore` 排除。代码、CSS、Markdown、测试、构建脚本和部署配置不得直接引用 `资源/` 路径。网站需要使用其中素材时，必须先复制或生成到项目内资产目录，例如 `apps/photography/public/images/photography/`，再由代码引用。

`apps/photography` 主要结构：

```text
apps/photography/
  public/images/photography/  # 站点实际加载的摄影图片
  scripts/                    # 内容准备与校验脚本
  src/
    data/                     # 摄影作品元数据
    styles/                   # 全局样式
    types/                    # TypeScript 类型
```

## 4. 摄影站当前体验

- 访问根路径直达摄影站主页。
- 页面流程：主页 -> 引导页 -> 展示页。
- 引导页含四个横向滚动主题控件，对应 `暖`、`湛`、`盛`、`郁` 四个资源主题。
- 展示页左侧为目录：摄影集网站简介、四个主题展示、个人简介；右侧为瀑布流图片。
- 点击瀑布流图片打开二级详情界面：一级界面背景虚化，详情左侧为信息，右侧为大图。
- 详情信息使用衬线体；曝光三要素和拍摄日期来自 EXIF 或 `photos.json` 手工补录。
- 缺失 EXIF 时，每个缺失字段显示 `:信息已消失`，并在下方以相同字号显示“不过回忆还在”。
- 视觉方向：米白偏白底色、黑色点缀、克制莫兰第重点色、少量 SVG 装饰；图片是主角，动画保持克制。

## 5. 摄影作品数据

摄影作品元数据位于：

```text
apps/photography/src/data/photos.json
```

每张照片至少包含：

```text
src
alt
width
height
category
title
year
```

当前数据还可包含：

```text
themeSlug
themeSubtitle
themeDescription
date
aperture
shutterSpeed
iso
featured
order
slug
originalFile
optimized
sizeBytes
```

组件必须消费结构化数据，不为单张作品硬编码组件结构。新增或替换作品优先更新图片资产和 `photos.json`。

## 6. 图片处理规则

- 站点图片必须位于 `apps/photography/public/images/photography/`。
- 不提交未经处理且超过约束的大图到站点资产目录。
- 当前单张站点图片大小必须不超过 15MB。
- 使用 `npm --workspace @personal-websites/photography run prepare:photos` 从 `资源/摄影图片` 生成站点图片和元数据。
- `prepare:photos` 规则：不超过 15MB 的源图不压缩，只复制；超过 15MB 的源图使用低损失 JPEG 参数压缩到 15MB 以内。
- `prepare:photos` 会读取四个主题文件夹：`暖`、`湛`、`盛`、`郁`。
- 图片尺寸必须写入元数据，避免布局跳动。
- 非首屏图片应 lazy loading。
- 所有可见摄影作品必须有有意义的 `alt`，不得使用空泛描述。

## 7. 可访问性与 SEO

- 交互元素使用语义化 HTML，按钮用 `<button>`，链接用 `<a>`。
- 图片详情弹层必须支持 Escape 关闭、关闭按钮聚焦、焦点可见、移动端可用。
- 动效必须尊重 `prefers-reduced-motion`。
- 页面需保留基础 SEO：标题、描述、favicon、Open Graph 图片。
- 移动端必须重点检查图库布局、横向引导控件、目录和详情弹层。

## 8. 代码风格

- TypeScript 保持 strict。
- React 使用函数组件、typed props 和清晰的数据流。
- 组件名使用 `PascalCase`，hooks 和普通函数使用 `camelCase`。
- 类型放在 `src/types/`，共享数据放在 `src/data/`。
- Tailwind class 保持局部、可读；只有真实复用时再抽象。
- 注释只写能降低理解成本的内容，不写空泛叙述。

## 9. 常用命令

优先从仓库根目录运行：

```bash
npm install
npm run dev:photography
npm --workspace @personal-websites/photography run prepare:photos
npm run validate:photos
npm run typecheck:photography
npm run build:photography
```

也可在 `apps/photography` 内运行：

```bash
npm run dev
npm run prepare:photos
npm run validate:photos
npm run typecheck
npm run build
```

最低质量门槛：

```bash
npm run validate:photos
npm run typecheck:photography
npm run build:photography
```

`npm run test` 仅在 Vitest 配置后要求通过。

## 10. 文档维护

- 修改结构、依赖、构建流程、开发命令、部署方式或当前状态时，同步更新 `README.md`。
- 修改统一开发规则时，同步更新本文件，并保持 `规范.md` 为简洁摘要。
- PR 或交付说明需列出可见变化和已运行的验证命令。

## 11. 提交规则

- 提交信息使用简洁祈使句，例如 `Build photography showcase`。
- 提交前检查 `git status`，确认没有意外文件。
- 不要把 `资源/`、`node_modules/`、`dist/`、本地 env 或日志提交进仓库。
