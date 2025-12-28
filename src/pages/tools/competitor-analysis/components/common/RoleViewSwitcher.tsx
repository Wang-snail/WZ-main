/**
 * 角色视图切换组件
 * 允许用户在不同角色视图之间切换，并持久化偏好设置
 */

import React from 'react';
import { useCompetitorAnalysisStore } from '../../store/competitorAnalysisStore';
import type { RoleViewType } from '../../types';

/**
 * 角色配置信息
 */
interface RoleConfig {
  id: RoleViewType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  focusAreas: string[];
}

/**
 * 角色视图切换器组件
 * 
 * 功能特性：
 * - 提供直观的角色选择界面
 * - 显示不同角色的关注重点
 * - 自动保存用户偏好
 * - 平滑的切换动画效果
 */
const RoleViewSwitcher: React.FC = () => {
  const roleView = useCompetitorAnalysisStore(state => state.roleView);
  const switchRoleView = useCompetitorAnalysisStore(state => state.switchRoleView);
  const updatePreferences = useCompetitorAnalysisStore(state => state.updatePreferences);

  /**
   * 角色配置数据
   */
  const roleConfigs: RoleConfig[] = [
    {
      id: 'retail',
      name: '线上零售PM',
      description: '专注于市场定价和利润优化',
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      focusAreas: ['利润空间', 'ROI速度', '价格竞争力', '市场定位']
    },
    {
      id: 'manufacturing',
      name: '生产工厂PM',
      description: '专注于成本控制和工艺对比',
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      focusAreas: ['便携指数', '成本控制', '功能丰富度', '工艺对比']
    }
  ];

  /**
   * 处理角色切换
   */
  const handleRoleSwitch = (newRole: RoleViewType) => {
    if (newRole !== roleView) {
      switchRoleView(newRole);
      // 同时更新用户偏好设置
      updatePreferences({ defaultRoleView: newRole });
    }
  };

  /**
   * 获取角色样式类名
   */
  const getRoleStyles = (role: RoleConfig, isActive: boolean) => {
    const baseStyles = "relative flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105";

    if (isActive) {
      return role.color === 'blue'
        ? `${baseStyles} border-blue-500 bg-blue-50 shadow-lg shadow-blue-100`
        : `${baseStyles} border-green-500 bg-green-50 shadow-lg shadow-green-100`;
    }

    return `${baseStyles} border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`;
  };

  /**
   * 获取图标样式类名
   */
  const getIconStyles = (role: RoleConfig, isActive: boolean) => {
    const baseStyles = "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300";

    if (isActive) {
      return role.color === 'blue'
        ? `${baseStyles} bg-blue-500 text-white`
        : `${baseStyles} bg-green-500 text-white`;
    }

    return `${baseStyles} bg-gray-100 text-gray-600`;
  };

  /**
   * 获取文本样式类名
   */
  const getTextStyles = (role: RoleConfig, isActive: boolean) => {
    if (isActive) {
      return role.color === 'blue' ? 'text-blue-900' : 'text-green-900';
    }
    return 'text-gray-900';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 组件标题 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          选择分析视角
        </h3>
        <p className="text-sm text-gray-600">
          不同角色将看到针对性的分析重点和建议内容
        </p>
      </div>

      {/* 角色选择卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleConfigs.map((role) => {
          const isActive = roleView === role.id;

          return (
            <div
              key={role.id}
              className={getRoleStyles(role, isActive)}
              onClick={() => handleRoleSwitch(role.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRoleSwitch(role.id);
                }
              }}
              aria-pressed={isActive}
              aria-label={`切换到${role.name}视角`}
            >
              {/* 选中状态指示器 */}
              {isActive && (
                <div className="absolute top-3 right-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${role.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* 角色图标 */}
              <div className={getIconStyles(role, isActive)}>
                {role.icon}
              </div>

              {/* 角色信息 */}
              <div className="text-left">
                <h4 className={`text-lg font-semibold mb-2 ${getTextStyles(role, isActive)}`}>
                  {role.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {role.description}
                </p>

                {/* 关注重点标签 */}
                <div className="flex flex-wrap gap-2">
                  {role.focusAreas.map((area, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                          ? role.color === 'blue'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 当前选择提示 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              当前视角：
              <span className="font-medium ml-1">
                {roleConfigs.find(r => r.id === roleView)?.name}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              您的选择将自动保存，下次访问时会记住您的偏好
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleViewSwitcher;