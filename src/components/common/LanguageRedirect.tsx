import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { shouldRedirectToDefault } from '@/config/i18n';

/**
 * 语言重定向组件
 * 处理 /zh/* 到 /* 的301重定向
 */
export default function LanguageRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = shouldRedirectToDefault(location.pathname);

    if (redirectPath) {
      // 执行重定向
      // 使用 replace: true 来避免在历史记录中留下记录
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null; // 这个组件不渲染任何内容
}
