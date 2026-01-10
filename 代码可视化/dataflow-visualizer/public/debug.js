// 调试脚本：在浏览器控制台中运行
// 用于检查数据流问题

window.debugDataFlow = {
  // 检查当前项目状态
  checkProject: () => {
    const store = window.__ZUSTAND_STORE__;
    if (store) {
      const state = store.getState();
      console.log('当前项目:', state.currentProject);
      console.log('执行结果:', state.executionResults);
      console.log('端口值:', state.nodePortValues);
      return state;
    } else {
      console.log('未找到 Zustand store');
    }
  },

  // 检查 React Flow 节点状态
  checkNodes: () => {
    const reactFlowInstance = window.__REACT_FLOW_INSTANCE__;
    if (reactFlowInstance) {
      const nodes = reactFlowInstance.getNodes();
      console.log('React Flow 节点:', nodes);
      nodes.forEach(node => {
        console.log(`节点 ${node.id}:`, {
          data: node.data,
          inputValues: node.data.inputValues
        });
      });
      return nodes;
    } else {
      console.log('未找到 React Flow 实例');
    }
  },

  // 模拟数据输入
  simulateInput: (nodeId, data) => {
    const store = window.__ZUSTAND_STORE__;
    if (store) {
      const { executeSingleNode } = store.getState();
      console.log(`模拟节点 ${nodeId} 输入:`, data);
      executeSingleNode(nodeId);
    }
  },

  // 检查连线
  checkEdges: () => {
    const reactFlowInstance = window.__REACT_FLOW_INSTANCE__;
    if (reactFlowInstance) {
      const edges = reactFlowInstance.getEdges();
      console.log('连线:', edges);
      return edges;
    }
  }
};

console.log('调试工具已加载！使用 window.debugDataFlow 进行调试');
console.log('可用方法:', Object.keys(window.debugDataFlow));