# 个人网站项目说明

本文档面向项目所有者，用来 review 当前仓库状态、文件结构、依赖关系、开发命令和部署方式。AI 开发执行规则放在 `AGENTS.md` 和 `规范.md`；如果两者与 README 有冲突，以 `规范.md` 为开发执行依据。

## 1. 项目定位

这是一个静态个人网站 monorepo，后续计划包含三个独立网站：

```text
主页网站
摄影集网站
简历网站
```

当前只开发摄影集网站。主页网站和简历网站暂时只保留占位目录，避免第一版范围过大。

第一版的目标是先完成一个可维护、可构建、可部署的摄影集网站骨架：

- 用结构化数据维护摄影作品。
- 用 React 组件组织页面、分类筛选、图库和图片查看器。
- 用 Vite 输出静态文件，部署到 Cloudflare Pages。
- 不引入后端、数据库、登录系统或访问统计。

## 2. 当前 Git 与仓库形态

当前工作目录是一个 Git worktree：

```text
C:\Users\tgs27\.codex\worktrees\2cdd\2026_6_26_webdesign
```

仓库远端：

```text
origin  git@github.com:welldone987/webdesign.git
```

当前代码按 monorepo 组织：

```text
personal-websites/
  apps/
    photography/   # 当前主要开发对象
    home/          # 后续主页网站占位
    resume/        # 后续简历网站占位
  AGENTS.md
  规范.md
  README.md
  package.json
  package-lock.json
  .nvmrc
  .gitignore
```

## 3. 根目录文件说明

```text
AGENTS.md
```

AI 开发入口说明。核心要求是：开始任何结构、实现、样式、测试、部署或依赖相关工作前，必须先阅读 `规范.md`。

```text
规范.md
```

项目计划和开发执行规范。包含技术栈、目录约定、数据结构、图片要求、质量门槛、部署方式、安全要求等，是当前仓库最重要的执行文档。

```text
README.md
```

面向项目所有者的说明文档，用于快速 review 项目结构、依赖关系、构建流程和当前状态。修改技术结构、依赖或构建流程时应同步更新本文档。

```text
package.json
```

根目录 npm workspace 配置和跨应用脚本。目前 workspace 范围是 `apps/*`。

```text
package-lock.json
```

npm 锁文件，用于固定依赖解析结果，保证本地和 Cloudflare Pages 构建尽量一致。

```text
.nvmrc
```

Node.js 版本锁定文件。当前版本为：

```text
24.18.0
```

根目录 `package.json` 同时声明：

```json
{
  "engines": {
    "node": ">=24 <25",
    "npm": ">=11"
  }
}
```

## 4. apps 目录说明

```text
apps/
  photography/
  home/
  resume/
```

`apps/photography` 是当前已初始化并开发中的摄影集网站。

`apps/home` 目前只有 `README.md`，用于占位后续主页网站。后续主页网站预计作为统一入口，跳转到摄影集网站和简历网站。

`apps/resume` 目前只有 `README.md`，用于占位后续简历网站。后续简历网站会独立维护，不和摄影集网站混在同一个页面中。

三个网站后续可以作为三个独立 Cloudflare Pages 项目部署：

```text
apps/home        -> www.example.com
apps/photography -> photo.example.com
apps/resume      -> resume.example.com
```

## 5. 摄影站目录结构

当前摄影站实际结构如下：

```text
apps/photography/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  vite.config.ts
  scripts/
    prepare-photos.mjs
    validate-photos.mjs
  public/
    favicon.svg
    og-image.svg
    images/
      photography/
        warm/
          preview/
        azure/
          preview/
        bloom/
          preview/
        umbrage/
          preview/
  src/
    App.tsx
    main.tsx
    data/
      photos.json
    styles/
      globals.css
    types/
      photography.ts
```

## 6. 摄影站入口文件

```text
apps/photography/index.html
```

Vite HTML 入口。当前包含：

- `lang="zh-CN"`
- viewport 设置
- 页面 description
- Open Graph 标题、描述、类型和图片
- favicon
- React 挂载节点 `#root`
- `/src/main.tsx` 脚本入口

```text
apps/photography/src/main.tsx
```

React 入口文件，负责挂载 `App`，并引入全局样式。

```text
apps/photography/src/App.tsx
```

摄影站主组件，负责组织三段式摄影集体验和页面数据流：

```text
photos.json
  ↓
Photo[]
  ↓
计算四个主题 themes
  ↓
根据 activeThemeSlug 过滤当前主题或全部图片
  ↓
渲染主页 / 引导页 / 展示页 / 二级图片详情界面
```

`App.tsx` 当前维护三个主要状态：

```text
view             当前页面阶段：home / guide / showcase
activeThemeSlug  当前展示主题，支持 all 表示全部图片
selectedPhoto    当前打开详情界面的照片，默认为 null
```

## 7. 摄影站体验说明

当前摄影站入口由 `App.tsx` 组织为：

- 主页：展示摄影集标题和四个主题封面。
- 引导页：横向滚动选择四个主题，主题英文分别为 Apricity、Azure、Lush、Penumbra。
- 展示页：左侧目录包含摄影集简介、呈现、全部图片、个人简介；右侧使用瀑布流展示当前主题或全部图片。
- 二级图片详情界面：点击瀑布流图片打开，背景虚化，左侧显示标题和 EXIF 信息，右侧显示留白包裹的大图。

详情界面当前行为：

- 打开时使用 `role="dialog"` 和 `aria-modal="true"`。
- 自动聚焦关闭按钮。
- 支持 Escape 关闭，并支持左右方向键在当前图库内切换上一张/下一张。
- 左右切换按钮使用方形轮廓；首张隐藏上一张按钮，末张隐藏下一张按钮。
- 瀑布流先加载 900px 预览图和 LQIP 占位图，详情页先显示预览图，再淡入覆盖完整大图。
- 缺失 EXIF 字段显示 `已消失`，并显示“不过回忆还在”。
- 不显示图片原始文件名。
- 二级详情界面按图片方向只保留横构图、竖构图两种比例；竖图沿用较高展示比例，横图使用更收敛的卡片和图片尺寸。
- 图片四边保留白边。

## 8. 数据结构

摄影作品元数据放在：

```text
apps/photography/src/data/photos.json
```

当前是真实摄影作品数据，共 54 张，按四个主题组织：

```text
暖 17 张
湛 21 张
盛 9 张
郁 7 张
```

每张照片至少需要以下字段：

```text
src       图片路径
alt       有意义的图片替代文本
width     图片宽度，数字
height    图片高度，数字
category  分类
title     标题
year      年份，数字
```

当前类型定义在：

```text
apps/photography/src/types/photography.ts
```

类型如下：

```ts
export type Photo = {
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
  previewWidth?: number;
  previewHeight?: number;
  category: string;
  themeSlug: string;
  themeSubtitle: string;
  themeDescription: string;
  title: string;
  year: number;
  date?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  location?: string;
  featured?: boolean;
  order?: number;
  slug?: string;
  originalFile?: string;
  placeholder?: string;
  optimized?: boolean;
  sizeBytes?: number;
  previewSizeBytes?: number;
};
```

可选字段说明：

```text
themeSlug         主题标识
themeSubtitle     主题英文词
themeDescription  主题说明
previewSrc        瀑布流预览图路径，当前由 prepare:photos 生成
previewWidth      预览图宽度
previewHeight     预览图高度
placeholder       极小 Base64 LQIP 占位图
date              拍摄日期
aperture          光圈
shutterSpeed      快门
iso               感光度
location          拍摄地点
featured          是否作为主题封面候选
order             排序字段
slug              作品唯一标识
originalFile      源文件名，仅用于维护，不在详情界面显示
optimized         是否经过压缩
sizeBytes         站点图片大小
previewSizeBytes  预览图大小
```

新增摄影作品时，优先改两类文件：

```text
apps/photography/public/images/photography/
apps/photography/src/data/photos.json
```

不应为了新增单张作品去修改组件结构。

## 9. 照片校验脚本

校验脚本位于：

```text
apps/photography/scripts/validate-photos.mjs
```

它会读取：

```text
apps/photography/src/data/photos.json
```

当前检查项：

- `photos.json` 必须是数组。
- 每张照片必须包含 `src`、`alt`、`width`、`height`、`category`、`title`、`year`。
- `width` 和 `height` 必须是数字。
- 图片路径必须指向 `public/images/photography/`。
- 如果存在 `previewSrc`，预览图路径必须指向 `public/images/photography/`，且 `previewWidth`、`previewHeight` 必须是数字。
- 如果存在 `placeholder`，必须是 `data:image/` 开头的 data URL。
- 单张站点图片不得超过 15MB。
- 如果存在 `slug`，则所有 `slug` 必须唯一。
- 实际图片文件内容不得重复，避免同一张图片出现在多个主题。

运行命令：

```bash
npm run validate:photos
```

或在摄影站目录内运行：

```bash
npm run validate:photos
```

通过时会输出类似：

```text
Validated 54 photo records.
```

## 10. 样式与视觉实现

当前样式方案：

```text
Tailwind CSS       主要页面样式
globals.css        全局基础样式
Framer Motion      页面和图片交互动效
```

相关文件：

```text
apps/photography/tailwind.config.js
apps/photography/postcss.config.js
apps/photography/src/styles/globals.css
```

Tailwind 扫描范围：

```text
./index.html
./src/**/*.{ts,tsx}
```

视觉上当前以摄影作品为主体，使用米白偏白底色、黑色点缀、克制莫兰迪重点色和轻量动效。主题中文保持高不透明度，英文以约一半字号和更低不透明度作为辅助标识。

四个主题强调色作为后续统一色彩来源：

```text
暖  accent #C99567  soft #EBD7BF
湛  accent #7F9FB0  soft #D7E4E9
盛  accent #8F9F76  soft #DEE7D2
郁  accent #8F8B84  soft #E0DDD7
```

## 11. 技术栈与依赖

摄影站运行时依赖：

```text
react
react-dom
framer-motion
```

开发和构建依赖：

```text
@vitejs/plugin-react
vite
typescript
tailwindcss
postcss
autoprefixer
@types/react
@types/react-dom
sharp
exifr
```

依赖声明位置：

```text
apps/photography/package.json
```

依赖锁定位置：

```text
package-lock.json
```

## 12. 常用命令

建议优先在仓库根目录运行命令。

安装依赖：

```bash
npm install
```

启动摄影站本地开发服务器：

```bash
npm run dev:photography
```

开发服务器固定为：

```text
http://127.0.0.1:5174/
```

如果该端口已有旧服务占用，先结束旧的 5174 端口进程，再重新运行开发命令。

从 `资源/摄影图片` 生成站点图片和照片元数据：

```bash
npm --workspace @personal-websites/photography run prepare:photos
```

校验照片元数据：

```bash
npm run validate:photos
```

运行摄影站 TypeScript 检查：

```bash
npm run typecheck:photography
```

构建摄影站：

```bash
npm run build:photography
```

也可以进入 `apps/photography` 目录运行应用内命令：

```bash
npm install
npm run dev
npm run prepare:photos
npm run validate:photos
npm run typecheck
npm run build
npm run preview
```

当前尚未配置 Vitest，因此 `npm run test` 不是第一版必跑命令。

## 13. 构建流程

摄影站构建流程：

```text
src/ 源码
  + public/ 静态资源
  + src/data/photos.json 照片元数据
  + Tailwind 样式
        ↓
Vite build
        ↓
apps/photography/dist/
        ↓
Cloudflare Pages 部署 dist/
```

`dist/` 是构建产物，不是主要编辑对象。正常开发时修改：

```text
apps/photography/src/
apps/photography/public/
apps/photography/package.json
```

然后重新校验和构建。

## 14. Cloudflare Pages 部署配置

当前摄影站部署配置应为：

```text
Framework preset: Vite
Root directory: apps/photography
Build command: npm run build
Build output directory: dist
Node.js version: 24.18.0
```

第一版先使用 Cloudflare Pages 默认域名。后续绑定个人域名后，再将三个网站分别映射到不同子域名。

当前不单独配置 GitHub Actions，优先使用 Cloudflare Pages 的 Git 集成自动构建部署。

## 15. 更新摄影作品的流程

新增或替换摄影作品时，建议按这个顺序处理：

1. 将源图放入根目录 `资源/摄影图片/暖`、`湛`、`盛`、`郁` 对应主题文件夹。
2. 运行 `npm --workspace @personal-websites/photography run prepare:photos`。
3. 脚本会输出 `apps/photography/public/images/photography/`、各主题 `preview/` 子目录和 `apps/photography/src/data/photos.json`。
4. 超过 15MB 的源图会用低损失 JPEG 参数压缩到 15MB 以内；不超过 15MB 的源图不压缩。
5. 脚本会为每张图生成最长边约 900px 的预览图和极小 Base64 LQIP 占位图。
6. EXIF 缺失时，详情页会在对应字段显示 `已消失`，并显示“不过回忆还在”。
7. 如需更精确标题、alt、日期或曝光信息，可在 `photos.json` 中手工补录。
8. 运行 `npm run validate:photos`。
9. 运行 `npm run typecheck:photography`。
10. 运行 `npm run build:photography`。

`资源/` 是外部素材暂存区，不参与构建和版本管理。站点只引用复制到 `public/` 下的文件。

## 16. Review 时重点看什么

结构 review：

- 文件是否放在预期目录。
- 新增网站是否位于 `apps/<site>/`。
- 摄影站内容是否仍由 `photos.json` 驱动。
- 是否为了单张作品硬编码了组件。

数据 review：

- `photos.json` 是否通过校验。
- 每张图是否有具体、有意义的 `alt`。
- `width`、`height` 是否是数字且接近真实尺寸。
- `slug` 是否唯一。

体验 review：

- 首页首屏是否正常展示 featured 图片。
- 分类筛选是否正常。
- 空分类状态是否可读。
- 图片查看器是否能打开和关闭。
- Escape 是否能关闭查看器。
- 移动端网格、分类导航和查看器是否可用。

构建 review：

- 是否运行过 `npm run validate:photos`。
- 是否运行过 `npm run typecheck:photography`。
- 是否运行过 `npm run build:photography`。
- 修改结构、依赖或构建流程时，是否同步更新 `README.md`。
- 新增统一规则时，是否先更新 `规范.md`。

## 17. 当前状态

当前仓库已完成摄影站第一版工程骨架，并已替换为三段式摄影集体验。

已完成：

- 明确第一版只开发摄影集网站。
- 明确使用 React + Vite + TypeScript + Tailwind CSS。
- 明确使用 Framer Motion 做克制动效。
- 明确 Cloudflare Pages 部署方式。
- 建立 `AGENTS.md` 和 `规范.md` 作为 AI 开发约束。
- 建立 README 作为项目所有者 review 文档。
- 建立 npm workspace。
- 使用 `.nvmrc` 锁定 Node.js 版本。
- 初始化 `apps/photography` React + Vite + TypeScript + Tailwind 应用。
- 新增四个真实摄影主题：暖、湛、盛、郁。
- 新增主页、引导页、展示页三段体验。
- 新增瀑布流展示与二级图片详情界面。
- 新增瀑布流预览图、LQIP 占位图、IntersectionObserver 提前加载和详情页大图渐进覆盖加载。
- 新增照片准备脚本和元数据校验脚本。
- 新增 `apps/home` 与 `apps/resume` 占位目录。

当前限制：

- 暂未配置 Vitest 或 Playwright。
- 暂未绑定自定义域名。
- 暂未开发主页网站和简历网站。

建议在每次内容或代码改动后运行：

```bash
npm run validate:photos
npm run typecheck:photography
npm run build:photography
```
