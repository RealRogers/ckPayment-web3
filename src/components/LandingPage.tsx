import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ScrollIndicator from "./ScrollIndicator";
import ProblemSection from "./ProblemSection";
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

const LandingPage = () => {
  const location = useLocation();

  // Ensure page starts at top and handle hash navigation
  useEffect(() => {
    // Add loading class to prevent smooth scroll during load
    document.documentElement.classList.add('loading');
    
    // Disable browser's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force immediate scroll to top
    window.scrollTo(0, 0);

    // If there's a hash in the URL, handle it properly
    if (location.hash) {
      // Wait for the page to render, then scroll to the hash
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('loading');
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.offsetTop - navbarHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
      return () => {
        clearTimeout(timer);
        document.documentElement.classList.remove('loading');
      };
    } else {
      // No hash, ensure we start at the top
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('loading');
      }, 500);
      
      return () => {
        clearTimeout(timer);
        document.documentElement.classList.remove('loading');
      };
    }
  }, [location.hash, location.pathname]);

  // Additional effect to prevent any unwanted scrolling during component mounting
  useEffect(() => {
    const preventScroll = () => {
      if (window.scrollY > 0 && !location.hash) {
        window.scrollTo(0, 0);
      }
    };

    // Immediate scroll to top
    preventScroll();

    // Check scroll position multiple times during initial load
    const intervals = [10, 50, 100, 200, 500].map(delay => 
      setTimeout(preventScroll, delay)
    );

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, [location.hash]);

  // Handle navigation from other pages
  useEffect(() => {
    if (location.pathname === '/' && !location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // Ensure scroll to top on page load/refresh
  useEffect(() => {
    const handleLoad = () => {
      if (!location.hash) {
        window.scrollTo(0, 0);
      }
    };

    // If page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollIndicator />
      <main className="space-y-0">
        <HeroSection />
        <div className="py-12 md:py-16">
          <ProblemCards />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <ProblemSection />
        </div>
        <div className="py-12 md:py-16">
          <SolutionSection />
        </div>
        <div className="py-12 md:py-16 bg-muted/30">
          <HowItWorksSection />
        </div>
        <div className="py-12 md:py-16">
          <IntegrationSteps />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <ComparisonSection />
        </div>
        <GameChangerSection />
        <div className="py-12 md:py-16 bg-muted/30">
          <UseCasesSection />
        </div>
        <div className="py-12 md:py-16">
          <SecurityTrustSection />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <PricingSection />
        </div>
        <div className="py-12 md:py-16">
          <FAQSection />
        </div>
        <EnhancedCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;