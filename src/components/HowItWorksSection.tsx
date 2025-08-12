import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Code, Smartphone, Server, Check, Copy, Terminal, Zap, CheckCircle, ArrowRight, Globe, LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

type IntegrationType = 'web' | 'mobile' | 'api';

interface StepConfig {
  number: number;
  title: string;
  description: string;
  code: string;
  language: string;
  id: string;
}

interface IntegrationConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  time: string;
  badge: string;
  steps: StepConfig[];
  features: string[];
}

const HowItWorksSection = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<IntegrationType>('web');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [showCopiedPopup, setShowCopiedPopup] = useState<string | null>(null);

  const copyCode = async (code: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStep(stepId);
      setShowCopiedPopup(stepId);
      toast({ 
        title: "Code copied!",
        description: "Paste it in your project to get started."
      });
      setTimeout(() => {
        setCopiedStep(null);
        setShowCopiedPopup(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy code to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const integrations: Record<IntegrationType, IntegrationConfig> = {
    web: {
      icon: Globe,
      title: "Web Integration",
      description: "Perfect for websites and web applications with browser-native implementation",
      difficulty: "Beginner",
      time: "1 minute",
      badge: "Recommended",
      steps: [
        {
          number: 1,
          title: "Add the Script",
          description: "Include our script in your HTML",
          code: '<script src="https://ckpayment.icp0.io/ckpay.js"></script>',
          language: "HTML",
          id: 'web-1'
        },
        {
          number: 2,
          title: "Initialize",
          description: "Configure with your settings",
          code: 'ckPayment.init({\n  canisterId: "your-canister-id",\n  theme: "light",\n  currency: "ckBTC"\n})',
          language: "JavaScript",
          id: 'web-2'
        },
        {
          number: 3,
          title: "Create Payment",
          description: "Launch the payment interface",
          code: 'const payment = await ckPayment.createCheckout({\n  amount: 0.1,\n  onSuccess: (txId) => console.log("Success!", txId),\n  onError: (error) => console.error("Error:", error)\n});',
          language: "JavaScript",
          id: 'web-3'
        }
      ],
      features: ['Browser-native', 'No dependencies', 'Real-time updates']
    },
    mobile: {
      icon: Smartphone,
      title: "Mobile Integration",
      description: "Cross-platform SDK for React Native, Flutter, and native mobile apps",
      difficulty: "Intermediate",
      time: "3 minutes",
      badge: "Mobile-First",
      steps: [
        {
          number: 1,
          title: "Install SDK",
          description: "Add the package to your project",
          code: '# Using npm\nnpm install @ckpayment/sdk\n\n# Or using Yarn\nyarn add @ckpayment/sdk',
          language: "Shell",
          id: 'mobile-1'
        },
        {
          number: 2,
          title: "Initialize",
          description: "Set up the payment handler",
          code: 'import { CkPayment } from "@ckpayment/sdk";\n\nconst payment = new CkPayment({\n  canisterId: "your-canister-id",\n  network: "mainnet"\n});',
          language: "JavaScript",
          id: 'mobile-2'
        },
        {
          number: 3,
          title: "Process Payment",
          description: "Create and handle payments",
          code: '// Start payment flow\nconst result = await payment.createCheckout({\n  amount: 0.1,\n  currency: "ckBTC"\n});\n\n// Handle result\nif (result.success) {\n  // Payment successful\n} else {\n  // Handle error\n}',
          language: "JavaScript",
          id: 'mobile-3'
        }
      ],
      features: ['Cross-platform', 'Offline support', 'Native UI']
    },
    api: {
      icon: Terminal,
      title: "API Integration",
      description: "Server-side REST API for secure backend implementations and enterprise solutions",
      difficulty: "Advanced",
      time: "5 minutes",
      badge: "Enterprise",
      steps: [
        {
          number: 1,
          title: "Get API Key",
          description: "Create an API key in your dashboard",
          code: 'curl -X POST https://api.ckpayment.com/v1/auth/api-key \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"your@email.com","password":"your-password"}\'',
          language: "cURL",
          id: 'api-1'
        },
        {
          number: 2,
          title: "Create Payment",
          description: "Initiate a new payment",
          code: 'curl -X POST https://api.ckpayment.com/v1/payments \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\\n    "amount": 0.1,\\n    "currency": "ckBTC",\\n    "description": "Example Payment"\\n  }\'',
          language: "cURL",
          id: 'api-2'
        },
        {
          number: 3,
          title: "Verify Payment",
          description: "Check payment status",
          code: 'curl -X GET https://api.ckpayment.com/v1/payments/PAYMENT_ID \\\n  -H "Authorization: Bearer YOUR_API_KEY"',
          language: "cURL",
          id: 'api-3'
        }
      ],
      features: ['Secure server-side', 'Batch processing', 'Webhook support']
    }
  };

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Code className="h-4 w-4" />
            How It Works
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Simple Integration,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Results
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Get started with ckPayment in minutes using our intuitive APIs and SDKs.
            Choose your preferred integration method and start accepting payments today.
          </p>
          <Button 
            variant="outline" 
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
            onClick={() => window.open('https://docs.ckpayment.xyz', '_blank')}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            View Documentation
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as IntegrationType)}
          className="max-w-4xl mx-auto"
          defaultValue="web"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto">
            {Object.entries(integrations).map(([key, integration]) => {
              const IconComponent = integration.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-4 h-auto"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">{integration.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(integrations).map(([key, integration]) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-8">
                {/* Per-tab header with comprehensive information */}
                <div className="text-center space-y-4 pb-6 border-b border-border/30">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <integration.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3">
                      <h3 className="text-2xl font-bold text-foreground">{integration.title}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {integration.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      {integration.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>{integration.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{integration.time}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline-based step layout */}
                <div className="relative">
                  {integration.steps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-6 pb-8 last:pb-0">
                      {/* Timeline circle and line */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-sm z-10">
                          {step.number}
                        </div>
                        {/* Connecting line - only show if not the last step */}
                        {index < integration.steps.length - 1 && (
                          <div className="w-0.5 h-full bg-border/30 mt-2 absolute top-10"></div>
                        )}
                      </div>

                      {/* Step content grid */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Step information */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {step.description}
                          </p>
                        </div>

                        {/* Enhanced code block with Card component */}
                        <Card className="relative group hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
                          {/* Language label */}
                          <div className="absolute top-3 left-3 text-xs font-mono text-muted-foreground bg-background/90 px-2 py-1 rounded border border-border/50 z-20">
                            {step.language}
                          </div>
                          
                          {/* Copy button */}
                          <div className="absolute top-3 right-3 z-20">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-background/80 transition-colors opacity-70 group-hover:opacity-100"
                              onClick={() => copyCode(step.code, step.id)}
                            >
                              {copiedStep === step.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            {showCopiedPopup === step.id && (
                              <div className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                                Copied!
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-green-500"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Code content */}
                          <pre className="p-4 pt-10 pb-4 rounded-lg overflow-x-auto text-sm text-foreground/90 leading-relaxed">
                            <code>{step.code}</code>
                          </pre>
                        </Card>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default HowItWorksSection;