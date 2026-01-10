// 模块调试脚本
// 在浏览器控制台中运行：loadScript('/debug-modules.js')

console.log('=== 模块调试信息 ===');

// 检查 Zustand store
if (window.__ZUSTAND_STORE__) {
  const state = window.__ZUSTAND_STORE__.getState();
  console.log('Store 中的模块数量:', state.modules.length);
  console.log('模块列表:', state.modules.map(m => ({ id: m.id, name: m.name })));
  
  // 检查 data_input 模块
  const dataInputModule = state.modules.find(m => m.id === 'data_input');
  if (dataInputModule) {
    console.log('✅ data_input 模块已加载:', dataInputModule);
  } else {
    console.log('❌ data_input 模块未找到');
  }
} else {
  console.log('❌ 未找到 Zustand store');
}

// 检查 React Flow 节点
if (window.__REACT_FLOW_INSTANCE__) {
  const nodes = window.__REACT_FLOW_INSTANCE__.getNodes();
  console.log('React Flow 节点数量:', nodes.length);
  nodes.forEach(node => {
    console.log(`节点 ${node.id}:`, {
      moduleId: node.data.moduleId,
      hasModule: !!window.__ZUSTAND_STORE__?.getState().modules.find(m => m.id === node.data.moduleId)
    });
  });
} else {
  console.log('❌ 未找到 React Flow 实例');
}

// 手动注册模块的函数
window.debugRegisterModules = () => {
  if (window.__ZUSTAND_STORE__) {
    const { registerModule } = window.__ZUSTAND_STORE__.getState();
    
    // 手动注册 data_input 模块
    const dataInputModule = {
      id: 'data_input',
      name: '数据输入',
      category: 'input',
      description: '手动输入数据或从文件中导入数据',
      version: '1.0.0',
      author: 'MiniMax Agent',
      inputs: [],
      outputs: [
        { id: 'output', name: '数据输出', type: 'json', description: '输出的数据' },
      ],
      config: {
        dataType: 'manual',
        sampleData: '',
      },
      code: `
        function execute(inputs, config, globals) {
          const data = JSON.parse(config.sampleData || '{}');
          return { output: data };
        }
      `,
      isBuiltIn: true,
      lastModified: new Date().toISOString(),
    };
    
    registerModule(dataInputModule);
    console.log('✅ 手动注册了 data_input 模块');
  }
};

console.log('调试函数已加载：window.debugRegisterModules()');