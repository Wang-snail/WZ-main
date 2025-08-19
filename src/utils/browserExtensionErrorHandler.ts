// 在你的 main.tsx 或 App.tsx 中添加全局错误处理
window.addEventListener('unhandledrejection', event => {
  // 忽略特定的扩展错误
  if (event.reason && 
      typeof event.reason === 'object' && 
      event.reason.message && 
      event.reason.message.includes('listener indicated an asynchronous response')) {
    // 这是一个已知的浏览器扩展错误，可以安全忽略
    console.debug('Ignored browser extension error:', event.reason);
    event.preventDefault();
  }
});