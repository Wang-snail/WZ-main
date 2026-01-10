import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'

// 主项目 dist 目录路径
const MAIN_PROJECT_DIST = path.resolve(__dirname, "../../dist")

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  // 设置基础路径为 /flow/ 以便正确加载资源
  base: '/flow/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    // 输出到主项目的 dist/flow 目录
    outDir: path.join(MAIN_PROJECT_DIST, 'flow'),
    emptyOutDir: true,
  },
})
