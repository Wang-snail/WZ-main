import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingProgressProps {
  message?: string;
  showLogo?: boolean;
  onComplete?: () => void;
}

export default function LoadingProgress({
  message = "正在加载 WSNAIL...",
  showLogo = true,
  onComplete
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // 显示loading组件
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 500);

    // 模拟加载进度
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 95) {
        currentProgress = 95;
        clearInterval(interval);

        // 完成后隐藏
        setTimeout(() => {
          setShowLoading(false);
          if (onComplete) onComplete();
        }, 300);
      }
      setProgress(Math.min(currentProgress, 95));
    }, 200);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!showLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 z-50 flex items-center justify-center"
    >
      <div className="text-center">
        {/* Logo */}
        {showLogo && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        )}

        {/* Loading Message */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-gray-700 mb-2"
        >
          {message}
        </motion.h3>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto mb-4"
        >
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full relative"
          >
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/2 -translate-y-1/2 left-0 w-4 h-4 bg-white/80 rounded-full shadow-md"
            />
          </motion.div>
        </motion.div>

        {/* Progress Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500"
        >
          {Math.round(progress)}%
        </motion.div>

        {/* Animated Icons */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex justify-center gap-2 mt-6"
        >
          <Loader2 className="w-4 h-4 text-blue-500" />
          <Loader2 className="w-4 h-4 text-cyan-500" style={{ animationDelay: "0.1s" }} />
          <Loader2 className="w-4 h-4 text-blue-500" style={{ animationDelay: "0.2s" }} />
        </motion.div>
      </div>
    </motion.div>
  );
}