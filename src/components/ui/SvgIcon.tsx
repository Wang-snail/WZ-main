/**
 * SVG 图标组件 - 确保在所有设备上正确显示
 *
 * 这个组件确保 SVG 图标在所有浏览器和设备上都能正确显示：
 * - 提供显式的 width 和 height
 * - 正确设置 viewBox
 * - 支持当前颜色和自定义颜色
 * - 性能优化（避免不必要的重渲染）
 */

import React, { memo } from 'react';

interface SvgIconProps {
  // SVG 路径数据
  d?: string;
  // 图标名称（用于缓存）
  name?: string;
  // 尺寸
  size?: number | string;
  // 宽度（优先级高于 size）
  width?: number | string;
  // 高度（优先级高于 size）
  height?: number | string;
  // 颜色
  color?: string;
  // 描边宽度
  strokeWidth?: number | string;
  // 类名
  className?: string;
  // 样式
  style?: React.CSSProperties;
  // viewBox（默认 24x24）
  viewBox?: string;
  // 填充
  fill?: string;
  // 是否是描边图标（outline）
  outline?: boolean;
  // 点击事件
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
}

// 常用图标路径数据
const ICON_PATHS = {
  // 基础图标
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  close: 'M6 18L18 6M6 6l12 12',
  check: 'M5 13l4 4L19 7',
  arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18',
  arrowRight: 'M14 5l7 7m0 0l-7 7m7-7H3',
  arrowUp: 'M5 15l7-7m0 0l7 7m-7-7v18',
  arrowDown: 'M19 9l-7 7-7-7',
  plus: 'M12 4v16m8-8H4',
  minus: 'M20 12H4',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  eyeOff: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  message: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  more: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
  loading: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};

// 创建可记忆化的 SVG 图标组件
export const SvgIcon = memo(function SvgIcon({
  d,
  name,
  size = 24,
  width,
  height,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  style,
  viewBox = '0 0 24 24',
  fill = 'none',
  outline = true,
  onClick,
}: SvgIconProps) {
  // 如果提供了名称，使用预设的路径
  const pathData = name ? ICON_PATHS[name as keyof typeof ICON_PATHS] || d : d;

  // 计算最终尺寸
  const finalWidth = width || size;
  const finalHeight = height || size;

  // 如果有路径数据，渲染路径图标
  if (pathData) {
    return (
      <svg
        className={className}
        style={style}
        width={finalWidth}
        height={finalHeight}
        viewBox={viewBox}
        fill={outline ? 'none' : color}
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        role="img"
        aria-label={name || 'icon'}
      >
        <path
          d={pathData}
          stroke={outline ? color : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={outline ? strokeWidth : undefined}
        />
      </svg>
    );
  }

  // 如果没有路径，返回空 SVG（避免渲染错误）
  return (
    <svg
      className={className}
      style={style}
      width={finalWidth}
      height={finalHeight}
      viewBox={viewBox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      role="img"
      aria-hidden="true"
    />
  );
});

// 导出图标名称类型
export type IconName = keyof typeof ICON_PATHS;

// 便捷函数：创建图标组件
export function createIconComponent(name: IconName, defaultProps?: Partial<SvgIconProps>) {
  const IconComponent = (props: Omit<SvgIconProps, 'name' | 'd'>) => (
    <SvgIcon name={name} {...defaultProps} {...props} />
  );
  IconComponent.displayName = `Icon${name.charAt(0).toUpperCase() + name.slice(1)}`;
  return IconComponent;
}

// 预定义的常用图标组件
export const IconSearch = createIconComponent('search');
export const IconHome = createIconComponent('home');
export const IconUser = createIconComponent('user');
export const IconMenu = createIconComponent('menu');
export const IconSettings = createIconComponent('settings');
export const IconDownload = createIconComponent('download');
export const IconUpload = createIconComponent('upload');
export const IconRefresh = createIconComponent('refresh');
export const IconClose = createIconComponent('close');
export const IconCheck = createIconComponent('check');
export const IconArrowLeft = createIconComponent('arrowLeft');
export const IconArrowRight = createIconComponent('arrowRight');
export const IconArrowUp = createIconComponent('arrowUp');
export const IconArrowDown = createIconComponent('arrowDown');
export const IconPlus = createIconComponent('plus');
export const IconMinus = createIconComponent('minus');
export const IconTrash = createIconComponent('trash');
export const IconEdit = createIconComponent('edit');
export const IconEye = createIconComponent('eye');
export const IconEyeOff = createIconComponent('eyeOff');
export const IconBell = createIconComponent('bell');
export const IconMail = createIconComponent('mail');
export const IconCalendar = createIconComponent('calendar');
export const IconClock = createIconComponent('clock');
export const IconStar = createIconComponent('star');
export const IconHeart = createIconComponent('heart');
export const IconTag = createIconComponent('tag');
export const IconLink = createIconComponent('link');
export const IconShare = createIconComponent('share');
export const IconMessage = createIconComponent('message');
export const IconChat = createIconComponent('chat');
export const IconSend = createIconComponent('send');
export const IconCopy = createIconComponent('copy');
export const IconHistory = createIconComponent('history');
export const IconFilter = createIconComponent('filter');
export const IconMore = createIconComponent('more');
export const IconLoading = createIconComponent('loading');
export const IconExternal = createIconComponent('external');

export default SvgIcon;
