import React, { useState, useEffect, useRef } from 'react';

interface ResizableSidebarProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
  className?: string;
}

export default function ResizableSidebar({
  children,
  initialWidth = 256,
  minWidth = 200,
  maxWidth = 600,
  side = 'left',
  className = ''
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newWidth = width;
      if (side === 'left') {
        if (sidebarRef.current) {
          newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
        }
      } else {
        if (sidebarRef.current) {
          newWidth = sidebarRef.current.getBoundingClientRect().right - e.clientX;
        }
      }
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, side, minWidth, maxWidth, width]);

  return (
    <div 
      ref={sidebarRef}
      style={{ width: `${width}px` }} 
      className={`relative shrink-0 flex flex-col ${className}`}
    >
      {children}
      <div 
        className={`absolute top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 z-50 transition-colors ${side === 'left' ? '-right-1' : '-left-1'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      />
    </div>
  );
}
