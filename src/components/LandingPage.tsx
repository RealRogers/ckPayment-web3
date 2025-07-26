import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ScrollIndicator from "./ScrollIndicator";
import ProblemCards from "./ProblemCards";
import SolutionSection from "./SolutionSection";
import SecurityTrustSection from "./SecurityTrustSection";
import UseCasesSection from "./UseCasesSection";
import PricingSection from "./PricingSection";
import HowItWorksSection from "./HowItWorksSection";
import GameChangerSection from "./GameChangerSection";
import Footer from "./Footer";
import IntegrationSteps from "./IntegrationSteps";
import ComparisonSection from "./ComparisonSection";
import FAQSection from "./FAQSection";
import EnhancedCTASection from "./EnhancedCTASection";
import AnimatedBackground from "./AnimatedBackground";

// Constants
const NAVBAR_HEIGHT = 80;
const SCROLL_DELAY = 100; // ms
const HASH_SCROLL_DELAY = 300; // ms

/**
 * Scrolls to an element with optional offset
 * @param elementId - The ID of the element to scroll to
 * @param offset - Optional offset from the top (default: 0)
 */
const scrollToElement = (elementId: string, offset = 0): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Handles scroll behavior for the page
 * @param hash - The URL hash (if any)
 * @param pathname - The current pathname
 */
const setupScrollBehavior = (hash: string, pathname: string): (() => void) => {
  // Disable browser's scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Add loading class to prevent flash of unstyled content
  document.documentElement.classList.add('loading');
  
  // Handle hash-based navigation
  if (hash) {
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('loading');
      scrollToElement(hash.substring(1), NAVBAR_HEIGHT);
    }, HASH_SCROLL_DELAY);
    
    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('loading');
    };
  }
  
  // Handle regular page load/refresh
  window.scrollTo(0, 0);
  
  // Remove loading class after a short delay
  const timer = setTimeout(() => {
    document.documentElement.classList.remove('loading');
  }, SCROLL_DELAY);
  
  return () => {
    clearTimeout(timer);
    document.documentElement.classList.remove('loading');
  };
};

const LandingPage = () => {
  const { hash, pathname } = useLocation();

  // Handle all scroll-related behavior in a single effect
  useEffect(() => {
    const cleanup = setupScrollBehavior(hash, pathname);
    
    // Handle page load/refresh
    const handleLoad = () => {
      if (!hash) {
        window.scrollTo(0, 0);
      }
    };

    // If page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Cleanup function
    return () => {
      cleanup?.();
      window.removeEventListener('load', handleLoad);
    };
  }, [hash, pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollIndicator />
      <AnimatedBackground />
      <main className="relative z-10 space-y-0">
        <HeroSection />
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <ProblemCards />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <SolutionSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <HowItWorksSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <IntegrationSteps />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <ComparisonSection />
          </div>
        </div>
        <div className="relative">
          <div className="relative z-20">
            <GameChangerSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <UseCasesSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <SecurityTrustSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <PricingSection />
          </div>
        </div>
        <div className="relative py-12 md:py-16">
          <div className="relative z-20">
            <FAQSection />
          </div>
        </div>
        <EnhancedCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;