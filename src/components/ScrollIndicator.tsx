import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Constants
const NAVBAR_HEIGHT = 80;
const SCROLL_OFFSET = 100; // Additional offset from the top of the viewport
const SCROLL_DEBOUNCE_DELAY = 100; // ms

// Section configuration - IDs must match the actual DOM element IDs
const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it Works' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'security', label: 'Security' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'get-started', label: 'Get Started' }
] as const;

type SectionId = typeof SECTIONS[number]['id'];

const ScrollIndicator = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const location = useLocation();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<IntersectionObserver>();

  // Initialize Intersection Observer for better scroll detection
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as SectionId);
        }
      });
    };

    // Set up intersection observer with root margin to account for navbar
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: `-${NAVBAR_HEIGHT}px 0px -${window.innerHeight - NAVBAR_HEIGHT - SCROLL_OFFSET}px 0px`,
      threshold: 0.5
    });

    // Observe all sections
    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
    };
  }, [location.pathname]);

  const scrollToSection = (id: SectionId) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Clear any pending scroll operations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Calculate scroll position with offset for navbar
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

    // Smooth scroll to the section
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });

    // Update active section after scroll completes
    scrollTimeoutRef.current = setTimeout(() => {
      setActiveSection(id);
    }, SCROLL_DEBOUNCE_DELAY);
  };

  // Don't render on non-home pages
  if (location.pathname !== '/') return null;

  return (
    <nav 
      aria-label="Page sections"
      className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
    >
      <div className="bg-background/80 backdrop-blur-lg border border-border/30 rounded-full p-2 shadow-lg">
        <ul className="space-y-2">
          {SECTIONS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <button
                  onClick={() => scrollToSection(id)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActive 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to ${label} section`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className="sr-only">{label}</span>
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border/30 rounded-md px-2 py-1 text-xs font-medium text-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                    {label}
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