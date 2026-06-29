# VS Code 本地调试与 Playwright 使用

本文说明如何手动在 VS Code 中启动、检查和关闭摄影站页面。

## 1. 启动开发服务器

1. 用 VS Code 打开仓库根目录：`E:\project-for-code\2026_6_26_webdesign`。
2. 打开命令面板：`Ctrl+Shift+P`。
3. 执行 `Tasks: Run Task`。
4. 选择 `dev:photography`。
5. 终端出现 `http://127.0.0.1:5174/` 后，页面服务已启动。

关闭开发服务器：

1. 打开命令面板：`Ctrl+Shift+P`。
2. 执行 `Tasks: Terminate Task`。
3. 选择 `dev:photography`。

也可以在 VS Code 终端里点垃圾桶图标关闭该任务终端。

## 2. 使用 Microsoft Edge Tools

方式一，使用调试配置：

1. 进入 VS Code 左侧 `Run and Debug`。
2. 选择 `Edge: Photography (Vite)`。
3. 点击绿色运行按钮或按 `F5`。
4. Edge 打开 `http://127.0.0.1:5174` 后，Microsoft Edge Tools 面板会显示可检查的目标。

关闭 Edge 调试页面：

1. 在顶部调试工具条点击停止按钮，或按 `Shift+F5`。
2. 如果不再开发，再按上面的步骤关闭 `dev:photography` 任务。

方式二，使用 Microsoft Edge Tools 面板：

1. 先运行 `dev:photography`。
2. 打开左侧 `Microsoft Edge Tools`。
3. 点击 `Launch Instance`。
4. 地址栏输入 `http://127.0.0.1:5174`。

关闭方式：关闭 Edge 窗口，或在 VS Code 调试工具条点击停止。

如果看到 `Microsoft Edge DevTools for Visual Studio Code` 的 Success 页面，说明当前打开的是扩展自带的起始页，不是项目页面。请关闭该窗口，然后在 `Run and Debug` 中选择 `Edge: Photography (Vite)` 或 `Edge + DevTools: Photography` 重新运行；也可以直接在内嵌 Edge 地址栏输入 `http://127.0.0.1:5174`。

## 3. 使用 Playwright Test for VS Code

Playwright 配置文件是仓库根目录的 `playwright.config.ts`。当前测试项目覆盖四个视口：

- `edge-320`
- `edge-390`
- `edge-430`
- `edge-1440`

运行测试：

1. 先启动 `dev:photography`。
2. 打开 VS Code 左侧 `Testing` 或 `Playwright` 面板。
3. 展开 `apps/photography/e2e/responsive.spec.ts`。
4. 点击单个测试或项目旁边的运行按钮。

显示浏览器运行：

1. 在 Playwright 面板勾选 `显示浏览器`。
2. 再点击运行测试。
3. 测试结束后，可在 Playwright 面板点击 `关闭全部 Playwright 浏览器`。

使用 Playwright UI：

1. 打开命令面板：`Ctrl+Shift+P`。
2. 执行 `Tasks: Run Task`。
3. 选择 `test:e2e:photography:ui`。
4. 关闭时，在运行该任务的终端按 `Ctrl+C`，或直接关闭任务终端。

## 4. 常用命令

```bash
npm run dev:photography
npm run test:e2e:photography
npm run test:e2e:photography:ui
npm run check:photography
```

注意：运行 `npm run test:e2e:photography` 前需要先启动 `dev:photography`，否则测试无法访问本地页面。
