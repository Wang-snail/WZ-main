import { useState, useCallback, useEffect } from 'react';
import { AppNode } from '../data/nodes';

// 后台 admin 读取全量节点，前台 frontend 只读已发布节点
const APP_MODE = import.meta.env.VITE_APP_MODE ?? 'frontend';
const NODES_ENDPOINT = APP_MODE === 'admin' ? '/api/nodes' : '/api/nodes/published';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = (await res.json()) as { success: boolean; data?: T; error?: string };
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data as T;
}

export function useNodes() {
  const [nodes, setNodes] = useState<AppNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AppNode[]>(NODES_ENDPOINT);
      setNodes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载节点失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);

  const addNode = useCallback(async (partial: Omit<AppNode, 'id' | 'status'>) => {
    const created = await apiFetch<AppNode>('/api/nodes', {
      method: 'POST',
      body: JSON.stringify(partial),
    });
    setNodes(prev => [...prev, created]);
    return created;
  }, []);

  const updateNode = useCallback(async (id: string, changes: Partial<AppNode>) => {
    const updated = await apiFetch<AppNode>(`/api/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    setNodes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    await apiFetch(`/api/nodes/${id}`, { method: 'DELETE' });
    setNodes(prev => prev.filter(n => n.id !== id));
  }, []);

  const publishNode = useCallback(async (id: string) => {
    const updated = await apiFetch<AppNode>(`/api/nodes/${id}/publish`, { method: 'POST' });
    setNodes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const unpublishNode = useCallback(async (id: string) => {
    const updated = await apiFetch<AppNode>(`/api/nodes/${id}/unpublish`, { method: 'POST' });
    setNodes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const resetToDefault = useCallback(async () => {
    const data = await apiFetch<AppNode[]>('/api/nodes/reset', { method: 'POST' });
    setNodes(data);
  }, []);

  const publishedNodes = nodes.filter(n => n.status === 'published');
  const categories: string[] = Array.from(new Set(nodes.map(n => n.category)));

  return {
    nodes,
    publishedNodes,
    categories,
    loading,
    error,
    refresh: fetchNodes,
    addNode,
    updateNode,
    deleteNode,
    publishNode,
    unpublishNode,
    resetToDefault,
  };
}
