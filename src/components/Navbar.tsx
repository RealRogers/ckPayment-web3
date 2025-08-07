import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Menu, X, ExternalLink, Wallet, Shield, CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { buttonHoverAnimation, buttonContent } from "@/lib/animations";

// For production implementation, install Internet Identity client:
// npm install @dfinity/auth-client @dfinity/agent @dfinity/identity

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Handle Internet Identity connection
  const handleIIConnect = async () => {
    setIsWalletModalOpen(true);
    setIsConnecting(true);
    setIsConnected(false);

    try {
      // Simulate Internet Identity authentication
      // In a real implementation, you would use @dfinity/auth-client
      // const authClient = await AuthClient.create();
      // await authClient.login({ ... });

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsConnected(true);
      setIsConnecting(false);
    } catch (error) {
      console.error('Authentication failed:', error);
      setIsConnecting(false);
    }
  };

  const scrollToSection = (id: string) => {
    // Handle special navigation cases
    if (id === 'docs') {
      window.open('https://docs.ckpayment.com', '_blank');
      setIsMenuOpen(false);
      return;
    }

    if (id === 'community') {
      window.open('https://github.com/ckpayment', '_blank');
      setIsMenuOpen(false);
      return;
    }

    setIsMenuOpen(false);

    // If we're not on the home page, navigate to home with hash
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }

    // For internal sections, scroll with offset to compensate for fixed navbar
    const scrollToElement = (elementId: string) => {
      const element = document.getElementById(elementId);
      if (!element) return false;

      const navbarHeight = 80; // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });

      // Update URL hash without jumping
      window.history.pushState(null, '', `#${elementId}`);
      return true;
    };

    // Try to scroll immediately
    if (scrollToElement(id)) return;

    // If element not found, try again after a short delay
    const maxRetries = 3;
    let retryCount = 0;

    const retryScroll = setInterval(() => {
      if (scrollToElement(id) || ++retryCount >= maxRetries) {
        clearInterval(retryScroll);
      }
    }, 100);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Track active section on home page
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const sections = ['hero', 'features', 'how-it-works', 'use-cases', 'security', 'pricing', 'faq', 'get-started'];
      const navbarHeight = 80;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navItems = [
    { id: 'features', label: 'Features', hasPage: true },
    { id: 'how-it-works', label: 'How it Works', hasPage: true },
    { id: 'use-cases', label: 'Use Cases', hasPage: false },
    { id: 'security', label: 'Security & Trust', hasPage: false },
    { id: 'pricing', label: 'Pricing', hasPage: false },
    { id: 'faq', label: 'FAQ', hasPage: false },
    { id: 'docs', label: 'Docs', hasPage: false, external: true },
    { id: 'community', label: 'Community', hasPage: false, external: true },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/lovable-uploads/42dcfff0-6a9c-4d69-908b-9729c5f9000b.png"
                alt="ckPayment Logo"
                className="h-12 w-auto hover:opacity-80 transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ckPayment
              </span>
              <div className="text-xs text-muted-foreground -mt-1">
                Web3 Payments
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === '/' && activeSection === item.id;

              if (item.hasPage) {
                const isCurrentPage = (item.id === 'features' && location.pathname === '/features') ||
                  (item.id === 'how-it-works' && location.pathname === '/how-it-works');

                return (
                  <Link
                    key={item.id}
                    to={`/${item.id}`}
                    className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 ${isActive || isCurrentPage ? 'text-primary' : ''
                      }`}
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 ${isActive ? 'text-primary' : ''
                    }`}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  <span>{item.label}</span>
                  {item.external && <ExternalLink className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            {/* Test Wallet Button - Hidden on mobile */}
            {!isMobile && (
              <Button
                variant="outline"
                className={`${buttonHoverAnimation} border-primary/30 hover:border-primary/50 text-primary hover:text-white px-4 py-2`}
                onClick={handleIIConnect}
                aria-label="Test wallet connection with Internet Identity"
              >
                <div className={buttonContent}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Test Wallet
                </div>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* CTA Button - Hidden on mobile when menu is open */}
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-soft hover:shadow-glow-primary transition-all duration-300 hidden md:inline-flex px-6 py-2"
              onClick={() => scrollToSection('get-started')}
              aria-label="Get started with ckPayment"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 top-16 bg-background z-40 p-4 md:hidden animate-in fade-in duration-200"
        >
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive = location.pathname === '/' && activeSection === item.id;

              if (item.hasPage) {
                const isCurrentPage = (item.id === 'features' && location.pathname === '/features') ||
                  (item.id === 'how-it-works' && location.pathname === '/how-it-works');

                return (
                  <div key={item.id} className="space-y-2">
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`py-3 px-4 text-left hover:bg-muted rounded-md transition-colors w-full ${isActive || isCurrentPage ? 'text-primary bg-muted/50' : 'text-foreground'
                        }`}
                      aria-label={`Go to ${item.label}`}
                    >
                      {item.label}
                    </button>
                    <Link
                      to={`/${item.id}`}
                      className="py-2 px-6 text-left hover:bg-muted rounded-md transition-colors text-muted-foreground text-sm flex items-center space-x-2"
                    >
                      <span>View Detailed {item.label}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`py-3 px-4 text-left hover:bg-muted rounded-md transition-colors flex items-center space-x-2 ${isActive ? 'text-primary bg-muted/50' : 'text-foreground'
                    }`}
                  aria-label={`Go to ${item.label}`}
                >
                  <span>{item.label}</span>
                  {item.external && <ExternalLink className="h-3 w-3" />}
                </button>
              );
            })}
            {/* Test Wallet Button for Mobile */}
            <Button
              variant="outline"
              className="mt-4 w-full border-primary/30 hover:border-primary/50 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              onClick={handleIIConnect}
              aria-label="Test wallet connection with Internet Identity"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Test Wallet
            </Button>

            <Button
              className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-soft hover:shadow-glow-primary transition-all duration-300"
              onClick={() => scrollToSection('get-started')}
              aria-label="Get started with ckPayment"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span>Demo Wallet Connection</span>
            </DialogTitle>
            <DialogDescription>
              Testing secure Web3 payments with Internet Identity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isConnecting && (
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Connecting to Internet Identity...</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure authentication in progress</span>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-green-600 dark:text-green-400">
                    Wallet Connected Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ready for secure on-chain payments
                  </p>
                </div>

                {/* Security Features */}
                <div className="w-full space-y-3 mt-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Double Confirmation</div>
                      <div className="text-muted-foreground text-xs">
                        High-value transactions require 2FA via Internet Identity
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Pre-signature Validation</div>
                      <div className="text-muted-foreground text-xs">
                        Transaction details verified before signing
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => setIsWalletModalOpen(false)}
                >
                  Continue to Demo
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;