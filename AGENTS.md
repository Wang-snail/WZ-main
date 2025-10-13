# Repository Guidelines

## 项目结构与模块组织
项目使用 Vite + React 18 + TypeScript。`src/main.tsx` 注册根节点并注入全局错误边界，`src/App.tsx` 负责路由与页面挂载。页面按功能拆分在 `src/pages`，组件在 `src/components`，共享逻辑放入 `src/hooks`、`src/lib`、`src/utils`，数据与常量位于 `src/data`、`src/types.ts`。`public/` 存放静态资源，`docs/` 保留额外产品与配置说明。部署脚本位于 `scripts/`，包括站点地图生成和部署验证流程；请勿直接修改 `dist/` 或 `DEPLOY_FORCE` 等产物文件。

## 构建、测试与开发命令
运行 `npm install` 安装依赖。`npm run dev` 启动本地开发；`npm run build` 执行生产构建并顺带生成站点地图；`npm run preview` 以构建产物启动本地预览；`npm run lint` 应用项目级 ESLint 规则；`npm run test` 进入 Vitest watch 模式，`npm run test:run` 用于 CI；发布前可用 `npm run deploy:verify` 完整执行构建、部署脚本和部署验证。

## 代码风格与命名约定
所有源代码使用 TypeScript，组件文件和导出的常量采用 PascalCase（如 `ToolReviewsPage.tsx`、`useWebsiteConfig.ts` 中的 Hook）。保持 2 空格缩进、单引号和分号遵循 ESLint/TypeScript 默认设置；样式首选 Tailwind 类与 `clsx`/`tailwind-merge`，按布局→排版→状态排序 Utility 类。借助路径别名 `@/` 引入模块，避免使用相对路径穿越多级目录。若更新全局样式或 Token，请同步维护 `src/index.css` 中的 CSS 变量。

## 测试指引
使用 Vitest + React Testing Library，公共测试配置位于 `vitest.config.ts` 和 `src/test/setup.ts`。新测试文件命名为 `*.test.tsx` 并与功能模块同目录或放入专属 `__tests__` 子目录，确保覆盖关键交互、表单验证和路由逻辑。对外部请求请使用 Mock（`msw` 或内置假数据），保持测试可重复。提交前至少运行 `npm run test:run` 与 `npm run lint`。

## 提交与合并请求规范
遵循仓库历史，提交信息使用简体中文祈使句，可带 emoji 强调场景（如 `🚀 强制部署：刷新缓存时间戳`）。一次提交聚焦单一特性，并在正文列出关联系统或问题编号。创建 PR 时需：概述改动背景、贴上关键界面截图或日志、说明已执行的验证命令（例如 `npm run build`、`npm run test:run`），并引用相关文档（如 `docs/config-management.md`）。部署相关改动请标注是否需要触发 Vercel 生产发布。

## 配置与部署提示
开发与部署凭据通过 `.env` 或 `.env.local` 管理（见 Vercel 项目 `prj_OXALain1SCUD0EJtGviaB4yHNZMz` 和域名 `wsnail.com`），切勿提交到版本库。Vercel 配置存放在 `vercel.json`，本地触发部署可使用 `npm run deploy:vercel` 或 `scripts/reliable-deploy.sh`。确保任何可观察性或强制刷新逻辑同步更新 `scripts/verify-deployment.js`，以保持线上稳定。***
