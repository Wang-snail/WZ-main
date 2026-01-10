/**
 * ============================================================================
 * 文件名：错误边界.tsx
 * 功能描述：React 错误边界组件
 *
 * 本组件用于捕获子组件渲染过程中的错误，
 * 防止错误导致整个应用崩溃，显示友好的错误提示。
 *
 * 错误边界特点：
 * - 只能捕获渲染过程中的错误
 * - 不能捕获事件处理程序中的错误
 * - 不能捕获异步代码中的错误
 * - 不能捕获服务端渲染错误
 *
 * 工作原理：
 * 1. 子组件渲染出错时，getDerivedStateFromError 被调用
 * 2. 状态更新后，render 方法显示错误 UI
 * 3. 用户可以看到错误信息并定位问题
 * ============================================================================
 */

// 导入 React 核心库
import React from 'react';

/**
 * 序列化错误信息
 *
 * 功能说明：
 * 将错误对象转换为可读的字符串格式
 *
 * @param error - 错误对象（任意类型）
 * @returns 可读的字符串
 */
const 序列化错误 = (error: any): string => {
  // 如果是 Error 对象，拼接 message 和 stack
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }

  // 其他类型转换为 JSON 字符串
  return JSON.stringify(error, null, 2);
};

/**
 * 错误边界组件
 *
 * 功能说明：
 * 捕获子组件的渲染错误，显示错误信息而不是崩溃
 *
 * 使用场景：
 * - 包裹整个应用
 * - 包裹可能出错的子树
 *
 * 状态说明：
 * - hasError: 是否有错误发生
 * - error: 错误信息
 */
export class 错误边界 extends React.Component<
  // 子组件
  { children: React.ReactNode },
  // 状态
  { hasError: boolean; error: any }
> {
  /**
   * 构造函数
   *
   * @param props - 组件属性
   */
  constructor(props: { children: React.ReactNode }) {
    // 调用父类构造函数
    super(props);

    // 初始化状态
    this.state = { hasError: false, error: null };
  }

  /**
   * 从错误中获取状态
   *
   * 功能说明：
   * 当子组件渲染出错时，此方法被调用
   * 返回新的状态来显示错误 UI
   *
   * @param error - 捕获到的错误
   * @returns 新的状态对象
   */
  static getDerivedStateFromError(error: any) {
    // 返回包含错误信息的状态
    return { hasError: true, error };
  }

  /**
   * 渲染方法
   *
   * @returns 渲染结果
   */
  render() {
    // 如果有错误，显示错误 UI
    if (this.state.hasError) {
      return (
        // 错误容器：红色边框
        <div className="p-4 border border-red-500 rounded">
          {/* 错误标题 */}
          <h2 className="text-red-500">发生错误</h2>

          {/* 错误详情 */}
          <pre className="mt-2 text-sm">
            {序列化错误(this.state.error)}
          </pre>
        </div>
      );
    }

    // 没有错误，渲染子组件
    return this.props.children;
  }
}
