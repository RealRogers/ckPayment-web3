import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Constants
const NAVBAR_HEIGHT = 80;
const SCROLL_OFFSET = 100; // Additional offset from the top of the viewport

// Section configuration - IDs must match the actual DOM element IDs
const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it Works' },
  { id: 'integration-hub', label: 'Integration Hub' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'security', label: 'Security' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'get-started', label: 'Get Started' }
] as const;

type SectionId = typeof SECTIONS[number]['id'];

const ScrollIndicator = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  // Enhanced scroll function with better element finding and smooth scrolling
  const scrollToSection = (targetId: SectionId) => {
    console.log('🎯 Attempting to scroll to:', targetId);
    
    // First try the exact ID
    let element = document.getElementById(targetId);
    
    // If not found, try some common variations
    if (!element) {
      const variations = [
        targetId,
        targetId.replace('-', ''),
        targetId.replace('-', '_'),
        `section-${targetId}`,
        `${targetId}-section`,
        targetId.toLowerCase(),
        targetId.toUpperCase()
      ];
      
      for (const variation of variations) {
        element = document.getElementById(variation);
        if (element) {
          console.log(`✅ Found element with variation: "${variation}"`);
          break;
        }
      }
    }
    
    // If still not found, try querySelector with various selectors
    if (!element) {
      const selectors = [
        `[data-section="${targetId}"]`,
        `[data-id="${targetId}"]`,
        `.${targetId}`,
        `section[class*="${targetId}"]`,
        `div[class*="${targetId}"]`,
        `#${targetId}-section`,
        `#section-${targetId}`,
        `[id*="${targetId}"]`
      ];
      
      for (const selector of selectors) {
        try {
          const found = document.querySelector(selector) as HTMLElement;
          if (found) {
            element = found;
            console.log(`✅ Found element with selector: "${selector}"`);
            break;
          }
        } catch (e) {
          console.warn(`Warning with selector "${selector}":`, e);
        }
      }
    }
    
    if (!element) {
      console.error(`❌ Element with id "${targetId}" not found after trying all variations`);
      console.log('Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
      return;
    }

    // Calculate the target position with offset
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = elementTop - NAVBAR_HEIGHT - SCROLL_OFFSET;
    const finalPosition = Math.max(0, targetPosition);

    console.log(`📍 Element found:`, element);
    console.log(`📏 Element top: ${elementTop}, Target position: ${targetPosition}, Final position: ${finalPosition}`);

    // Update active section immediately for better UX
    setActiveSection(targetId);
    
    // Use a single, optimized smooth scroll implementation
    const startPosition = window.pageYOffset;
    const distance = finalPosition - startPosition;
    const duration = 600; // Slightly shorter duration for snappier feel
    let start: number | null = null;
    let animationFrameId: number;
    
    // Cancel any ongoing animations to prevent conflicts
    if ((window as any).__currentScrollAnimation) {
      cancelAnimationFrame((window as any).__currentScrollAnimation);
    }
    
    // Simple and efficient easing function
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    
    const animateScroll = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing to the progress
      const easedProgress = easeOutQuart(progress);
      
      // Calculate new position
      const scrollY = startPosition + distance * easedProgress;
      
      // Use window.scroll instead of window.scrollTo for better performance
      window.scroll(0, scrollY);
      
      // Continue animation if not complete
      if (progress < 1) {
        (window as any).__currentScrollAnimation = requestAnimationFrame(animateScroll);
      } else {
        // Clean up
        delete (window as any).__currentScrollAnimation;
      }
    };
    
    // Start the animation on the next frame
    (window as any).__currentScrollAnimation = requestAnimationFrame(animateScroll);
    
    // Clean up on component unmount
    return () => {
      if ((window as any).__currentScrollAnimation) {
        cancelAnimationFrame((window as any).__currentScrollAnimation);
        delete (window as any).__currentScrollAnimation;
      }
    };
  };

  // Debug: Check if sections exist and find all possible section IDs
  useEffect(() => {
    console.log('=== ScrollIndicator Debug Info ===');
    console.log('Checking configured sections in DOM:');
    
    SECTIONS.forEach(({ id, label }) => {
      const element = document.getElementById(id);
      if (element) {
        console.log(`✅ Section "${id}" (${label}): Found at position ${element.offsetTop}`);
      } else {
        console.log(`❌ Section "${id}" (${label}): Not found`);
      }
    });

    // Also check for any elements that might be sections
    console.log('\nAll elements with IDs that might be sections:');
    const allElements = document.querySelectorAll('[id]');
    allElements.forEach(el => {
      const id = el.id;
      if (id && (id.includes('hero') || id.includes('feature') || id.includes('how') || 
                 id.includes('use') || id.includes('security') || id.includes('pricing') || 
                 id.includes('faq') || id.includes('get') || id.includes('start'))) {
        console.log(`🔍 Found potential section: "${id}"`);
      }
    });
    console.log('=== End Debug Info ===');
  }, []);

  // Simple click handler
  const handleClick = (id: SectionId, index: number) => {
    console.log('Button clicked:', id, index);
    scrollToSection(id);
  };

  // Don't render on non-home pages
  if (location.pathname !== '/') {
    console.log('Not rendering ScrollIndicator - not on home page');
    return null;
  }

  console.log('Rendering ScrollIndicator');

  return (
    <nav
      aria-label="Page navigation"
      className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
      role="navigation"
    >
      <div className="bg-background/80 backdrop-blur-lg border border-border/30 rounded-full p-2 shadow-lg">
        <ul 
          className="space-y-2"
          role="list"
          aria-label="Page sections"
        >
          {SECTIONS.map(({ id, label }, index) => {
            const isActive = activeSection === id;
            const isHovered = hoveredIndex === index;
            
            return (
              <li key={id} role="listitem">
                <button
                  onClick={() => handleClick(id, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    isActive 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to ${label} section`}
                  aria-current={isActive ? 'location' : undefined}
                  type="button"
                >
                  <span className="sr-only">{label}</span>
                  
                  {/* Simple tooltip */}
                  <div 
                    className={`absolute right-6 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border/30 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-all duration-200 whitespace-nowrap pointer-events-none z-10 ${
                      isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                    aria-hidden="true"
                  >
                    {label}
                    {/* Tooltip arrow */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-border/40" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default ScrollIndicator;