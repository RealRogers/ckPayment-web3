/**
 * Responsive utilities for adaptive behavior across different screen sizes
 */

/**
 * Breakpoint definitions matching Tailwind CSS defaults
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

/**
 * Device type detection based on screen size and capabilities
 */
export const getDeviceType = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (width < breakpoints.sm) {
    return 'mobile';
  } else if (width < breakpoints.lg) {
    return hasTouch ? 'tablet' : 'desktop-small';
  } else {
    return 'desktop';
  }
};

/**
 * Checks if the current device is mobile
 */
export const isMobile = (): boolean => {
  return getDeviceType() === 'mobile';
};

/**
 * Checks if the current device is tablet
 */
export const isTablet = (): boolean => {
  return getDeviceType() === 'tablet';
};

/**
 * Checks if the current device is desktop
 */
export const isDesktop = (): boolean => {
  const deviceType = getDeviceType();
  return deviceType === 'desktop' || deviceType === 'desktop-small';
};

/**
 * Checks if touch is available
 */
export const hasTouchSupport = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Gets the current viewport dimensions
 */
export const getViewportDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight
  };
};

/**
 * Responsive configuration for ScrollIndicator based on device type
 */
export const getResponsiveConfig = () => {
  const deviceType = getDeviceType();
  const hasTouch = hasTouchSupport();
  const viewport = getViewportDimensions();
  
  switch (deviceType) {
    case 'mobile':
      return {
        shouldRender: false, // Hide on mobile
        position: 'bottom' as const,
        size: 'small' as const,
        spacing: 'compact' as const,
        touchOptimized: true,
        showLabels: false,
        animationDuration: 200,
        hoverDelay: 0 // No hover on touch devices
      };
      
    case 'tablet':
      return {
        shouldRender: viewport.width > 768, // Show on landscape tablets
        position: 'right' as const,
        size: 'medium' as const,
        spacing: 'normal' as const,
        touchOptimized: hasTouch,
        showLabels: true,
        animationDuration: 250,
        hoverDelay: hasTouch ? 0 : 300
      };
      
    case 'desktop-small':
      return {
        shouldRender: true,
        position: 'right' as const,
        size: 'medium' as const,
        spacing: 'normal' as const,
        touchOptimized: false,
        showLabels: true,
        animationDuration: 300,
        hoverDelay: 300
      };
      
    case 'desktop':
    default:
      return {
        shouldRender: true,
        position: 'right' as const,
        size: 'large' as const,
        spacing: 'comfortable' as const,
        touchOptimized: false,
        showLabels: true,
        animationDuration: 300,
        hoverDelay: 300
      };
  }
};

/**
 * Creates responsive classes based on configuration
 */
export const getResponsiveClasses = () => {
  const config = getResponsiveConfig();
  const deviceType = getDeviceType();
  
  const baseClasses = ['fixed', 'z-40'];
  const visibilityClasses = [];
  const positionClasses = [];
  const sizeClasses = [];
  
  // Visibility classes
  if (!config.shouldRender) {
    visibilityClasses.push('hidden');
  } else {
    // Show only on appropriate screen sizes
    if (deviceType === 'tablet') {
      visibilityClasses.push('hidden', 'md:block', 'lg:block');
    } else {
      visibilityClasses.push('hidden', 'lg:block');
    }
  }
  
  // Position classes
  switch (config.position) {
    case 'right':
      positionClasses.push('right-4', 'md:right-6', 'top-1/2', 'transform', '-translate-y-1/2');
      break;
    case 'bottom':
      positionClasses.push('bottom-4', 'left-1/2', 'transform', '-translate-x-1/2');
      break;
  }
  
  // Size classes
  switch (config.size) {
    case 'small':
      sizeClasses.push('scale-75');
      break;
    case 'medium':
      sizeClasses.push('scale-90', 'md:scale-100');
      break;
    case 'large':
    default:
      sizeClasses.push('scale-100');
      break;
  }
  
  return [...baseClasses, ...visibilityClasses, ...positionClasses, ...sizeClasses].join(' ');
};

/**
 * Gets responsive indicator button classes
 */
export const getResponsiveIndicatorClasses = () => {
  const config = getResponsiveConfig();
  
  const baseClasses = ['rounded-full', 'transition-all', 'relative', 'group'];
  const sizeClasses = [];
  const spacingClasses = [];
  const interactionClasses = [];
  
  // Size classes based on device
  switch (config.size) {
    case 'small':
      sizeClasses.push('w-2', 'h-2');
      break;
    case 'medium':
      sizeClasses.push('w-2.5', 'h-2.5', 'md:w-3', 'md:h-3');
      break;
    case 'large':
    default:
      sizeClasses.push('w-3', 'h-3');
      break;
  }
  
  // Touch optimization
  if (config.touchOptimized) {
    interactionClasses.push('touch-manipulation');
    // Larger touch targets
    sizeClasses.push('p-1'); // Adds padding for larger touch area
  }
  
  // Focus and interaction classes
  interactionClasses.push(
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2'
  );
  
  return [...baseClasses, ...sizeClasses, ...spacingClasses, ...interactionClasses].join(' ');
};

/**
 * Gets responsive container classes
 */
export const getResponsiveContainerClasses = () => {
  const config = getResponsiveConfig();
  
  const baseClasses = ['backdrop-blur-lg', 'border', 'border-border/30', 'shadow-lg'];
  const shapeClasses = [];
  const spacingClasses = [];
  const backgroundClasses = ['bg-background/80'];
  
  // Shape based on position
  switch (config.position) {
    case 'right':
      shapeClasses.push('rounded-full');
      spacingClasses.push('p-2');
      break;
    case 'bottom':
      shapeClasses.push('rounded-full', 'md:rounded-lg');
      spacingClasses.push('px-4', 'py-2', 'md:px-3', 'md:py-2');
      break;
  }
  
  // Spacing based on size
  switch (config.spacing) {
    case 'compact':
      spacingClasses.push('space-y-1');
      break;
    case 'normal':
      spacingClasses.push('space-y-1.5', 'md:space-y-2');
      break;
    case 'comfortable':
    default:
      spacingClasses.push('space-y-2');
      break;
  }
  
  return [...baseClasses, ...shapeClasses, ...spacingClasses, ...backgroundClasses].join(' ');
};

/**
 * Creates a responsive media query listener
 */
export const createResponsiveListener = (
  callback: (config: ReturnType<typeof getResponsiveConfig>) => void
) => {
  const handleResize = () => {
    callback(getResponsiveConfig());
  };
  
  // Listen for resize events
  window.addEventListener('resize', handleResize);
  
  // Listen for orientation changes on mobile
  window.addEventListener('orientationchange', () => {
    // Delay to allow for orientation change to complete
    setTimeout(handleResize, 100);
  });
  
  // Initial call
  handleResize();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
};

/**
 * Checks if the device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return window.innerWidth > window.innerHeight;
};

/**
 * Checks if the device is in portrait mode
 */
export const isPortrait = (): boolean => {
  return window.innerHeight > window.innerWidth;
};

/**
 * Gets safe area insets for devices with notches/rounded corners
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

/**
 * Optimizes touch interactions for mobile devices
 */
export const optimizeTouchInteraction = (element: HTMLElement) => {
  if (!hasTouchSupport()) return;
  
  // Prevent 300ms click delay on mobile
  element.style.touchAction = 'manipulation';
  
  // Prevent text selection on touch
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  
  // Prevent callout on iOS
  element.style.webkitTouchCallout = 'none';
  
  // Prevent highlight on tap
  element.style.webkitTapHighlightColor = 'transparent';
};

/**
 * Detects if the user is using a high-DPI display
 */
export const isHighDPI = (): boolean => {
  return window.devicePixelRatio > 1;
};

/**
 * Gets the current screen density
 */
export const getScreenDensity = (): 'low' | 'medium' | 'high' | 'ultra' => {
  const dpr = window.devicePixelRatio;
  
  if (dpr <= 1) return 'low';
  if (dpr <= 2) return 'medium';
  if (dpr <= 3) return 'high';
  return 'ultra';
};