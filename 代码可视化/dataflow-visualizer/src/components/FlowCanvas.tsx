/**
 * 流程图画布组件
 * 功能：主画布区域，支持节点的拖拽、连接、缩放等操作
 */
import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '../store';
import { CustomNode } from './CustomNode';
import type { FlowNode, FlowEdge } from '../types';
import type { CustomNodeData } from './CustomNode';

// 节点类型注册
const nodeTypes = {
  custom: CustomNode,
};

interface FlowCanvasProps {
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

/**
 * 画布内部组件
 * 包含主要的业务逻辑
 */
const FlowCanvasInner: React.FC<FlowCanvasProps> = ({ onNodesChange, onEdgesChange }) => {
  // 从 store 获取状态和方法
  const {
    currentProject,
    addNode,
    addEdge: addStoreEdge,
    updateNode,
    deleteNode,
    deleteEdge,
    setSelectedNode,
    setSelectedEdge,
    pushToHistory,
    setZoomLevel,
    setOnNodeDataChange,
  } = useAppStore();

  // React Flow 状态
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  // =========================================================================
  // 效果处理
  // =========================================================================

  /**
   * 设置节点数据变更回调
   * 功能：用于触发 UI 重新渲染
   */
  useEffect(() => {
    const handleNodeDataChange = (nodeId: string, data: CustomNodeData) => {
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            // 确保嵌套对象也是新的引用
            const updatedNode = {
              ...node,
              data: {
                ...data,
                config: data.config ? { ...data.config } : undefined,
                inputValues: data.inputValues ? { ...data.inputValues } : undefined,
              }
            };
            return updatedNode;
          }
          return node;
        })
      );
    };

    setOnNodeDataChange(handleNodeDataChange);

    // 清理函数
    return () => {
      setOnNodeDataChange(null);
    };
  }, [setNodes, setOnNodeDataChange]);

  /**
   * 同步项目数据到 React Flow
   * 功能：当项目数据变化时，更新画布显示
   */
  useEffect(() => {
    if (currentProject) {
      const flowNodes: Node[] = currentProject.nodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: node.data,
      }));

      const flowEdges: Edge[] = currentProject.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        data: edge.data,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentProject, setNodes, setEdges]);

  // =========================================================================
  // 事件处理函数
  // =========================================================================

  /**
   * 处理节点变化
   * 功能：同步位置变化到 store
   */
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChangeHandler(changes);

      if (onNodesChange) {
        onNodesChange(nodes);
      }

      // 同步到 store
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          updateNode(change.id, { position: change.position });
        }
      });
    },
    [onNodesChangeHandler, nodes, updateNode, onNodesChange]
  );

  /**
   * 处理连线变化
   * 功能：同步删除操作到 store
   */
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesChangeHandler(changes);

      if (onEdgesChange) {
        onEdgesChange(edges);
      }

      // 同步到 store
      changes.forEach(change => {
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [onEdgesChangeHandler, edges, deleteEdge, onEdgesChange]
  );

  /**
   * 处理连接
   * 功能：创建新的连线
   * 【注意】数据传播由 store 的 addEdge 内部处理
   */
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: FlowEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'smoothstep',
      };

      setEdges(eds => addEdge(params, eds));
      addStoreEdge(newEdge);
      pushToHistory();
      // 【关键】数据传播由 store 的 addEdge 内部调用 executeUpstreamChain 处理
    },
    [setEdges, addStoreEdge, pushToHistory]
  );

  /**
   * 处理拖拽悬停
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * 处理放置
   * 功能：创建新的节点
   */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowInstance || !reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const moduleId = event.dataTransfer.getData('moduleId');

      if (typeof type === 'undefined' || !type || !moduleId) {
        return;
      }

      // 计算放置位置
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 获取模块定义
      const { modules } = useAppStore.getState();
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      // 创建新节点
      const newNode: FlowNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'custom',
        position,
        data: {
          moduleId,
          config: { ...module.config },
          label: module.name,
          instanceId: `instance_${Date.now()}`,
          status: 'idle',
        },
      };

      setNodes(nds => nds.concat(newNode));
      addNode(newNode);
      pushToHistory();
    },
    [reactFlowInstance, setNodes, addNode, pushToHistory]
  );

  /**
   * 处理节点点击
   */
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  /**
   * 处理连线点击
   */
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge]
  );

  /**
   * 处理画布点击
   * 功能：取消选择
   */
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // =========================================================================
  // 渲染
  // =========================================================================

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onViewportChange={(viewport) => setZoomLevel(viewport.zoom)}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-900"
      >
        {/* 背景网格 */}
        <Background color="#374151" gap={20} />
        {/* 控件 */}
        <Controls className="bg-gray-800 border-gray-700" />
        {/* 迷你地图 */}
        <MiniMap
          className="bg-gray-800 border-gray-700"
          nodeColor={(node) => {
            switch (node.data?.status) {
              case 'running':
                return '#3B82F6';
              case 'success':
                return '#10B981';
              case 'error':
                return '#EF4444';
              default:
                return '#6B7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  );
};

/**
 * 画布组件（包装 Provider）
 */
export const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;
