/**
 * ============================================================================
 * 文件名：流程画布.tsx
 * 功能描述：流程图画布组件
 *
 * 本组件是应用的主画布区域，负责：
 * 1. 渲染 React Flow 画布
 * 2. 支持节点的拖拽、连接、缩放等操作
 * 3. 同步节点/连线状态到全局 store
 * 4. 处理拖放创建新节点
 *
 * 核心功能：
 * 1. 节点管理：拖拽位置、同步到 store
 * 2. 连线管理：创建/删除连线、同步到 store
 * 3. 数据传播：连线后自动触发数据更新
 * 4. 缩放控制：响应缩放事件
 * ============================================================================
 */

// 导入 React 核心库和 Hooks
import React, { useCallback, useRef, useEffect } from 'react';

// 从 React Flow 库导入组件和 Hooks
import {
  ReactFlow,           // 主画布组件
  Background,          // 背景网格组件
  Controls,            // 控件组件（缩放、重置等）
  MiniMap,             // 迷你地图组件
  useNodesState,       // 节点状态 Hook
  useEdgesState,       // 连线状态 Hook
  addEdge,             // 添加连线工具函数
  Connection,          // 连接参数类型
  Edge,                // 连线类型
  Node,                // 节点类型
  ReactFlowProvider,   // React Flow Provider 组件
  ReactFlowInstance,   // React Flow 实例类型
} from '@xyflow/react';

// 导入 React Flow 样式
import '@xyflow/react/dist/style.css';

// 从状态管理 store 导入方法
import { useAppStore } from '@/store/index';

// 导入自定义节点组件
import { 自定义节点 } from './自定义节点';

// 从类型定义文件导入类型
import type {
  FlowNode,      // 流程节点类型
  FlowEdge,      // 流程连线类型
} from '@/types/index';

// 导入节点数据类型
import type { 节点数据类型 } from './自定义节点';

// ============================================================================
// 第一部分：节点类型注册
// ============================================================================

/**
 * 节点类型注册表
 *
 * 功能说明：
 * 将自定义节点类型注册到 React Flow
 *
 * 格式：
 * {
 *   类型名称: 节点组件
 * }
 *
 * 使用方式：
 * 在 ReactFlow 组件中设置 nodeTypes={nodeTypes}
 * 并在节点数据中设置 type: 'custom'
 */
const nodeTypes = {
  // 'custom' 类型对应自定义节点组件
  custom: 自定义节点,
};

// ============================================================================
// 第二部分：类型定义
// ============================================================================

/**
 * 流程画布属性接口
 */
interface 流程画布属性 {
  // 节点变化回调（可选）
  onNodesChange?: (nodes: Node[]) => void;

  // 连线变化回调（可选）
  onEdgesChange?: (edges: Edge[]) => void;
}

// ============================================================================
// 第三部分：画布内部组件
// ============================================================================

/**
 * 画布内部组件
 *
 * 功能说明：
 * 包含主要的业务逻辑
 * 使用 useNodesState 和 useEdgesState 管理本地状态
 *
 * 职责：
 * 1. 从全局 store 同步项目数据到本地
 * 2. 处理节点变化（位置、选择等）
 * 3. 处理连线变化（创建、删除等）
 * 4. 处理拖放创建新节点
 * 5. 设置节点数据变更回调
 */
const 流程画布内部: React.FC<流程画布属性> = ({ onNodesChange, onEdgesChange }) => {
  // =========================================================================
  // 从 store 获取状态和方法
  // =========================================================================

  const {
    currentProject,     // 当前项目数据
    addNode,            // 添加节点方法
    addEdge: addStoreEdge,  // 添加连线方法（重命名避免与 addEdge 工具函数冲突）
    updateNode,         // 更新节点方法
    deleteNode,         // 删除节点方法
    deleteEdge,         // 删除连线方法
    setSelectedNode,    // 设置选中节点方法
    setSelectedEdge,    // 设置选中连线方法
    pushToHistory,      // 推入历史记录方法
    setZoomLevel,       // 设置缩放级别方法
    setOnNodeDataChange,// 设置节点数据变更回调方法
  } = useAppStore();

  // =========================================================================
  // React Flow 本地状态
  // =========================================================================

  // 节点状态（使用 React Flow 的 useNodesState Hook）
  // 格式：[nodes, setNodes, onNodesChangeHandler]
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState([]);

  // 连线状态（使用 React Flow 的 useEdgesState Hook）
  // 格式：[edges, setEdges, onEdgesChangeHandler]
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState([]);

  // 画布包装元素引用
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // React Flow 实例状态
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  // =========================================================================
  // 效果处理（副作用）
  // =========================================================================

  /**
   * 设置节点数据变更回调
   *
   * 功能说明：
   * 用于触发 UI 重新渲染
   *
   * 当节点数据变化时（如 inputValues、inputFormats 更新）
   * 此回调会被调用，更新 React Flow 中的节点数据
   *
   * 关键处理：
   * - 确保嵌套对象也是新的引用（深拷贝）
   * - 触发 React Flow 重新渲染
   */
  useEffect(() => {
    // 定义节点数据变化处理函数
    const handleNodeDataChange = (nodeId: string, data: 节点数据类型) => {
      // 更新本地节点状态
      setNodes(nds =>
        // 遍历所有节点
        nds.map(node => {
          // 找到目标节点
          if (node.id === nodeId) {
            // 确保嵌套对象也是新的引用（不可变更新）
            const updatedNode = {
              ...node,  // 复制节点属性
              data: {
                ...data,  // 复制数据属性
                config: data.config ? { ...data.config } : undefined,  // 深拷贝 config
                inputValues: data.inputValues ? { ...data.inputValues } : undefined,  // 深拷贝 inputValues
              }
            };
            return updatedNode;
          }
          // 其他节点保持不变
          return node;
        })
      );
    };

    // 设置回调到全局 store
    setOnNodeDataChange(handleNodeDataChange);

    // 清理函数：组件卸载时移除回调
    return () => {
      setOnNodeDataChange(null);
    };
  }, [setNodes, setOnNodeDataChange]);

  /**
   * 同步项目数据到 React Flow
   *
   * 功能说明：
   * 当项目数据变化时（如从 store 加载项目）
   * 将项目数据同步到 React Flow 的本地状态
   *
   * 触发时机：
   * - 加载项目时
   * - 撤销/重做操作后
   */
  useEffect(() => {
    // 如果有当前项目
    if (currentProject) {
      // 将项目节点转换为 React Flow 节点格式
      const flowNodes: Node[] = currentProject.nodes.map(node => ({
        id: node.id,                    // 节点 ID
        type: 'custom',                 // 使用自定义节点类型
        position: node.position,        // 节点位置
        data: node.data,                // 节点数据
      }));

      // 将项目连线转换为 React Flow 连线格式
      const flowEdges: Edge[] = currentProject.edges.map(edge => ({
        id: edge.id,                    // 连线 ID
        source: edge.source,            // 源节点 ID
        target: edge.target,            // 目标节点 ID
        sourceHandle: edge.sourceHandle, // 源端口 ID
        targetHandle: edge.targetHandle, // 目标端口 ID
        type: edge.type,                // 连线类型
        data: edge.data,                // 连线数据
      }));

      // 更新本地状态
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentProject, setNodes, setEdges]);

  // =========================================================================
  // 事件处理函数
  // =========================================================================

  /**
   * 处理节点变化
   *
   * 功能说明：
   * 同步位置变化到全局 store
   *
   * 触发时机：
   * - 用户拖拽节点后
   * - 节点被选择/取消选择时
   *
   * @param changes - 变化数组
   */
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      // 先调用 React Flow 的处理函数
      onNodesChangeHandler(changes);

      // 如果有外部回调，调用它
      if (onNodesChange) {
        onNodesChange(nodes);
      }

      // 同步到全局 store
      changes.forEach(change => {
        // 只处理位置变化
        if (change.type === 'position' && change.position) {
          // 更新节点位置
          updateNode(change.id, { position: change.position });
        }
      });
    },
    [onNodesChangeHandler, nodes, updateNode, onNodesChange]
  );

  /**
   * 处理连线变化
   *
   * 功能说明：
   * 同步删除操作到全局 store
   *
   * 触发时机：
   * - 用户删除连线时
   *
   * @param changes - 变化数组
   */
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      // 先调用 React Flow 的处理函数
      onEdgesChangeHandler(changes);

      // 如果有外部回调，调用它
      if (onEdgesChange) {
        onEdgesChange(edges);
      }

      // 同步到全局 store
      changes.forEach(change => {
        // 只处理删除操作
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [onEdgesChangeHandler, edges, deleteEdge, onEdgesChange]
  );

  /**
   * 处理连接（创建连线）
   *
   * 功能说明：
   * 创建新的连线
   *
   * 【关键】数据传播由 store 的 addEdge 内部处理
   * - addEdge 会将连线添加到全局 store
   * - addEdge 内部会调用 executeUpstreamChain
   * - executeUpstreamChain 会触发数据传播
   *
   * @param params - 连接参数（包含 source, target, sourceHandle, targetHandle）
   */
  const onConnect = useCallback(
    (params: Connection) => {
      // 创建新连线对象
      const newEdge: FlowEdge = {
        // 生成唯一 ID
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        // 源节点和目标节点
        source: params.source!,
        target: params.target!,
        // 源端口和目标端口（可选）
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        // 连线类型
        type: 'smoothstep',
      };

      // 更新 React Flow 本地状态
      setEdges(eds => addEdge(params, eds));

      // 添加到全局 store
      addStoreEdge(newEdge);

      // 推入历史记录（支持撤销）
      pushToHistory();

      // 【关键】数据传播由 store 的 addEdge 内部调用 executeUpstreamChain 处理
      // 无需在这里额外处理
    },
    [setEdges, addStoreEdge, pushToHistory]
  );

  /**
   * 处理拖拽悬停
   *
   * 功能说明：
   * 允许放置操作
   *
   * @param event - 拖拽事件
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    // 阻止默认行为（允许放置）
    event.preventDefault();
    // 设置放置效果为移动
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * 处理放置
   *
   * 功能说明：
   * 从侧边栏拖拽模块到画布时，创建新的节点
   *
   * 处理步骤：
   * 1. 获取拖拽数据（模块类型、模块 ID）
   * 2. 计算放置位置（屏幕坐标 -> 流程坐标）
   * 3. 获取模块定义
   * 4. 创建新节点
   * 5. 更新本地状态和全局 store
   *
   * @param event - 放置事件
   */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      // 阻止默认行为
      event.preventDefault();

      // 获取画布边界矩形
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();

      // 如果没有画布实例或边界，直接返回
      if (!reactFlowInstance || !reactFlowBounds) return;

      // 获取拖拽数据
      const type = event.dataTransfer.getData('application/reactflow');
      const moduleId = event.dataTransfer.getData('moduleId');

      // 检查数据有效性
      if (typeof type === 'undefined' || !type || !moduleId) {
        return;
      }

      // 计算放置位置
      // 将屏幕坐标转换为流程坐标
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 获取模块定义
      const { modules } = useAppStore.getState();
      const module = modules.find(m => m.id === moduleId);

      // 如果模块不存在，直接返回
      if (!module) return;

      // 创建新节点
      const newNode: FlowNode = {
        // 生成唯一 ID
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        // 节点类型
        type: 'custom',
        // 节点位置
        position,
        // 节点数据
        data: {
          moduleId,                   // 模块 ID
          config: { ...module.config },  // 模块配置
          label: module.name,         // 节点标题
          instanceId: `instance_${Date.now()}`,  // 实例 ID
          status: 'idle',             // 初始状态
        },
      };

      // 更新本地状态
      setNodes(nds => nds.concat(newNode));

      // 添加到全局 store
      addNode(newNode);

      // 推入历史记录
      pushToHistory();
    },
    [reactFlowInstance, setNodes, addNode, pushToHistory]
  );

  /**
   * 处理节点点击
   *
   * 功能说明：
   * 选中节点
   *
   * @param event - 点击事件
   * @param node - 被点击的节点
   */
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // 设置选中节点
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  /**
   * 处理连线点击
   *
   * 功能说明：
   * 选中连线
   *
   * @param event - 点击事件
   * @param edge - 被点击的连线
   */
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // 设置选中连线
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge]
  );

  /**
   * 处理画布点击
   *
   * 功能说明：
   * 取消选择（节点和连线）
   */
  const onPaneClick = useCallback(() => {
    // 取消选中节点
    setSelectedNode(null);
    // 取消选中连线
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // =========================================================================
  // 渲染
  // =========================================================================

  return (
    // 画布容器
    <div className="w-full h-full" ref={reactFlowWrapper}>
      {/* React Flow 主组件 */}
      <ReactFlow
        // 节点和连线数据
        nodes={nodes}
        edges={edges}

        // 事件处理
        onNodesChange={handleNodesChange}      // 节点变化
        onEdgesChange={handleEdgesChange}      // 连线变化
        onConnect={onConnect}                  // 连接完成
        onDrop={onDrop}                        // 放置
        onDragOver={onDragOver}                // 拖拽悬停
        onInit={setReactFlowInstance}          // 初始化完成
        onNodeClick={onNodeClick}              // 节点点击
        onEdgeClick={onEdgeClick}              // 连线点击
        onPaneClick={onPaneClick}              // 画布点击

        // 视口变化（缩放）
        onViewportChange={(viewport) => setZoomLevel(viewport.zoom)}

        // 节点类型
        nodeTypes={nodeTypes}

        // 初始视图（适应画布）
        fitView

        // 属性位置
        attributionPosition="bottom-left"

        // 样式
        className="bg-gray-900"
      >
        {/* 背景网格 */}
        <Background
          color="#374151"  // 网格颜色
          gap={20}          // 网格间距
        />

        {/* 控件组件 */}
        <Controls
          className="bg-gray-800 border-gray-700"
        />

        {/* 迷你地图 */}
        <MiniMap
          className="bg-gray-800 border-gray-700"
          // 根据节点状态返回颜色
          nodeColor={(node) => {
            switch (node.data?.status) {
              case 'running':
                return '#3B82F6';  // 蓝色
              case 'success':
                return '#10B981';  // 绿色
              case 'error':
                return '#EF4444';  // 红色
              default:
                return '#6B7280';  // 灰色
            }
          }}
          // 遮罩颜色
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  );
};

// ============================================================================
// 第四部分：画布组件（包装 Provider）
// ============================================================================

/**
 * 流程画布组件
 *
 * 功能说明：
 * 包装 ReactFlowProvider，提供上下文
 *
 * 使用方式：
 * <流程画布 />
 *
 * ReactFlowProvider 提供：
 * - useReactFlow Hook（获取实例、工具函数）
 * - 内部状态管理
 */
export const 流程画布: React.FC<流程画布属性> = (props) => {
  return (
    // 使用 ReactFlowProvider 包装
    <ReactFlowProvider>
      {/* 内部组件 */}
      <流程画布内部 {...props} />
    </ReactFlowProvider>
  );
};

// 导出默认组件
