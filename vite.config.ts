import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // GitHub Pages 部署需要设置 base
    // 如果使用自定义域名（如 wsnail.com），设置为 '/'
    // 如果使用 GitHub Pages 默认域名（username.github.io/repo），设置为 '/repo/'
    base: process.env.GITHUB_PAGES === 'true' ? '/' : '/',
    plugins: [react()],
    define: {
      // 为客户端环境变量提供默认值，解决 "process is not defined" 错误
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env': JSON.stringify({}),
      // 确保 process 对象在浏览器环境中存在
      'process': JSON.stringify({ env: {} }),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      rollupOptions: {
        output: {
          manualChunks: {
            // 核心依赖
            vendor: ['react', 'react-dom'],
            reactRouter: ['react-router-dom'],
            // UI 库
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip', '@radix-ui/react-navigation-menu'],
            // 图表库
            charts: ['chart.js', 'react-chartjs-2', 'chartjs-plugin-datalabels'],
            // 动画库
            animation: ['framer-motion', 'tailwindcss-animate'],
            // 国际化
            i18n: ['i18next', 'react-i18next'],
            // 表单处理
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            // 工具库
            utils: ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          },
        },
      },
      // 降低chunk大小警告阈值
      chunkSizeWarningLimit: 500,
      // 添加 sourcemap 便于调试
      sourcemap: true,
    },
    server: {
      port: 3000,
      // 添加代理配置（如果需要）
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // 添加公共目录配置
    publicDir: "public",
  }
})