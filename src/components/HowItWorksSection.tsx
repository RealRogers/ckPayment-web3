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
    <section 
      id="how-it-works" 
      className="py-16 md:py-24 bg-gradient-to-b from-background via-background/95 to-muted/10 relative overflow-hidden"
      aria-labelledby="how-it-works-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
            <Code className="h-4 w-4" aria-hidden="true" />
            How It Works
          </div>
          <h2 
            id="how-it-works-title"
            className="text-3xl md:text-5xl font-bold text-foreground mb-6"
          >
            Simple Integration,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Results
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Get started with ckPayment in minutes using our intuitive APIs and SDKs.
            Choose your preferred integration method and start accepting payments today.
          </p>
          <Button 
            variant="outline" 
            className="border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-300 group"
            onClick={() => window.open('https://docs.ckpayment.xyz', '_blank')}
            aria-label="View documentation in new tab"
          >
            <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
            View Documentation
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as IntegrationType)}
          className="max-w-4xl mx-auto"
          defaultValue="web"
          aria-label="Integration methods"
        >
          <TabsList 
            className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8 h-auto gap-2 sm:gap-0 bg-gradient-to-r from-muted/60 via-muted/50 to-muted/60 p-1 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm"
            role="tablist"
            aria-label="Choose integration method"
          >
            {Object.entries(integrations).map(([key, integration]) => {
              const IconComponent = integration.icon;
              const isActive = activeTab === key;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-4 h-auto min-h-[60px] sm:min-h-[80px] focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-300 rounded-lg group ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/15 to-primary/10 text-primary border border-primary/20 shadow-md' 
                      : 'hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-sm'
                  }`}
                  role="tab"
                  aria-selected={activeTab === key}
                  aria-controls={`${key}-panel`}
                  id={`${key}-tab`}
                >
                  <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                    isActive ? 'text-primary scale-110' : 'group-hover:scale-105'
                  }`} aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-medium text-center">{integration.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(integrations).map(([key, integration]) => (
            <TabsContent 
              key={key} 
              value={key}
              role="tabpanel"
              aria-labelledby={`${key}-tab`}
              id={`${key}-panel`}
              tabIndex={0}
            >
              <div className="space-y-8">
                {/* Per-tab header with comprehensive information */}
                <div className="text-center space-y-4 pb-6 border-b border-gradient-to-r from-transparent via-border/50 to-transparent relative">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 flex items-center justify-center shadow-lg border border-primary/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <integration.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">{integration.title}</h3>
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary/15 to-primary/10 text-primary border-primary/20 text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-300">
                        {integration.badge}
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
                      {integration.description}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border/30">
                      <Zap className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                      <span>Difficulty: {integration.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border/30">
                      <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                      <span>Setup time: {integration.time}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline-based step layout */}
                <div className="relative" role="list" aria-label={`${integration.title} integration steps`}>
                  {integration.steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0"
                      role="listitem"
                    >
                      {/* Timeline circle and line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-semibold text-sm sm:text-base z-10 shadow-lg border-2 border-green-300/50 hover:shadow-xl hover:scale-110 transition-all duration-300"
                          aria-label={`Step ${step.number}`}
                        >
                          {step.number}
                        </div>
                        {/* Connecting line - only show if not the last step */}
                        {index < integration.steps.length - 1 && (
                          <div 
                            className="w-0.5 bg-gradient-to-b from-green-300/50 via-border/30 to-green-300/50 mt-2 absolute z-0"
                            style={{ 
                              height: 'calc(100% - 2.5rem)',
                              top: '3rem'
                            }}
                            aria-hidden="true"
                          ></div>
                        )}
                      </div>

                      {/* Step content grid */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start min-w-0">
                        {/* Step information */}
                        <div className="space-y-2 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-foreground">
                            {step.title}
                          </h4>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            {step.description}
                          </p>
                        </div>

                        {/* Enhanced code block with Card component */}
                        <Card className="relative group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-sm border border-border/50 min-w-0">
                          {/* Language label */}
                          <div 
                            className="absolute top-3 left-3 text-xs font-mono text-muted-foreground bg-gradient-to-r from-background/95 to-background/90 px-2 py-1 rounded border border-border/50 z-20 shadow-sm"
                            aria-label={`Code language: ${step.language}`}
                          >
                            {step.language}
                          </div>
                          
                          {/* Copy button */}
                          <div className="absolute top-3 right-3 z-20">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 hover:scale-110 transition-all duration-300 opacity-70 group-hover:opacity-100 focus:ring-2 focus:ring-primary/50 focus:outline-none shadow-sm"
                              onClick={() => copyCode(step.code, step.id)}
                              aria-label={`Copy ${step.language} code for ${step.title}`}
                            >
                              {copiedStep === step.id ? (
                                <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                              ) : (
                                <Copy className="h-4 w-4" aria-hidden="true" />
                              )}
                            </Button>
                            {showCopiedPopup === step.id && (
                              <div 
                                className="absolute -top-8 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 border border-green-400"
                                role="status"
                                aria-live="polite"
                              >
                                Copied!
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-green-500"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Code content */}
                          <pre 
                            className="p-4 pt-10 pb-4 rounded-lg overflow-x-auto text-xs sm:text-sm text-foreground/90 leading-relaxed bg-gradient-to-br from-muted/20 to-muted/10 border border-border/20 group-hover:bg-gradient-to-br group-hover:from-muted/30 group-hover:to-muted/20 transition-all duration-300"
                            tabIndex={0}
                            role="region"
                            aria-label={`${step.language} code example for ${step.title}`}
                          >
                            <code>{step.code}</code>
                          </pre>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features section */}
                <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-border/50 to-transparent relative">
                  <div className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/40 rounded-xl p-4 sm:p-6 border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                    <h4 
                      className="text-sm sm:text-base font-semibold text-foreground mb-4 text-center flex items-center justify-center gap-2"
                      id={`${key}-features-title`}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                      Key Features
                    </h4>
                    <div 
                      className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6"
                      role="list"
                      aria-labelledby={`${key}-features-title`}
                    >
                      {integration.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground justify-center sm:justify-start px-3 py-2 rounded-lg bg-background/50 border border-border/30 hover:bg-background/70 hover:border-primary/20 hover:text-foreground transition-all duration-300 group"
                          role="listitem"
                        >
                          <CheckCircle 
                            className="h-4 w-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" 
                            aria-hidden="true"
                          />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default HowItWorksSection;