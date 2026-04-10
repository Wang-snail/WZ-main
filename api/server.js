import { serve } from '@hono/node-server';
import 'dotenv/config';
import app from './chat.js';

const port = 3007;
console.log(`🐌 Kel AI 服务启动在 http://localhost:${port}`);
console.log(`📡 API 端点: http://localhost:${port}/api/chat`);
console.log(`💚 健康检查: http://localhost:${port}/api/health`);

serve({
  fetch: app.fetch,
  port
});