/**
 * Visual feedback utilities for enhanced user interaction
 */

/**
 * Animation timing functions for smooth transitions
 */
export const easingFunctions = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
};

/**
 * Animation durations for consistent timing
 */
export const animationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  tooltip: 200,
  hover: 250,
  focus: 150
};

/**
 * Creates CSS custom properties for dynamic animations
 */
export const createAnimationVariables = (
  isActive: boolean,
  isHovered: boolean,
  isFocused: boolean,
  isScrolling: boolean
) => {
  return {
    '--indicator-scale': isActive ? '1.25' : isHovered ? '1.1' : '1',
    '--indicator-opacity': isScrolling ? '0.6' : '1',
    '--tooltip-opacity': isHovered || isFocused ? '1' : '0',
    '--tooltip-visibility': isHovered || isFocused ? 'visible' : 'hidden',
    '--tooltip-transform': isHovered || isFocused ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-8px)',
    '--ring-opacity': isFocused ? '1' : '0',
    '--ring-scale': isFocused ? '1' : '0.95'
  } as React.CSSProperties;
};

/**
 * Generates dynamic class names based on component state
 */
export const getIndicatorClasses = (
  isActive: boolean,
  isHovered: boolean,
  isFocused: boolean,
  isScrolling: boolean,
  isKeyboardUser: boolean
) => {
  const baseClasses = [
    'w-3 h-3 rounded-full transition-all relative group',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  ];

  const stateClasses = [];

  // Active state
  if (isActive) {
    stateClasses.push('bg-primary scale-125 shadow-lg');
  } else {
    stateClasses.push('bg-muted-foreground/30');
  }

  // Hover state (only for non-active indicators)
  if (isHovered && !isActive) {
    stateClasses.push('bg-muted-foreground/60 scale-110');
  }

  // Focus state for keyboard users
  if (isFocused && isKeyboardUser) {
    stateClasses.push('ring-2 ring-ring ring-offset-2');
  }

  // Scrolling state
  if (isScrolling) {
    stateClasses.push('opacity-60 cursor-wait');
  } else {
    stateClasses.push('cursor-pointer');
  }

  // Animation duration based on state
  if (isActive) {
    stateClasses.push('duration-300');
  } else {
    stateClasses.push('duration-250');
  }

  return [...baseClasses, ...stateClasses].join(' ');
};

/**
 * Generates tooltip classes with enhanced animations
 */
export const getTooltipClasses = (
  isVisible: boolean,
  position: 'left' | 'right' = 'left'
) => {
  const baseClasses = [
    'absolute top-1/2 transform -translate-y-1/2',
    'bg-background/95 backdrop-blur-sm border border-border/40 rounded-md',
    'px-3 py-1.5 text-xs font-medium text-foreground',
    'transition-all duration-200 whitespace-nowrap pointer-events-none z-20',
    'shadow-lg shadow-black/10'
  ];

  const positionClasses = position === 'left' 
    ? ['right-6'] 
    : ['left-6'];

  const visibilityClasses = isVisible
    ? ['opacity-100 visible translate-x-0']
    : ['opacity-0 invisible -translate-x-2'];

  return [...baseClasses, ...positionClasses, ...visibilityClasses].join(' ');
};

/**
 * Creates a ripple effect for button interactions
 */
export const createRippleEffect = (
  event: React.MouseEvent<HTMLButtonElement>,
  callback?: () => void
) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
    z-index: 1;
  `;

  // Add ripple animation keyframes if not already present
  if (!document.querySelector('#ripple-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ripple-keyframes';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);

  // Remove ripple after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
    callback?.();
  }, 600);
};

/**
 * Manages tooltip positioning to prevent viewport overflow
 */
export const calculateTooltipPosition = (
  buttonElement: HTMLButtonElement,
  tooltipWidth: number = 120
): { position: 'left' | 'right'; offset: number } => {
  const buttonRect = buttonElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  // Default to left positioning
  let position: 'left' | 'right' = 'left';
  let offset = 0;

  // Check if tooltip would overflow on the left side
  const leftSpace = buttonRect.left;
  const rightSpace = viewportWidth - buttonRect.right;

  if (leftSpace < tooltipWidth + 20) { // 20px buffer
    position = 'right';
  }

  // Calculate offset if needed to keep tooltip in viewport
  if (position === 'left' && leftSpace < tooltipWidth + 20) {
    offset = tooltipWidth + 20 - leftSpace;
  } else if (position === 'right' && rightSpace < tooltipWidth + 20) {
    offset = -(tooltipWidth + 20 - rightSpace);
  }

  return { position, offset };
};

/**
 * Creates a pulse animation for active indicators
 */
export const createPulseAnimation = (element: HTMLElement, duration: number = 1000) => {
  const keyframes = [
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(1.1)', opacity: '0.8' },
    { transform: 'scale(1)', opacity: '1' }
  ];

  const options: KeyframeAnimationOptions = {
    duration,
    easing: 'ease-in-out',
    iterations: 1
  };

  return element.animate(keyframes, options);
};

/**
 * Creates a smooth glow effect for focus states
 */
export const createGlowEffect = (
  element: HTMLElement,
  color: string = 'rgba(59, 130, 246, 0.5)',
  intensity: number = 8
) => {
  element.style.boxShadow = `0 0 ${intensity}px ${color}`;
  element.style.transition = 'box-shadow 0.2s ease-in-out';
};

/**
 * Removes glow effect
 */
export const removeGlowEffect = (element: HTMLElement) => {
  element.style.boxShadow = '';
};

/**
 * Creates a smooth color transition
 */
export const createColorTransition = (
  element: HTMLElement,
  fromColor: string,
  toColor: string,
  duration: number = 300
) => {
  const keyframes = [
    { backgroundColor: fromColor },
    { backgroundColor: toColor }
  ];

  const options: KeyframeAnimationOptions = {
    duration,
    easing: 'ease-in-out',
    fill: 'forwards'
  };

  return element.animate(keyframes, options);
};

/**
 * Checks if user prefers reduced motion and adjusts animations accordingly
 */
export const getReducedMotionConfig = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    enableAnimations: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : animationDurations.normal,
    easing: prefersReducedMotion ? 'linear' : easingFunctions.easeInOut,
    enableRipple: !prefersReducedMotion,
    enablePulse: !prefersReducedMotion,
    enableGlow: !prefersReducedMotion
  };
};