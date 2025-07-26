import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, ArrowRight, Zap, Play, Download, Settings, CheckCircle, Code, Globe, Clock, Copy, BookOpen, ExternalLink, Video, Github, MessageCircle, Mail, Users, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GetStarted = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Copy to clipboard functionality with fallback
  const copyToClipboard = async (text: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedCode(id);
        toast({
          title: "Code copied",
          description: "The code has been copied to clipboard",
        });
        setTimeout(() => setCopiedCode(null), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopiedCode(id);
          toast({
            title: "Code copied",
            description: "The code has been copied to clipboard",
          });
          setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
          console.error('Fallback copy failed: ', err);
          toast({
            title: "Copy failed",
            description: "Unable to copy code to clipboard",
            variant: "destructive",
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground />
      
      <main className="relative z-10 pt-20" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background/50 via-transparent to-background/50 overflow-hidden" aria-labelledby="hero-heading">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 backdrop-blur-sm" role="status" aria-label="Get started today">
                <Rocket className="h-3 w-3 mr-1" aria-hidden="true" />
                Get Started Today
              </Badge>
              
              <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Start Building with{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  ckPayment
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Your complete guide to integrating Web3 payments into your application. 
                Follow our step-by-step instructions and start accepting payments in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" variant="gradient" className="px-8 py-6 text-base font-medium" aria-describedby="integration-description">
                  <Zap className="h-5 w-5 mr-2" aria-hidden="true" />
                  Start Integration
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-base font-medium" aria-label="View ckPayment documentation">
                  View Documentation
                </Button>
              </div>
              <div id="integration-description" className="sr-only">
                Begin the integration process with ckPayment step-by-step guide
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">5min</div>
                  <div className="text-sm text-muted-foreground">Setup Time</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">0%</div>
                  <div className="text-sm text-muted-foreground">Transaction Fees</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30 col-span-2 md:col-span-1">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">∞</div>
                  <div className="text-sm text-muted-foreground">Scalability</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Steps Section */}
        <section className="py-20 bg-transparent" aria-labelledby="quick-start-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4" role="status" aria-label="Quick start guide section">
                <Play className="h-3 w-3 mr-1" aria-hidden="true" />
                Quick Start Guide
              </Badge>
              <h2 id="quick-start-heading" className="text-3xl md:text-4xl font-bold mb-4">
                Get Up and Running in 4 Simple Steps
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow these steps to integrate ckPayment into your application and start accepting payments.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ol className="space-y-8" role="list" aria-label="Quick start steps">
                {/* Step 1 */}
                <li>
                  <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300" role="article" aria-labelledby="step-1-heading">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold" aria-label="Step 1">
                          1
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 id="step-1-heading" className="text-xl font-bold mb-3 flex items-center gap-2">
                          <Download className="h-5 w-5 text-primary" aria-hidden="true" />
                          Install the SDK
                        </h3>
                      <p className="text-muted-foreground mb-4">
                        Add ckPayment to your project using your preferred package manager. 
                        Our SDK supports both npm and yarn installations.
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">TypeScript support included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Zero configuration required</span>
                      </div>
                    </div>
                  </div>
                </Card>
                </li>

                {/* Step 2 */}
                <li>
                  <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300" role="article" aria-labelledby="step-2-heading">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold" aria-label="Step 2">
                          2
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 id="step-2-heading" className="text-xl font-bold mb-3 flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
                          Configure Your API Key
                        </h3>
                      <p className="text-muted-foreground mb-4">
                        Initialize ckPayment with your API key and choose your network environment. 
                        Start with testnet for development and switch to mainnet for production.
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Secure API key management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Environment-based configuration</span>
                      </div>
                    </div>
                  </div>
                </Card>
                </li>

                {/* Step 3 */}
                <li>
                  <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300" role="article" aria-labelledby="step-3-heading">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold" aria-label="Step 3">
                          3
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 id="step-3-heading" className="text-xl font-bold mb-3 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
                          Create Your First Payment
                        </h3>
                      <p className="text-muted-foreground mb-4">
                        Create a payment checkout with just a few lines of code. 
                        Specify the amount, currency, and success/cancel URLs.
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Multiple currency support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Customizable checkout flow</span>
                      </div>
                    </div>
                  </div>
                </Card>
                </li>

                {/* Step 4 */}
                <li>
                  <Card className="p-6 bg-card/20 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300" role="article" aria-labelledby="step-4-heading">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold" aria-label="Step 4">
                          4
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 id="step-4-heading" className="text-xl font-bold mb-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                          Handle Payment Events
                        </h3>
                      <p className="text-muted-foreground mb-4">
                        Set up webhook endpoints to receive real-time payment notifications. 
                        Handle successful payments, failures, and refunds automatically.
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Real-time event notifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Automatic retry mechanism</span>
                      </div>
                    </div>
                  </div>
                </Card>
                </li>
              </ol>

              {/* Progress Indicator */}
              <div className="mt-12 text-center" role="status" aria-label="Progress indicator">
                <div className="flex items-center justify-center gap-2 mb-4" aria-hidden="true">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div className="w-8 h-px bg-primary/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div className="w-8 h-px bg-primary/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div className="w-8 h-px bg-primary/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete all 4 steps to start accepting payments
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Options Section */}
        <section className="py-20 bg-gradient-to-b from-transparent to-transparent" aria-labelledby="integration-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4" role="status" aria-label="Integration options section">
                <Code className="h-3 w-3 mr-1" aria-hidden="true" />
                Integration Options
              </Badge>
              <h2 id="integration-heading" className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your Integration Method
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Pick the integration approach that best fits your project and technical requirements.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* JavaScript SDK */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-colors">
                      <Code className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">JavaScript SDK</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Beginner</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        5 minutes
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Quick integration for web applications with automatic UI components
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "One-line integration",
                      "Automatic UI components",
                      "Built-in error handling",
                      "TypeScript support"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">JavaScript</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`import { ckPayment } from '@ckpayment/sdk';

const payment = ckPayment.init({
  apiKey: 'your-api-key'
});

payment.createCheckout({
  amount: 100,
  currency: 'ICP'
});`, 'js-sdk')}
                        aria-label={copiedCode === 'js-sdk' ? 'Code copied to clipboard' : 'Copy JavaScript SDK code to clipboard'}
                        title={copiedCode === 'js-sdk' ? 'Code copied!' : 'Copy code'}
                      >
                        {copiedCode === 'js-sdk' ? <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{`import { ckPayment } from '@ckpayment/sdk';

const payment = ckPayment.init({
  apiKey: 'your-api-key'
});

payment.createCheckout({
  amount: 100,
  currency: 'ICP'
});`}</code>
                    </pre>
                  </div>

                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* React Components */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 mb-4 group-hover:bg-purple-500/20 transition-colors">
                      <Rocket className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">React Components</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Beginner</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        3 minutes
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Pre-built React components for instant integration
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "Drop-in components",
                      "Customizable styling",
                      "React hooks included",
                      "TypeScript definitions"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">React</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`import { PaymentButton } from '@ckpayment/react';

function App() {
  return (
    <PaymentButton
      amount={100}
      currency="ICP"
      onSuccess={handleSuccess}
    />
  );
}`, 'react-component')}
                        aria-label={copiedCode === 'react-component' ? 'Code copied to clipboard' : 'Copy React component code to clipboard'}
                        title={copiedCode === 'react-component' ? 'Code copied!' : 'Copy code'}
                      >
                        {copiedCode === 'react-component' ? <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{`import { PaymentButton } from '@ckpayment/react';

function App() {
  return (
    <PaymentButton
      amount={100}
      currency="ICP"
      onSuccess={handleSuccess}
    />
  );
}`}</code>
                    </pre>
                  </div>

                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Install Package
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* REST API */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-green-500/10 mb-4 group-hover:bg-green-500/20 transition-colors">
                      <Globe className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">REST API</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Intermediate</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        15 minutes
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Direct API integration for maximum flexibility and control
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "Full API control",
                      "Custom UI implementation",
                      "Server-side integration",
                      "Webhook support"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-mono">cURL</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`curl -X POST https://api.ckpayment.com/v1/checkout \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100,
    "currency": "ICP"
  }'`, 'curl-api')}
                        aria-label={copiedCode === 'curl-api' ? 'Code copied to clipboard' : 'Copy cURL API code to clipboard'}
                        title={copiedCode === 'curl-api' ? 'Code copied!' : 'Copy code'}
                      >
                        {copiedCode === 'curl-api' ? <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{`curl -X POST https://api.ckpayment.com/v1/checkout \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100,
    "currency": "ICP"
  }'`}</code>
                    </pre>
                  </div>

                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View API Docs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-20 bg-gradient-to-b from-transparent to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <BookOpen className="h-3 w-3 mr-1" />
                Developer Resources
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive documentation, examples, and tools to help you build amazing payment experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* API Documentation */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-3 group-hover:bg-blue-500/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">API Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete API reference with detailed endpoints, parameters, and response examples.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>REST API Reference</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Authentication Guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Error Handling</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View API Docs
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* SDK Documentation */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-purple-500/10 mb-3 group-hover:bg-purple-500/20 transition-colors">
                    <Code className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">SDK Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed guides for JavaScript, React, and other SDK implementations.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>JavaScript SDK Guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>React Components</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>TypeScript Definitions</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View SDK Docs
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Code Examples */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-green-500/10 mb-3 group-hover:bg-green-500/20 transition-colors">
                    <Github className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Code Examples</h3>
                  <p className="text-sm text-muted-foreground">
                    Ready-to-use code examples and sample applications for different use cases.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Sample Applications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Integration Patterns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Best Practices</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Browse Examples
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Video Tutorials */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-red-500/10 mb-3 group-hover:bg-red-500/20 transition-colors">
                    <Video className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step video guides to help you integrate and customize ckPayment.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Getting Started Series</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Advanced Integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Troubleshooting Tips</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Watch Tutorials
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Community Support */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-orange-500/10 mb-3 group-hover:bg-orange-500/20 transition-colors">
                    <Globe className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Community Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Join our developer community for support, discussions, and updates.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Discord Community</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>GitHub Discussions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Developer Forum</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Join Community
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              {/* Help Center */}
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 mb-3 group-hover:bg-cyan-500/20 transition-colors">
                    <Settings className="h-6 w-6 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Help Center</h3>
                  <p className="text-sm text-muted-foreground">
                    Find answers to common questions and get help with troubleshooting.
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>FAQ Section</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Troubleshooting Guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Contact Support</span>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Get Help
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Support and Community Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Users className="h-3 w-3 mr-1" />
                Support & Community
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get Help When You Need It
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our community and support team are here to help you succeed with ckPayment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              {/* Discord Community */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group">
                <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <MessageCircle className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Discord Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our active Discord server for real-time help and discussions.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Join Discord
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Card>

              {/* Email Support */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group">
                <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get direct support from our team via email for technical issues.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Card>

              {/* GitHub Issues */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group">
                <div className="inline-flex p-3 rounded-xl bg-gray-500/10 mb-4 group-hover:bg-gray-500/20 transition-colors">
                  <Github className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">GitHub Issues</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Report bugs, request features, or contribute to our open source projects.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View GitHub
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Card>

              {/* FAQ */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group">
                <div className="inline-flex p-3 rounded-xl bg-yellow-500/10 mb-4 group-hover:bg-yellow-500/20 transition-colors">
                  <HelpCircle className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">FAQ</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find quick answers to the most commonly asked questions.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View FAQ
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 backdrop-blur-sm">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Our support team is available 24/7 to help you with any questions or issues you might have. 
                    Don't hesitate to reach out!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="gradient">
                      <Mail className="h-5 w-5 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" size="lg">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Live Chat
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default GetStarted;