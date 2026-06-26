# 个人网站项目说明

本文档面向项目所有者，用来 review 项目状态、文件结构、依赖关系和构建流程。AI 开发执行规则放在 `AGENTS.md` 和 `规范.md`，README 只负责解释项目给人看。

## 1. 项目是什么

这是一个静态个人网站群项目，后续计划包含三个独立网站：

```text
主页网站
摄影集网站
简历网站
```

当前只开发摄影集网站。主页网站和简历网站暂时只预留位置，避免第一版范围过大。

## 2. 为什么用 monorepo

monorepo 指一个 Git 仓库里管理多个相关项目。这里计划把三个网站放在同一个仓库的 `apps/` 目录下：

```text
apps/
  photography/   # 当前重点：摄影集网站
  home/          # 后续：主页网站
  resume/        # 后续：简历网站
```

这样做的好处是：三个网站可以共享规范、依赖版本和维护流程，但部署时仍然可以作为三个独立站点发布。

## 3. 当前文件说明

根目录当前核心文件：

```text
AGENTS.md            # AI 开发入口规则，要求先读规范
规范.md              # 项目计划 + 开发执行规范
README.md            # 给项目所有者 review 的说明文档
.agents/skills/      # 本项目可用的 AI skills
.nvmrc               # Node.js 版本锁定
package.json         # npm workspace 和根目录脚本
package-lock.json    # npm 依赖锁定文件
```

摄影站已初始化，核心结构为：

```text
apps/photography/
  public/images/photography/  # 网页使用的摄影图片
  src/components/             # 页面组件，例如图库、导航、图片查看器
  src/data/                   # 照片元数据，例如标题、分类、年份、路径
  src/content/                # 介绍文字或 Markdown 内容
  src/types/                  # TypeScript 类型定义
  src/styles/                 # 全局样式
  App.tsx                     # 摄影站主页面组件
  main.tsx                    # React 入口文件
  package.json                # 摄影站依赖和命令
  vite.config.ts              # Vite 构建配置
  scripts/validate-photos.mjs # 照片元数据校验脚本
apps/home/README.md           # 主页网站占位
apps/resume/README.md         # 简历网站占位
```

## 4. 技术栈用来做什么

```text
React            负责把页面拆成可维护的组件
Vite             负责本地开发服务器和最终静态打包
TypeScript       给数据和组件增加类型检查，减少字段写错
Tailwind CSS     用 class 写响应式样式
Framer Motion    做克制的图片浏览和页面过渡动效
Cloudflare Pages 托管打包后的静态网站
```

第一版不做后端、不做数据库、不做登录、不做访问统计。

## 5. 依赖关系怎么理解

依赖会记录在 `apps/photography/package.json` 中，并由根目录 `package-lock.json` 锁定。大致分两类：

```text
dependencies
  网站运行时需要的包，例如 react、framer-motion

devDependencies
  只在开发和构建时需要的包，例如 vite、typescript、tailwindcss
```

安装依赖后会生成 `package-lock.json`。这个文件用于锁定依赖版本，保证本地和 Cloudflare Pages 构建时拿到一致的依赖。

## 6. 常用命令

根目录可直接执行：

```bash
npm install
```

安装所有 workspace 依赖。

```bash
npm run dev:photography
```

启动摄影站本地开发服务器。

```bash
npm run validate:photos
```

检查摄影作品元数据是否符合必填字段、尺寸和 slug 唯一性要求。

```bash
npm run typecheck:photography
```

运行摄影站 TypeScript 检查。

```bash
npm run build:photography
```

构建摄影站最终静态文件。

也可以进入 `apps/photography` 目录执行应用内命令：

```bash
npm install
```

安装依赖。

```bash
npm run dev
```

启动本地开发服务器，用浏览器预览网站。

```bash
npm run typecheck
```

运行 TypeScript 检查，确认数据字段、组件参数等没有明显类型错误。

```bash
npm run validate:photos
```

检查照片元数据。

```bash
npm run build
```

构建最终静态网站，输出到 `dist/`。

```bash
npm run test
```

只有配置 Vitest 后才使用，用于运行单元测试或组件测试。

## 7. 构建流程是什么

构建流程可以理解为：

```text
源代码 + 图片元数据 + 样式
        ↓
Vite 读取配置并打包
        ↓
生成 dist/
        ↓
Cloudflare Pages 部署 dist/
        ↓
用户通过网址访问静态网站
```

`dist/` 是构建产物，不是主要编辑对象。正常开发时修改 `src/`、`public/`、`package.json` 等源文件，再重新构建。

## 8. 图片和内容怎么更新

摄影图片预计放在：

```text
apps/photography/public/images/photography/
```

照片标题、分类、年份、路径等信息预计放在：

```text
apps/photography/src/data/photos.json
```

后续新增摄影作品时，优先更新图片文件和元数据，不应为了新增一张照片去改组件结构。

每张照片至少需要这些信息：

```text
src       图片路径
alt       图片替代文本，供无障碍和加载失败时使用
width     图片宽度
height    图片高度
category  分类
title     标题
year      年份
```

## 9. 部署方式

当前计划使用 Cloudflare Pages。摄影站的配置应为：

```text
Root directory: apps/photography
Build command: npm run build
Build output directory: dist
Framework preset: Vite
```

第一版先使用 Cloudflare Pages 默认域名。后续购买个人域名后，再使用子域名：

```text
www.example.com       主页网站
photo.example.com     摄影集网站
resume.example.com    简历网站
```

## 10. Review 时重点看什么

每次较大改动后，建议重点 review：

- 文件是否放在预期目录。
- README 是否同步解释了新的结构、依赖或命令。
- `规范.md` 是否包含新出现的统一规则。
- 摄影作品是否通过数据文件维护，而不是硬编码在组件里。
- 页面是否能在移动端正常浏览。
- 图片是否经过压缩，没有提交原图。
- 是否运行过 `npm run typecheck` 和 `npm run build`。

## 11. 当前状态

当前仓库已完成摄影站第一版工程骨架初始化。

已完成：

- 明确第一版只开发摄影集网站。
- 明确使用 React + Vite + TypeScript + Tailwind CSS。
- 明确 Cloudflare Pages 部署方式。
- 建立 `AGENTS.md` 和 `规范.md` 作为 AI 开发约束。
- 建立 README 作为项目所有者 review 文档。
- 建立 npm workspace 和 Node.js 版本锁定。
- 初始化 `apps/photography` React + Vite + TypeScript + Tailwind 应用。
- 新增摄影作品示例数据、占位图片、分类导航、图库和图片查看器。
- 新增 `apps/home` 与 `apps/resume` 占位目录。
- 新增照片元数据校验脚本。

最近一次验证已通过：

```bash
npm run validate:photos
npm run typecheck:photography
npm run build:photography
```
