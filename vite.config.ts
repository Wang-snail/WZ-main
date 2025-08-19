import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
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