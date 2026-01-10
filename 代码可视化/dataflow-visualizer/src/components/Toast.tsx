import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-700';
      case 'error':
        return 'bg-red-900 border-red-700';
      case 'warning':
        return 'bg-yellow-900 border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-900 border-blue-700';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${getToastColor(toast.type)} max-w-sm shadow-lg animate-in slide-in-from-right-full duration-300`}
        >
          {getToastIcon(toast.type)}
          <span className="text-white text-sm flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastComponent = () => (
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  );

  return {
    toast: addToast,
    removeToast,
    ToastComponent,
  };
};

// 全局Toast事件监听器
let globalToastFunction: ((message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => string) | null = null;

export const setGlobalToast = (toastFunction: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => string) => {
  globalToastFunction = toastFunction;
};

export const showGlobalToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {
  if (globalToastFunction) {
    globalToastFunction(message, type, duration);
  }
};

// 自定义事件监听器
if (typeof window !== 'undefined') {
  window.addEventListener('show-toast', (event: any) => {
    const { message, type, duration } = event.detail;
    // 这里会通过useToast hook来处理
  });
}