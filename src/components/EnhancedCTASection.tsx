import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Send, ArrowRight, Zap } from 'lucide-react';
import { Button } from './ui/button';
import ParticleNetwork from './ui/ParticleNetwork';

export default function EnhancedCTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll for fixed mobile CTA
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
      
      // Only show fixed CTA when section is not in view
      setIsScrolled(!isInView);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Submitted email:', email);
      setIsSubmitted(true);
      setEmail('');
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }
  };

  const renderMainCTA = () => (
    <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-12 md:py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <Zap className="h-8 w-8 text-green-600" fill="currentColor" />
      </div>
      
      <motion.h2 
        className="text-3xl md:text-5xl font-bold text-green-500 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Ready to Build the Future of Payments?
      </motion.h2>
      
      <motion.p 
        className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Join the decentralized payment revolution. Build with ckPayment today and be part of the Web3 financial infrastructure.
      </motion.p>

      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Button 
          asChild 
          size="lg"
          className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold text-lg px-8 py-6 group relative overflow-hidden"
        >
          <a href="https://github.com/your-org/ckpayment" target="_blank" rel="noopener noreferrer">
            <span className="relative z-10 flex items-center">
              Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </Button>
        
        <Button 
          asChild 
          variant="outline" 
          size="lg"
          className="bg-transparent border-green-300 text-green-100 hover:bg-green-800/50 hover:text-white text-lg px-8 py-6"
        >
          <a href="#demo" className="flex items-center">
            <ExternalLink className="mr-2 h-5 w-5" />
            View Demo
          </a>
        </Button>
      </motion.div>

      <motion.div 
        className="mt-8 flex flex-wrap justify-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <a 
          href="https://github.com/your-org/ckpayment" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-green-200 hover:text-white transition-colors"
          aria-label="View on GitHub"
        >
          <Github className="h-5 w-5 mr-2" />
          <span>GitHub</span>
        </a>
        <a 
          href="https://docs.ckpayment.xyz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-green-200 hover:text-white transition-colors"
          aria-label="View Documentation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span>Documentation</span>
        </a>
      </motion.div>
    </div>
  );

  const renderFixedMobileCTA = () => (
    isMobile && isScrolled && (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-800 to-green-900 p-4 shadow-lg z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white">
            <p className="font-bold">Ready to get started?</p>
            <p className="text-sm text-green-200">Join the decentralized payment revolution</p>
          </div>
          <Button 
            asChild 
            size="sm"
            className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold"
          >
            <a href="https://github.com/your-org/ckpayment" target="_blank" rel="noopener noreferrer">
              Get Started
            </a>
          </Button>
        </div>
      </div>
    )
  );

  return (
    <>
      <section 
        ref={sectionRef}
        className="relative overflow-hidden bg-gradient-to-br from-green-900 to-green-800 text-white"
      >
        {/* Particle Network Background */}
        <div className="absolute inset-0 opacity-30">
          <ParticleNetwork 
            particleColor="rgba(134, 239, 172, 0.8)" 
            lineColor="rgba(134, 239, 172, 0.3)"
            particleAmount={isMobile ? 15 : 30}
          />
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent"></div>
        
        {/* Main Content */}
        {renderMainCTA()}
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>
      
      {/* Fixed Mobile CTA */}
      {renderFixedMobileCTA()}
    </>
  );
}
