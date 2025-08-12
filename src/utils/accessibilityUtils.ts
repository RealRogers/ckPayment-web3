/**
 * Accessibility utilities for the ScrollIndicator component
 */

interface KeyboardEvent {
  key: string;
  preventDefault: () => void;
  stopPropagation: () => void;
}

/**
 * Handles keyboard navigation for scroll indicator buttons
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  onActivate: () => void
): boolean => {
  const { key } = event;
  
  // Handle Enter and Space keys for activation
  if (key === 'Enter' || key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    onActivate();
    return true;
  }
  
  return false;
};

/**
 * Generates proper ARIA attributes for scroll indicator buttons
 */
export const getScrollIndicatorAriaProps = (
  sectionLabel: string,
  isActive: boolean,
  sectionIndex: number,
  totalSections: number
) => {
  return {
    'aria-label': `Navigate to ${sectionLabel} section`,
    'aria-current': isActive ? ('location' as const) : undefined,
    'aria-describedby': `scroll-indicator-description`,
    'aria-setsize': totalSections,
    'aria-posinset': sectionIndex + 1,
    role: 'button' as const,
    tabIndex: 0
  };
};

/**
 * Creates a screen reader announcement for section changes
 */
export const announceSection = (sectionLabel: string, isManualNavigation: boolean = false) => {
  const message = isManualNavigation 
    ? `Navigated to ${sectionLabel} section`
    : `Now viewing ${sectionLabel} section`;
    
  // Create a temporary element for screen reader announcement
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove the announcement after a brief delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Creates focus management utilities for the scroll indicator
 */
export const createFocusManager = () => {
  let focusedIndex = -1;
  
  const setFocusedIndex = (index: number) => {
    focusedIndex = index;
  };
  
  const getFocusedIndex = () => focusedIndex;
  
  const handleArrowNavigation = (
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onFocusChange: (newIndex: number) => void
  ): boolean => {
    const { key } = event;
    
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      
      let newIndex = currentIndex;
      
      if (key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
      } else if (key === 'ArrowDown') {
        newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
      }
      
      setFocusedIndex(newIndex);
      onFocusChange(newIndex);
      return true;
    }
    
    return false;
  };
  
  return {
    setFocusedIndex,
    getFocusedIndex,
    handleArrowNavigation
  };
};

/**
 * Checks if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Gets the appropriate scroll behavior based on user preferences
 */
export const getScrollBehavior = (): ScrollBehavior => {
  return prefersReducedMotion() ? 'auto' : 'smooth';
};

/**
 * Creates a skip link for keyboard users to bypass the scroll indicator
 */
export const createSkipLink = (targetId: string = 'main-content'): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-border';
  
  return skipLink;
};

/**
 * Validates color contrast for accessibility compliance
 */
export const validateColorContrast = (
  foregroundColor: string,
  backgroundColor: string,
  isLargeText: boolean = false
): { isValid: boolean; ratio: number; requiredRatio: number } => {
  // This is a simplified version - in a real implementation,
  // you'd use a proper color contrast calculation library
  const requiredRatio = isLargeText ? 3 : 4.5;
  
  // Placeholder calculation - replace with actual contrast calculation
  const ratio = 4.5; // This should be calculated from the actual colors
  
  return {
    isValid: ratio >= requiredRatio,
    ratio,
    requiredRatio
  };
};

/**
 * Creates a description element for the scroll indicator
 */
export const createScrollIndicatorDescription = (): HTMLElement => {
  const description = document.createElement('div');
  description.id = 'scroll-indicator-description';
  description.className = 'sr-only';
  description.textContent = 'Page navigation indicator. Use arrow keys to navigate between sections, Enter or Space to jump to a section.';
  
  return description;
};

/**
 * Manages focus restoration when the scroll indicator is used
 */
export const createFocusRestoration = () => {
  let previousFocus: HTMLElement | null = null;
  
  const saveFocus = () => {
    previousFocus = document.activeElement as HTMLElement;
  };
  
  const restoreFocus = () => {
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  };
  
  const clearSavedFocus = () => {
    previousFocus = null;
  };
  
  return {
    saveFocus,
    restoreFocus,
    clearSavedFocus
  };
};

/**
 * Creates high contrast mode detection
 */
export const detectHighContrastMode = (): boolean => {
  // Check for Windows High Contrast Mode
  return window.matchMedia('(prefers-contrast: high)').matches ||
         window.matchMedia('(-ms-high-contrast: active)').matches;
};

/**
 * Provides keyboard shortcuts information
 */
export const getKeyboardShortcuts = () => {
  return {
    navigate: 'Arrow keys to navigate between sections',
    activate: 'Enter or Space to jump to section',
    skip: 'Tab to skip to main content'
  };
};