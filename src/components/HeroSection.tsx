import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Zap, Code, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import AnimatedBackground from "./AnimatedBackground";
import DemoEmbed from "./DemoEmbed";

// Simple motion-like component for animations
const MotionDiv = ({ children, className = '', initial, animate, variants, ...props }: any) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Mock animation components
const motion = {
  div: MotionDiv,
  // Add other motion components as needed
};

const HeroSection = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const codeExample = `<!-- Add ckPayment to your dApp -->\n<script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckpay.js"></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    toast({
      title: "Code copied",
      description: "The code has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-accent/10 blur-3xl -z-10" />

      <div className="container mx-auto px-4 h-full flex items-center pt-24 pb-16 lg:pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left side - Content */}
          <div className="text-left">
            {/* Large Logo */}
            <motion.div variants={item} className="mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary to-accent p-1.5 mb-6">
                <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                  <Zap className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-primary" fill="currentColor" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-muted-foreground mb-2">
                ckPayment
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground/80 mb-8">
                Decentralized Payments, as Simple as Stripe
              </p>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Web3 Payments with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Zero Hassle
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Integrate Web3 payments into your ICP dApp with a single line of JavaScript. 
              No servers. No intermediaries. Just pure blockchain magic.
            </p>

            {/* Code snippet */}
            <motion.div variants={item} className="mb-8">
              <Card className="bg-background/50 backdrop-blur-sm border border-border/30 p-4 pr-2 overflow-hidden">
                <div className="flex items-start">
                  <div className="flex-1 overflow-x-auto">
                    <pre className="text-sm text-muted-foreground font-mono">
                      <code className="flex items-center">
                        <span className="text-foreground">$</span> npm install @ckpayment/web3
                      </code>
                    </pre>
                  </div>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg hover:bg-muted transition-colors ml-2"
                    aria-label="Copy code"
                  >
                    <Copy className={`h-4 w-4 ${copied ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </Card>
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.div variants={item}>
                <Button 
                  size="lg" 
                  variant="gradient"
                  className="px-8 py-6 text-base font-medium animate-fade-in-up"
                  style={{
                    animationDelay: '0.3s',
                    animationFillMode: 'both'
                  }}
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </motion.div>
              <motion.div variants={item}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group border-border/30 bg-background/50 hover:bg-background px-6 py-6 text-base font-medium"
                >
                  <Code className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>View Docs</span>
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-border/20 flex flex-wrap gap-8">
              {[
                { value: '1s', label: 'Integration' },
                { value: '0%', label: 'Fees' },
                { value: '∞', label: 'Scalability' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-3">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8 bg-border/30" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Demo */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <DemoEmbed />
            
            {/* Floating elements */}
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/20 flex items-center justify-center animate-float">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">100%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        style={{
          animation: 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards',
          opacity: 0
        }}
      >
        <div className="text-xs text-muted-foreground mb-2">Scroll to explore</div>
        <div className="w-px h-12 bg-gradient-to-b from-foreground/30 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;