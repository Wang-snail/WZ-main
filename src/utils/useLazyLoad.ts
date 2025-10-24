import { useState, useEffect, useCallback } from 'react';

interface UseLazyLoadOptions {
  delay?: number;
  threshold?: number;
}

export function useLazyLoad(
  loadFunction: () => Promise<void> | void,
  options: UseLazyLoadOptions = {}
) {
  const { delay = 1000, threshold = 0.1 } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const load = useCallback(() => {
    if (!isLoaded && loadFunction) {
      const timer = setTimeout(() => {
        const result = loadFunction();
        if (result instanceof Promise) {
          result.finally(() => setIsLoaded(true));
        } else {
          setIsLoaded(true);
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, loadFunction, delay]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    const element = document.createElement('div');
    element.className = 'lazy-load-placeholder';
    document.body.appendChild(element);
    observer.observe(element);

    return () => {
      observer.disconnect();
      document.body.removeChild(element);
    };
  }, [threshold]);

  useEffect(() => {
    if (isVisible) {
      load();
    }
  }, [isVisible, load]);

  return { isLoaded, isVisible };
}