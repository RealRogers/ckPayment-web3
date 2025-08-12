import { useState } from 'react';
import { useLocation } from 'react-router-dom';

// Constants
const NAVBAR_HEIGHT = 80;
const SCROLL_OFFSET = 100;

// Section configuration
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

const SimpleScrollIndicator = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');

  // Simple scroll function
  const scrollToSection = (targetId: string) => {
    console.log('Simple scroll to:', targetId);
    
    const element = document.getElementById(targetId);
    if (!element) {
      console.warn(`Section with id "${targetId}" not found`);
      return;
    }

    const elementTop = element.offsetTop;
    const targetPosition = elementTop - NAVBAR_HEIGHT - SCROLL_OFFSET;
    const finalPosition = Math.max(0, targetPosition);

    console.log('Scrolling to position:', finalPosition);

    window.scrollTo({
      top: finalPosition,
      behavior: 'smooth'
    });

    setActiveSection(targetId);
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
          {SECTIONS.map(({ id, label }, index) => {
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

export default SimpleScrollIndicator;