import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  calculateActiveSection, 
  detectScrollDirection, 
  validateSections,
  getViewportInfo 
} from '../utils/sectionCalculations';
import { smoothScrollToElement } from '../utils/scrollUtils';
import { 
  CleanupManager, 
  PerformanceMonitor, 
  getPerformanceConfig,
  throttle,
  debounce 
} from '../utils/performanceUtils';

interface SectionConfig {
  id: string;
  label: string;
}

interface UseScrollDetectionOptions {
  sections: readonly SectionConfig[];
  navbarHeight: number;
  scrollOffset: number;
  debounceDelay: number;
}

interface UseScrollDetectionReturn {
  activeSection: string;
  scrollToSection: (id: string) => void;
  isScrolling: boolean;
}

interface SectionState {
  id: string;
  element: HTMLElement | null;
  isVisible: boolean;
  intersectionRatio: number;
  offsetTop: number;
  height: number;
}

interface ScrollDirection {
  direction: 'up' | 'down' | 'none';
  previousScrollTop: number;
}

const useScrollDetection = ({
  sections,
  navbarHeight,
  scrollOffset,
  debounceDelay
}: UseScrollDetectionOptions): UseScrollDetectionReturn => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [isScrolling, setIsScrolling] = useState(false);
  const [sectionStates, setSectionStates] = useState<Map<string, SectionState>>(new Map());
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>({
    direction: 'none',
    previousScrollTop: 0
  });
  
  const location = useLocation();
  const observerRef = useRef<IntersectionObserver>();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isManualScrollRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  
  // Performance optimization utilities
  const cleanupManagerRef = useRef<CleanupManager>();
  const performanceMonitorRef = useRef<PerformanceMonitor>();
  const performanceConfigRef = useRef(getPerformanceConfig());
  
  // Initialize performance utilities
  if (!cleanupManagerRef.current) {
    cleanupManagerRef.current = new CleanupManager();
  }
  if (!performanceMonitorRef.current) {
    performanceMonitorRef.current = new PerformanceMonitor(
      performanceConfigRef.current.enablePerformanceMonitoring
    );
  }

  // Optimized debounced function to update active section
  const debouncedSetActiveSection = useCallback(
    debounce((sectionId: string) => {
      performanceMonitorRef.current?.start('setActiveSection');
      setActiveSection(sectionId);
      performanceMonitorRef.current?.end('setActiveSection');
    }, performanceConfigRef.current.debounceDelay),
    []
  );

  // Throttled scroll direction tracking for better performance
  const updateScrollDirection = useCallback(
    throttle(() => {
      performanceMonitorRef.current?.start('updateScrollDirection');
      const currentScrollTop = window.pageYOffset;
      const newDirection = detectScrollDirection(currentScrollTop, lastScrollTopRef.current);
      
      setScrollDirection(newDirection);
      lastScrollTopRef.current = currentScrollTop;
      performanceMonitorRef.current?.end('updateScrollDirection');
    }, performanceConfigRef.current.throttleDelay),
    []
  );

  // Calculate active section using improved algorithm
  const getActiveSection = useCallback(() => {
    return calculateActiveSection(sectionStates, sections, scrollDirection, navbarHeight);
  }, [sectionStates, sections, scrollDirection, navbarHeight]);

  // Optimized intersection observer handler with performance monitoring
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    performanceMonitorRef.current?.start('handleIntersect');
    
    // Update scroll direction when intersection changes occur
    updateScrollDirection();
    
    setSectionStates(prevStates => {
      const newStates = new Map(prevStates);
      
      entries.forEach(entry => {
        const sectionId = entry.target.id;
        const element = entry.target as HTMLElement;
        
        // Enhanced state tracking with better error handling
        try {
          newStates.set(sectionId, {
            id: sectionId,
            element,
            isVisible: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            offsetTop: element.offsetTop,
            height: element.offsetHeight
          });
        } catch (error) {
          console.error(`Error updating section state for ${sectionId}:`, error);
        }
      });
      
      return newStates;
    });
    
    performanceMonitorRef.current?.end('handleIntersect');
  }, [updateScrollDirection]);

  // Simple and reliable scroll to section function
  const scrollToSection = useCallback((targetId: string) => {
    console.log('ScrollToSection called with:', targetId);
    
    const element = document.getElementById(targetId);
    if (!element) {
      console.warn(`Section with id "${targetId}" not found`);
      return;
    }

    // Clear any pending scroll operations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mark as manual scroll to prevent interference
    isManualScrollRef.current = true;
    setIsScrolling(true);

    // Calculate target position with proper offsets
    const elementTop = element.offsetTop;
    const targetPosition = elementTop - navbarHeight - scrollOffset;
    const finalPosition = Math.max(0, targetPosition);

    console.log('Scrolling to position:', finalPosition, 'for element:', element);

    try {
      // Smooth scroll to the section
      window.scrollTo({
        top: finalPosition,
        behavior: 'smooth'
      });

      // Update active section immediately for better UX
      setActiveSection(targetId);

      // Reset flags after scroll completes
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollRef.current = false;
        setIsScrolling(false);
        console.log('Scroll completed for:', targetId);
      }, 1000);

    } catch (error) {
      console.error('Scroll to section failed:', error);
      isManualScrollRef.current = false;
      setIsScrolling(false);
    }
  }, [navbarHeight, scrollOffset]);

  // Initialize intersection observer with performance optimizations
  useEffect(() => {
    if (location.pathname !== '/') return;

    performanceMonitorRef.current?.start('initializeObserver');
    const cleanup = cleanupManagerRef.current!;

    // Validate sections exist in DOM
    const missingSections = validateSections(sections);
    if (missingSections.length > 0) {
      console.warn('Missing sections in DOM:', missingSections);
    }

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new intersection observer with adaptive configuration
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: `-${navbarHeight}px 0px -${Math.floor(window.innerHeight * 0.3)}px 0px`,
      threshold: performanceConfigRef.current.intersectionThreshold
    };

    observerRef.current = new IntersectionObserver(handleIntersect, observerOptions);
    cleanup.addIntersectionObserver(observerRef.current);

    // Initialize section states and observe elements with error handling
    const initialStates = new Map<string, SectionState>();
    
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        try {
          observerRef.current?.observe(element);
          
          initialStates.set(id, {
            id,
            element,
            isVisible: false,
            intersectionRatio: 0,
            offsetTop: element.offsetTop,
            height: element.offsetHeight
          });
        } catch (error) {
          console.error(`Failed to observe section "${id}":`, error);
        }
      }
    });

    setSectionStates(initialStates);

    // Initialize scroll direction tracking
    lastScrollTopRef.current = window.pageYOffset;

    performanceMonitorRef.current?.end('initializeObserver');

    // Enhanced cleanup function
    return () => {
      cleanup.cleanup();
      performanceMonitorRef.current?.logSummary();
    };
  }, [location.pathname, sections, navbarHeight, handleIntersect]);

  // Update active section when section states change
  useEffect(() => {
    if (isManualScrollRef.current || sectionStates.size === 0) return;
    
    const newActiveSection = getActiveSection();
    if (newActiveSection && newActiveSection !== activeSection) {
      debouncedSetActiveSection(newActiveSection);
    }
  }, [sectionStates, activeSection, getActiveSection, debouncedSetActiveSection, scrollDirection]);

  return {
    activeSection,
    scrollToSection,
    isScrolling
  };
};

export default useScrollDetection;