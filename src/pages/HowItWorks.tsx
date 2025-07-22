import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Settings, 
  CreditCard,
  Code,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Play,
  Copy,
  ExternalLink,
  Layers,
  Network,
  Server,
  Database,
  Lock,
  Users,
  Smartphone,
  Monitor,
  Workflow,
  GitBranch,
  Terminal,
  FileCode,
  Rocket,
  BookOpen,
  Github
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const quickSteps = [
    {
      icon: Download,
      title: "Import",
      description: "Add the ckPayment script to your HTML",
      code: '<script src="https://ckpayment.icp0.io/ckpay.js"></script>',
      time: "30 seconds"
    },
    {
      icon: Settings,
      title: "Configure",
      description: "Initialize the payment component with your settings",
      code: 'ckPayment.init({ canisterId: "your-id", amount: 0.1 })',
      time: "1 minute"
    },
    {
      icon: CreditCard,
      title: "Accept Payments",
      description: "Start receiving payments in ckBTC, ckETH and other tokens",
      code: 'ckPayment.createCheckout({ currency: "ckBTC" })',
      time: "Instant"
    }
  ];

  const detailedSteps = [
    {
      id: "setup",
      title: "Project Setup",
      description: "Get your development environment ready",
      icon: Terminal,
      steps: [
        "Create or open your existing web project",
        "Ensure you have a basic HTML structure",
        "No backend or server setup required",
        "Works with any frontend framework"
      ],
      codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My dApp with ckPayment</title>
</head>
<body>
    <div id="app">
        <!-- Your app content -->
    </div>
</body>
</html>`,
      tips: [
        "ckPayment works with React, Vue, Angular, or vanilla JavaScript",
        "No build tools or compilation required",
        "Compatible with existing CSS frameworks"
      ]
    },
    {
      id: "integration",
      title: "SDK Integration",
      description: "Add ckPayment to your application",
      icon: Code,
      steps: [
        "Include the ckPayment script in your HTML",
        "The SDK loads automatically and is ready to use",
        "All dependencies are bundled - no additional installs",
        "Works offline after initial load"
      ],
      codeExample: `<!-- Add this to your HTML head -->
<script src="https://ckpayment.icp0.io/ckpay.js"></script>

<!-- Or use ES6 imports -->
<script type="module">
  import { ckPayment } from 'https://ckpayment.icp0.io/ckpay.esm.js';
</script>`,
      tips: [
        "The script is served from ICP canisters - 100% decentralized",
        "Automatic updates ensure you always have the latest features",
        "CDN-like performance with blockchain reliability"
      ]
    },
    {
      id: "configuration",
      title: "Configuration",
      description: "Set up your payment parameters",
      icon: Settings,
      steps: [
        "Initialize ckPayment with your canister ID",
        "Configure supported currencies and amounts",
        "Set up callback functions for payment events",
        "Customize the UI to match your brand"
      ],
      codeExample: `// Basic configuration
ckPayment.init({
  canisterId: "rdmx6-jaaaa-aaaah-qcaiq-cai",
  network: "mainnet", // or "testnet"
  currencies: ["ckBTC", "ckETH", "ICP"],
  theme: {
    primaryColor: "#5DDE84",
    borderRadius: "8px"
  }
});

// Advanced configuration
ckPayment.configure({
  onSuccess: (payment) => {
    console.log("Payment successful:", payment);
    // Handle successful payment
  },
  onError: (error) => {
    console.error("Payment failed:", error);
    // Handle payment error
  },
  onCancel: () => {
    console.log("Payment cancelled");
    // Handle payment cancellation
  }
});`,
      tips: [
        "Your canister ID is your unique identifier on ICP",
        "Test on testnet before going live",
        "Callbacks help you integrate with your app's flow"
      ]
    },
    {
      id: "implementation",
      title: "Payment Implementation",
      description: "Create payment flows in your application",
      icon: CreditCard,
      steps: [
        "Create payment buttons or triggers",
        "Define payment amounts and currencies",
        "Handle payment success and failure states",
        "Integrate with your app's user experience"
      ],
      codeExample: `// Simple payment button
document.getElementById('pay-button').addEventListener('click', () => {
  ckPayment.createCheckout({
    amount: 0.001, // Amount in the selected currency
    currency: "ckBTC",
    description: "Premium subscription",
    metadata: {
      userId: "user123",
      productId: "premium-plan"
    }
  });
});

// React component example
function PaymentButton({ amount, currency, onSuccess }) {
  const handlePayment = async () => {
    try {
      const result = await ckPayment.createCheckout({
        amount,
        currency,
        description: "Product purchase"
      });
      onSuccess(result);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <button onClick={handlePayment}>
      Pay {amount} {currency}
    </button>
  );
}`,
      tips: [
        "Always handle both success and error cases",
        "Use metadata to track payments in your system",
        "Consider user experience during payment flow"
      ]
    },
    {
      id: "testing",
      title: "Testing & Deployment",
      description: "Test your integration and go live",
      icon: Rocket,
      steps: [
        "Test payments on the ICP testnet",
        "Verify payment callbacks and error handling",
        "Test on different devices and browsers",
        "Deploy to production when ready"
      ],
      codeExample: `// Testing configuration
ckPayment.init({
  canisterId: "your-canister-id",
  network: "testnet", // Use testnet for testing
  debug: true // Enable debug logging
});

// Test payment with small amounts
ckPayment.createCheckout({
  amount: 0.0001, // Small test amount
  currency: "ckBTC",
  description: "Test payment"
});

// Production configuration
ckPayment.init({
  canisterId: "your-canister-id",
  network: "mainnet",
  debug: false
});`,
      tips: [
        "Always test thoroughly before going live",
        "Use small amounts for testing",
        "Monitor your first live payments closely"
      ]
    }
  ];

  const architectureSteps = [
    {
      title: "User Initiates Payment",
      description: "User clicks payment button in your dApp",
      icon: Users,
      details: [
        "User selects product or service",
        "Payment amount and currency determined",
        "ckPayment modal opens with payment options"
      ]
    },
    {
      title: "Wallet Connection",
      description: "User connects their Internet Computer wallet",
      icon: Lock,
      details: [
        "Supports Plug, Stoic, and other ICP wallets",
        "Secure authentication via Internet Identity",
        "No private keys stored or transmitted"
      ]
    },
    {
      title: "Transaction Processing",
      description: "Payment is processed on the Internet Computer",
      icon: Network,
      details: [
        "Transaction submitted to ICP network",
        "Smart contract validates payment",
        "Funds transferred to your canister"
      ]
    },
    {
      title: "Confirmation & Callback",
      description: "Payment confirmed and your app is notified",
      icon: CheckCircle,
      details: [
        "Transaction confirmed on blockchain",
        "Your callback functions are triggered",
        "User receives payment confirmation"
      ]
    }
  ];

  const supportedCurrencies = [
    {
      symbol: "ckBTC",
      name: "Chain-key Bitcoin",
      description: "Bitcoin on Internet Computer",
      icon: "₿"
    },
    {
      symbol: "ckETH",
      name: "Chain-key Ethereum",
      description: "Ethereum on Internet Computer", 
      icon: "Ξ"
    },
    {
      symbol: "ICP",
      name: "Internet Computer",
      description: "Native ICP tokens",
      icon: "◈"
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading How It Works...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-background/20 pointer-events-none" style={{ zIndex: 5 }} />
      
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/42dcfff0-6a9c-4d69-908b-9729c5f9000b.png" 
                alt="ckPayment Logo" 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-muted/10 to-background/90 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 backdrop-blur-sm">
              <Workflow className="h-3 w-3 mr-1" />
              Complete Integration Guide
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              How{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                ckPayment Works
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Learn how to integrate Web3 payments into your application in minutes, 
              not hours. From setup to deployment, we'll guide you through every step.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { value: "< 5 min", label: "Setup Time", icon: Zap },
                { value: "3 steps", label: "Integration", icon: Layers },
                { value: "0 servers", label: "Required", icon: Server },
                { value: "100%", label: "On-chain", icon: Shield }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/30">
                    <IconComponent className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg font-medium group">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Integration
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Steps */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Quick Start
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fastest way to add Web3 payments to your application
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {quickSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="relative p-8 bg-card/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:bg-card/90 transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < quickSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-4 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {step.time}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Code Example */}
                  <div className="bg-muted/10 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(step.code, `quick-${index}`)}
                      className="absolute top-2 right-2 p-2 rounded-md hover:bg-muted/20 transition-colors"
                    >
                      <Copy className={`h-4 w-4 ${copiedCode === `quick-${index}` ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </button>
                    <code className="text-sm font-mono text-primary break-all">
                      {step.code}
                    </code>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Implementation Guide */}
      <section className="py-20 bg-muted/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <FileCode className="h-3 w-3 mr-1" />
              Detailed Guide
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Implementation Guide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Step-by-step instructions for integrating ckPayment into your application
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Step Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {detailedSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeStep === index 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>

            {/* Active Step Content */}
            <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-sm border-border/30">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {React.createElement(detailedSteps[activeStep].icon, { className: "h-8 w-8 text-primary" })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{detailedSteps[activeStep].title}</h3>
                      <p className="text-muted-foreground">{detailedSteps[activeStep].description}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {detailedSteps[activeStep].steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">💡 Pro Tips</h4>
                    <ul className="space-y-1">
                      {detailedSteps[activeStep].tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="bg-muted/10 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">Code Example</span>
                      <button
                        onClick={() => copyToClipboard(detailedSteps[activeStep].codeExample, `detailed-${activeStep}`)}
                        className="p-2 rounded-md hover:bg-muted/20 transition-colors"
                      >
                        <Copy className={`h-4 w-4 ${copiedCode === `detailed-${activeStep}` ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </button>
                    </div>
                    <pre className="text-sm font-mono text-foreground overflow-x-auto">
                      <code>{detailedSteps[activeStep].codeExample}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">
              <GitBranch className="h-3 w-3 mr-1" />
              Architecture
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Payments Flow Through the System</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the complete payment process from user interaction to confirmation
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {architectureSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Connector Line */}
                    {index < architectureSteps.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-primary/50 to-transparent"></div>
                    )}
                    
                    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:bg-card/90 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold">{step.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              Step {index + 1}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          <ul className="space-y-1">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-center space-x-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="py-20 bg-muted/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Globe className="h-3 w-3 mr-1" />
              Supported Currencies
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Accept Multiple Cryptocurrencies</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ckPayment supports the most popular cryptocurrencies on Internet Computer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {supportedCurrencies.map((currency, index) => (
              <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:bg-card/90 transition-all duration-300">
                <div className="text-4xl font-bold text-primary mb-4">{currency.icon}</div>
                <h3 className="text-xl font-bold mb-2">{currency.symbol}</h3>
                <p className="text-lg text-muted-foreground mb-2">{currency.name}</p>
                <p className="text-sm text-muted-foreground">{currency.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Build?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Start Integrating ckPayment Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of developers building the future of Web3 payments. 
                Get started with our comprehensive documentation and examples.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group">
                  <Terminal className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Coding Now
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group">
                  <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Read Full Docs
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>100% On-chain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-500 flex-shrink-0" />
                  <span>Sub-second Speed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-3 sm:h-4 w-3 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Global Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-3 sm:h-4 w-3 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span>Enterprise Security</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;