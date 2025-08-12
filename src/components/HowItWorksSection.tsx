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
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Terminal className="h-4 w-4 mr-2" /> Developer Friendly
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simple Integration, 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Powerful Results</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started with ckPayment in minutes using our intuitive APIs and SDKs
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as IntegrationType)}
          className="max-w-4xl mx-auto"
          defaultValue="web"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="web" className="flex items-center">
              <integrations.web.icon className="h-4 w-4 mr-2" /> Web
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center">
              <integrations.mobile.icon className="h-4 w-4 mr-2" /> Mobile
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center">
              <integrations.api.icon className="h-4 w-4 mr-2" /> API
            </TabsTrigger>
          </TabsList>

          {Object.entries(integrations).map(([key, integration]) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-6">
                {integration.steps.map((step) => (
                  <div key={step.id} className="relative group">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.number}. {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute top-2 left-2 text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded">
                        {step.language}
                      </div>
                      <pre className="p-4 pt-8 rounded-lg bg-muted/50 overflow-x-auto text-sm">
                        <code>{step.code}</code>
                      </pre>
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-background/80 transition-colors"
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