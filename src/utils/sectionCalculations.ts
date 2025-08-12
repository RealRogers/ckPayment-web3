interface SectionConfig {
  id: string;
  label: string;
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

/**
 * Calculates the active section based on intersection ratios and scroll position
 * Handles edge cases when multiple sections are visible simultaneously
 */
export const calculateActiveSection = (
  sectionStates: Map<string, SectionState>,
  sections: readonly SectionConfig[],
  scrollDirection: ScrollDirection,
  navbarHeight: number
): string => {
  // Get all visible sections with intersection ratios
  const visibleSections = Array.from(sectionStates.values())
    .filter(section => section.isVisible && section.intersectionRatio > 0)
    .sort((a, b) => a.offsetTop - b.offsetTop); // Sort by position on page

  // If no sections are visible, use fallback calculation
  if (visibleSections.length === 0) {
    return calculateFallbackActiveSection(sections, navbarHeight);
  }

  // If only one section is visible, return it
  if (visibleSections.length === 1) {
    return visibleSections[0].id;
  }

  // Multiple sections visible - use advanced logic
  return calculateMultiSectionActive(visibleSections, scrollDirection);
};

/**
 * Fallback calculation when no sections are intersecting
 * Uses scroll position to determine the closest section
 */
const calculateFallbackActiveSection = (
  sections: readonly SectionConfig[],
  navbarHeight: number
): string => {
  const scrollTop = window.pageYOffset;
  const viewportTop = scrollTop + navbarHeight;
  const viewportCenter = scrollTop + window.innerHeight / 2;
  
  let closestSection = sections[0];
  let minDistance = Infinity;
  
  sections.forEach(({ id }) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    const sectionTop = element.offsetTop;
    const sectionBottom = sectionTop + element.offsetHeight;
    const sectionCenter = sectionTop + element.offsetHeight / 2;
    
    // Check if viewport top is within this section
    if (viewportTop >= sectionTop && viewportTop < sectionBottom) {
      closestSection = { id, label: '' };
      return;
    }
    
    // Otherwise, find the section closest to viewport center
    const distance = Math.abs(viewportCenter - sectionCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestSection = { id, label: '' };
    }
  });
  
  return closestSection.id;
};

/**
 * Handles the case when multiple sections are visible
 * Uses intersection ratios and scroll direction for better accuracy
 */
const calculateMultiSectionActive = (
  visibleSections: SectionState[],
  scrollDirection: ScrollDirection
): string => {
  // Filter sections that meet the minimum visibility threshold (50%)
  const significantlyVisible = visibleSections.filter(
    section => section.intersectionRatio >= 0.5
  );
  
  // If we have sections that are significantly visible, prioritize them
  if (significantlyVisible.length > 0) {
    // If scrolling down, prefer the lower section
    // If scrolling up, prefer the upper section
    if (scrollDirection.direction === 'down') {
      return significantlyVisible[significantlyVisible.length - 1].id;
    } else if (scrollDirection.direction === 'up') {
      return significantlyVisible[0].id;
    }
    
    // If not scrolling, choose the one with highest intersection ratio
    return significantlyVisible.reduce((prev, current) =>
      current.intersectionRatio > prev.intersectionRatio ? current : prev
    ).id;
  }
  
  // No sections are significantly visible, use the one with highest ratio
  return visibleSections.reduce((prev, current) =>
    current.intersectionRatio > prev.intersectionRatio ? current : prev
  ).id;
};

/**
 * Detects scroll direction based on current and previous scroll positions
 */
export const detectScrollDirection = (
  currentScrollTop: number,
  previousScrollTop: number,
  threshold: number = 5
): ScrollDirection => {
  const diff = currentScrollTop - previousScrollTop;
  
  if (Math.abs(diff) < threshold) {
    return {
      direction: 'none',
      previousScrollTop: currentScrollTop
    };
  }
  
  return {
    direction: diff > 0 ? 'down' : 'up',
    previousScrollTop: currentScrollTop
  };
};

/**
 * Validates that all required sections exist in the DOM
 * Returns array of missing section IDs
 */
export const validateSections = (sections: readonly SectionConfig[]): string[] => {
  const missingSections: string[] = [];
  
  sections.forEach(({ id }) => {
    const element = document.getElementById(id);
    if (!element) {
      missingSections.push(id);
    }
  });
  
  return missingSections;
};

/**
 * Gets the current viewport information for calculations
 */
export const getViewportInfo = (navbarHeight: number) => {
  const scrollTop = window.pageYOffset;
  const viewportHeight = window.innerHeight;
  const viewportTop = scrollTop + navbarHeight;
  const viewportBottom = scrollTop + viewportHeight;
  const viewportCenter = scrollTop + viewportHeight / 2;
  
  return {
    scrollTop,
    viewportHeight,
    viewportTop,
    viewportBottom,
    viewportCenter
  };
};

/**
 * Calculates section boundaries and positions
 */
export const calculateSectionBoundaries = (
  sections: readonly SectionConfig[]
): Map<string, { top: number; bottom: number; center: number; height: number }> => {
  const boundaries = new Map();
  
  sections.forEach(({ id }) => {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const top = element.offsetTop;
      const height = element.offsetHeight;
      const bottom = top + height;
      const center = top + height / 2;
      
      boundaries.set(id, { top, bottom, center, height });
    }
  });
  
  return boundaries;
};

/**
 * Determines if a section should be considered active based on visibility rules
 */
export const shouldSectionBeActive = (
  sectionState: SectionState,
  viewportInfo: ReturnType<typeof getViewportInfo>,
  minVisibilityRatio: number = 0.5
): boolean => {
  if (!sectionState.element || !sectionState.isVisible) {
    return false;
  }
  
  // Check if section meets minimum visibility threshold
  if (sectionState.intersectionRatio < minVisibilityRatio) {
    return false;
  }
  
  return true;
};