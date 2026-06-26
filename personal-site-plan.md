# 个人网站群建设计划备忘

## 1. 项目目标

建设一组个人静态网站，后续通过不同子域名区分访问入口：

```text
主页网站
摄影集网站
简历网站
```

当前阶段暂不开发主页网站和简历网站，主要开发摄影集网站。整体结构需要为后续三网站并行开发、独立部署、独立绑定子域名预留空间。

网站采用静态发布方式，不做复杂后端、不做用户系统、不做数据库管理。核心目标是页面简洁、加载快速、视觉质感好、后续维护方便。

## 2. 已确定方案

- 网站类型：静态个人网站群
- 当前开发重点：摄影集网站
- 后续网站方向：主页网站 + 摄影集网站 + 简历网站
- 前端技术栈：React + Vite + TypeScript + Tailwind CSS
- 动效方案：Framer Motion
- 项目结构：按多网站结构组织，优先考虑 monorepo / apps 目录
- 部署平台：Cloudflare Pages
- 代码管理：Git + GitHub
- 发布方式：GitHub 仓库连接 Cloudflare Pages，当前先部署摄影集网站
- CI/CD：优先使用 Cloudflare Pages Git 集成，不单独配置 GitHub Actions
- 代码质量：第一版只使用 TypeScript 做基础类型约束
- 访问统计：不收集任何访问数据
- 域名策略：第一版先使用 Cloudflare Pages 默认域名；后续购买个人域名后，用子域名区分三个网站
- 图片管理：使用 Markdown / JSON 管理摄影作品元信息
- 图片优化：构建时自动压缩
- 待定事项：图片文件放在 `public` 本地目录，还是使用外部图床 / 对象存储

## 3. 技术栈说明

### React

用于组件化开发页面。当前主要用于摄影集网站的画廊、作品网格、全屏查看、分类筛选等模块。后续也可复用到主页网站和简历网站。

### Vite

用于本地开发与生产打包。开发时启动速度快，配置简单，适合静态网站。

### TypeScript

用于给项目数据和组件参数增加类型约束，降低后续维护时字段混乱和修改出错的概率。

### Tailwind CSS

用于快速编写响应式样式。适合摄影集网站这类需要精细排版、移动端适配和统一视觉风格的网站。

### Framer Motion

用于实现页面进入、区块过渡、图片悬停、摄影作品切换等流畅动效。动效应保持克制，服务于阅读和作品展示，不喧宾夺主。

### Cloudflare Pages

用于托管静态网站。优点是免费额度充足、全球 CDN、支持自动构建、支持自定义域名和 HTTPS。

## 4. 网站结构规划

### 后续子域名结构

```text
www.example.com       主页网站
photo.example.com     摄影集网站
resume.example.com    简历网站
```

第一版暂不绑定个人域名，先使用 Cloudflare Pages 默认域名。后续购买并接入个人域名后，再映射到不同子域名。

### 当前优先开发：摄影集网站

摄影集网站是当前阶段的主要目标，可以先作为独立站点开发和部署。

核心内容：

- 摄影作品首页
- 摄影作品分类
- 作品网格 / 瀑布流 / 横向画廊等多方式排版
- 单张图片放大查看
- 图片标题、拍摄地点、年份等基础信息
- 简短摄影介绍或 About 区域
- 联系方式

摄影作品分类示例：

- 人像
- 街拍
- 风景
- 旅行
- 黑白

展示排版采用多方式结合，暂不指定单一布局。可按具体作品内容组合使用网格、瀑布流、横向画廊、全屏浏览等形式。

### 后续开发：主页网站

主页网站作为统一入口，后续再开发。

可能内容：

- 个人身份与定位
- 跳转到摄影集网站
- 跳转到简历网站
- 代表性视觉封面
- 联系方式

### 后续开发：简历网站

简历网站后续单独开发，不和摄影集网站混在一个页面中。

可能内容：

- 个人简介
- 技能栈
- 教育经历
- 工作 / 实习 / 项目经历
- 代表项目展示
- PDF 简历下载
- 联系方式

## 5. 推荐项目结构

```text
personal-websites/
  apps/
    photography/
      public/
        images/
          photography/
      src/
        components/
          Layout.tsx
          Hero.tsx
          GalleryGrid.tsx
          PhotoViewer.tsx
          CategoryNav.tsx
          AboutPhotography.tsx
          Footer.tsx
        data/
          photos.json
        content/
          galleries/
        types/
          photography.ts
        styles/
          globals.css
        App.tsx
        main.tsx
      index.html
      package.json
      vite.config.ts
      tailwind.config.js
      tsconfig.json
    home/
      README.md
    resume/
      README.md
  package.json
  README.md
```

说明：

- `apps/photography`：当前主要开发对象。
- `apps/home`：后续主页网站预留位置。
- `apps/resume`：后续简历网站预留位置。
- 第一版可以先只初始化 `apps/photography`，另外两个目录只保留占位说明。

## 6. 开发步骤

### 第一阶段：内容整理

1. 筛选摄影作品，先控制在 20 到 50 张以内。
2. 为摄影作品整理分类、标题、地点、年份等元信息。
3. 准备摄影集网站封面图。
4. 准备简短摄影介绍和联系方式。
5. 暂不整理主页和简历网站内容，后续单独处理。

### 第二阶段：项目初始化

1. 创建多网站项目根目录。
2. 在 `apps/photography` 中创建 React + Vite + TypeScript 项目。
3. 安装并配置 Tailwind CSS。
4. 安装并配置 Framer Motion。
5. 建立摄影集网站基础目录结构。
6. 配置 TypeScript。
7. 为 `apps/home` 和 `apps/resume` 预留占位目录。
8. 初始化 Git 仓库并推送到 GitHub。

### 第三阶段：摄影集网站开发

1. 开发摄影集网站整体布局。
2. 开发摄影集首页 Hero 区域。
3. 开发摄影作品分类导航。
4. 开发作品网格、瀑布流或其他组合展示模块。
5. 开发单张图片放大查看模块。
6. 开发摄影介绍、联系方式和页脚。
7. 完成桌面端和移动端响应式适配。

### 第四阶段：视觉与动效

1. 确定整体视觉风格：简洁、专业、适度艺术感。
2. 使用 Framer Motion 给图片网格增加 hover 效果。
3. 使用 Framer Motion 给页面区块增加轻量进入动画。
4. 给摄影作品增加放大查看效果。
5. 避免过多动画影响阅读和加载性能。

### 第五阶段：图片优化

1. 将大图压缩到适合网页展示的尺寸。
2. 优先使用 WebP 或 AVIF 格式。
3. 为图片设置固定宽高或 aspect-ratio，避免页面跳动。
4. 使用 lazy loading 延迟加载非首屏图片。
5. 不上传未处理的超大原图。
6. 配置构建时自动压缩流程，减少人工处理成本。
7. 使用 Markdown / JSON 记录摄影作品的分类、标题、地点、年份、图片路径等元信息。

## 7. 部署与 CI/CD

### 当前阶段：摄影集网站

1. 在 GitHub 创建代码仓库。
2. 将本地代码推送到 GitHub。
3. 在 Cloudflare Pages 创建摄影集网站项目。
4. 连接 GitHub 仓库。
5. 设置 Root directory：

```text
apps/photography
```

6. 设置构建命令：

```bash
npm run build
```

7. 设置输出目录：

```text
dist
```

8. 完成摄影集网站首次部署。
9. 测试线上访问效果。
10. 第一版先使用 Cloudflare Pages 默认域名。

### 后续阶段：三网站部署

后续三个网站可使用同一个 GitHub 仓库，但在 Cloudflare Pages 中创建三个独立项目：

```text
Cloudflare Pages Project 1 -> apps/home        -> www.example.com
Cloudflare Pages Project 2 -> apps/photography -> photo.example.com
Cloudflare Pages Project 3 -> apps/resume      -> resume.example.com
```

每个 Cloudflare Pages 项目设置不同的 Root directory、构建命令和输出目录。这样三个网站可以独立构建、独立部署、独立绑定域名。

当前不单独配置 GitHub Actions。后续如果三网站都加入仓库，可以考虑再增加 GitHub Actions 做统一检查，例如：

```text
typecheck
build:photography
build:home
build:resume
image optimize check
```

## 8. Cloudflare Pages 配置要点

- Framework preset：Vite
- Root directory：`apps/photography`
- Build command：`npm run build`
- Build output directory：`dist`
- Node.js version：使用当前 LTS 版本
- 部署方式：Cloudflare Pages Git 集成
- 不单独配置 GitHub Actions，除非后续需要更复杂的检查流程

如果后续绑定自定义域名，需要在 Cloudflare 中配置 DNS 解析。

## 9. 维护方式

摄影集网站后续更新内容时，优先修改数据文件：

```text
apps/photography/src/data/photos.json
apps/photography/src/content/galleries/
```

推荐原则：

- 修改文字内容时尽量不动组件结构。
- 新增摄影作品时优先更新图片文件和 `photos.json` / Markdown 内容文件。
- 如果采用 JSON / Markdown 管理摄影作品，则新增作品时优先更新对应 JSON / Markdown 文件。
- 页面样式修改集中在对应组件内完成。
- 第一版不接入访问统计，避免额外数据收集。
- 主页网站和简历网站后续作为独立应用维护，避免三个站点内容互相耦合。

## 10. 注意事项

- 不要在网站中暴露手机号、身份证、密钥、服务器密码等敏感信息。
- 摄影作品不要上传未经压缩的原图。
- 移动端体验必须重点检查。
- 摄影作品集应让图片成为主角，不要让动画和装饰抢走注意力。
- 构建时图片压缩要保留足够画质，避免摄影作品被过度压缩。
- 若使用外部图床或对象存储，需要确认费用、访问速度、长期可控性和图片备份方案。
- 不接入访问统计时，无法直接知道访问量、来源和用户行为，这是主动选择的隐私与简化取舍。
- 三网站拆分后，需要注意共享依赖版本和构建配置的一致性，避免后续维护成本上升。

## 11. 后续可扩展方向

- 绑定个人域名。
- 使用子域名区分内容，例如 `www`、`photo`、`resume`。
- 增加摄影作品详情页。
- 增加 Markdown / MDX 内容管理。
- 初始化主页网站。
- 初始化简历网站。
- 提取三网站共享配置或共享 UI 组件。
- 如果后续需要更严格流程，再增加 GitHub Actions 做 lint、typecheck、build 检查。

## 12. 待定决策

### 图片存放位置

当前待定：图片放在 `public` 本地目录，还是使用外部图床 / 对象存储。

可选方案：

- `public` 本地目录：最简单，适合第一版和图片数量不大的情况。
- 外部图床 / 对象存储：适合大量图片、高清图、后续独立管理图片资源。

需要根据摄影作品数量、单张图片大小、是否需要长期高清展示来决定。

## 13. 当前推荐路线

先完成一个可上线的第一版：

```text
摄影集网站独立上线
```

第一版上线后，再根据实际使用反馈逐步增强视觉、动效和内容管理方式。主页网站和简历网站后续再作为独立站点加入同一仓库结构。
