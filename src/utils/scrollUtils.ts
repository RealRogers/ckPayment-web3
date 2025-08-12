/**
 * Utility functions for scroll calculations and smooth scrolling
 */

interface ScrollToOptions {
  targetId: string;
  navbarHeight: number;
  scrollOffset: number;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface ScrollPosition {
  top: number;
  behavior: ScrollBehavior;
}

/**
 * Calculates the optimal scroll position for a target element
 */
export const calculateScrollPosition = (
  targetElement: HTMLElement,
  navbarHeight: number,
  scrollOffset: number = 0
): number => {
  const elementTop = targetElement.offsetTop;
  const targetPosition = elementTop - navbarHeight - scrollOffset;
  
  // Ensure we don't scroll past document bounds
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(targetPosition, maxScroll));
};

/**
 * Enhanced smooth scroll function with interruption handling
 */
export const smoothScrollToElement = async (
  options: ScrollToOptions
): Promise<boolean> => {
  const { targetId, navbarHeight, scrollOffset, onStart, onComplete, onError } = options;
  
  return new Promise((resolve) => {
    try {
      const element = document.getElementById(targetId);
      if (!element) {
        const error = new Error(`Element with id "${targetId}" not found`);
        onError?.(error);
        resolve(false);
        return;
      }

      onStart?.();

      const targetPosition = calculateScrollPosition(element, navbarHeight, scrollOffset);
      const startTime = Date.now();
      const startPosition = window.pageYOffset;
      
      // Perform the scroll
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Monitor scroll completion
      const checkCompletion = () => {
        const currentPosition = window.pageYOffset;
        const distance = Math.abs(currentPosition - targetPosition);
        const elapsed = Date.now() - startTime;
        
        // Check if scroll is complete (within tolerance)
        if (distance < 5) {
          onComplete?.();
          resolve(true);
          return;
        }
        
        // Check for timeout (scroll interrupted or failed)
        if (elapsed > 2000) {
          onComplete?.();
          resolve(false);
          return;
        }
        
        // Continue monitoring
        requestAnimationFrame(checkCompletion);
      };
      
      // Start monitoring after a brief delay
      setTimeout(checkCompletion, 100);
      
    } catch (error) {
      onError?.(error as Error);
      resolve(false);
    }
  });
};

/**
 * Checks if smooth scrolling is supported
 */
export const isSmoothScrollSupported = (): boolean => {
  return 'scrollBehavior' in document.documentElement.style;
};

/**
 * Fallback scroll function for browsers that don't support smooth scrolling
 */
export const fallbackSmoothScroll = (
  targetPosition: number,
  duration: number = 800
): Promise<void> => {
  return new Promise((resolve) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = Date.now();
    
    const animateScroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPosition = startPosition + (distance * easeOut);
      
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    };
    
    animateScroll();
  });
};

/**
 * Gets the current scroll progress as a percentage
 */
export const getScrollProgress = (): number => {
  const scrollTop = window.pageYOffset;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  if (documentHeight <= 0) return 0;
  
  return Math.min(Math.max(scrollTop / documentHeight, 0), 1);
};

/**
 * Checks if an element is currently in the viewport
 */
export const isElementInViewport = (
  element: HTMLElement,
  navbarHeight: number = 0,
  threshold: number = 0.5
): boolean => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  const elementTop = rect.top;
  const elementBottom = rect.bottom;
  const adjustedViewportTop = navbarHeight;
  const adjustedViewportBottom = viewportHeight;
  
  // Calculate visible portion
  const visibleTop = Math.max(elementTop, adjustedViewportTop);
  const visibleBottom = Math.min(elementBottom, adjustedViewportBottom);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  
  const elementHeight = rect.height;
  const visibilityRatio = elementHeight > 0 ? visibleHeight / elementHeight : 0;
  
  return visibilityRatio >= threshold;
};

/**
 * Debounces scroll events to improve performance
 */
export const createScrollDebouncer = (
  callback: () => void,
  delay: number = 100
): (() => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

/**
 * Throttles scroll events to limit execution frequency
 */
export const createScrollThrottler = (
  callback: () => void,
  limit: number = 16 // ~60fps
): (() => void) => {
  let inThrottle: boolean;
  
  return () => {
    if (!inThrottle) {
      callback();
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};