import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  Globe, 
  Smartphone, 
  Zap,
  BookOpen,
  Users,
  ArrowRight,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IntegrationHub = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<string>('html');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Code copied!",
      description: "Ready to paste into your project",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const integrationPaths = [
    {
      id: 'html',
      title: 'HTML/Vanilla JS',
      description: 'Simple Integration - Add Web3 payments with just a few lines of JavaScript',
      difficulty: 'Beginner',
      time: '30 seconds',
      icon: Globe,
      badge: 'Fastest',
      steps: [
        {
          number: 1,
          title: 'Add the script tag',
          description: 'Include the SDK in your HTML',
          code: '<script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckPay.js"></script>'
        },
        {
          number: 2,
          title: 'Create payment container',
          description: 'Add a div for the payment modal',
          code: '<div id="payment-modal"></div>'
        },
        {
          number: 3,
          title: 'Initialize the SDK',
          description: 'Configure and start the payment flow',
          code: 'ckPaySDK.PaymentComponent.initialize(\'payment-modal\');'
        },
        {
          number: 4,
          title: 'Trigger payment (optional)',
          description: 'Programmatically start payment flow',
          code: `const startPaymentFlow = () => {
  ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
    console.log('Payment complete');
    // Hide the modal when payment is done
    ckPaySDK.PaymentComponent.removePaymentModal();
  });
};`
        }
      ],
      features: ['No build process', 'Works anywhere', 'Instant setup']
    },
    {
      id: 'react',
      title: 'React/Next.js',
      description: 'Simple Integration in 3 Steps',
      difficulty: 'Intermediate',
      time: '2 minutes',
      icon: Code,
      badge: 'Popular',
      steps: [
        {
          number: 1,
          title: 'Add SDK Script',
          description: 'Include the ckPay SDK in your HTML file.',
          code: '<script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckPay.js"></script>'
        },
        {
          number: 2,
          title: 'Create Payment Container',
          description: 'Add a div element where the payment modal will appear.',
          code: '<div id="payment-modal"></div>'
        },
        {
          number: 3,
          title: 'Initialize Payment',
          description: 'Configure the payment component with your settings.',
          code: 'ckPaySDK.PaymentComponent.initialize();'
        }
      ],
      features: ['TypeScript support', 'React hooks', 'SSR compatible']
    },
    {
      id: 'advanced',
      title: 'Advanced Integration',
      description: 'Full control with complete SDK implementation',
      difficulty: 'Advanced',
      time: '5 minutes',
      icon: Zap,
      badge: 'Flexible',
      steps: [
        {
          number: 1,
          title: 'Install the package',
          description: 'Add ckPayment to your project',
          code: 'npm install @ckpayment/web3'
        },
        {
          number: 2,
          title: 'Import the component',
          description: 'Add the component to your app',
          code: 'import { CkPaymentButton } from \'@ckpayment/web3\';'
        },
        {
          number: 3,
          title: 'Add the button',
          description: 'Place the button in your app',
          code: `import { CkPaymentButton } from '@ckpayment/web3';

function PaymentButton() {
  return (
    <CkPaymentButton 
      amount={1.5}
      currency="ICP"
      onSuccess={(txId) => console.log('Payment successful:', txId)}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}`
        }
      ],
      features: ['Full SDK access', 'Custom UI', 'Advanced features']
    }
  ];

  const liveExamples = [
    {
      title: 'E-commerce Checkout',
      description: 'Complete checkout flow with cart',
      preview: 'https://demo.ckpayment.xyz/ecommerce'
    },
    {
      title: 'Subscription Payment',
      description: 'Recurring payment setup',
      preview: 'https://demo.ckpayment.xyz/subscription'
    },
    {
      title: 'Donation Button',
      description: 'Simple one-click donations',
      preview: 'https://demo.ckpayment.xyz/donation'
    }
  ];

  const nextSteps = [
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Complete API reference and guides',
      link: 'https://docs.ckpayment.xyz',
      cta: 'Read Docs'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join our Discord for support',
      link: 'https://discord.gg/ckpayment',
      cta: 'Join Discord'
    },
    {
      icon: Play,
      title: 'Playground',
      description: 'Test payments in sandbox',
      link: 'https://playground.ckpayment.xyz',
      cta: 'Try Now'
    }
  ];

  return (
    <section id="integration" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Code className="h-4 w-4" />
              Integration Hub
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Integration Path
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
              From simple script tags to advanced SDK integration. 
              Pick the approach that fits your project and skill level.
            </p>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
              onClick={() => window.open('https://docs.ckpayment.xyz', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Documentation
            </Button>
          </div>

          {/* Integration Paths */}
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="mb-16">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto">
              {integrationPaths.map((path) => {
                const IconComponent = path.icon;
                return (
                  <TabsTrigger 
                    key={path.id} 
                    value={path.id}
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-4 h-auto"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-medium">{path.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {integrationPaths.map((path) => {
              const IconComponent = path.icon;
              return (
                <TabsContent key={path.id} value={path.id}>
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-foreground">
                              {path.title}
                            </h3>
                            <Badge variant="secondary">{path.badge}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {path.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-primary" />
                              {path.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {path.description}
                      </p>
                    </div>

                    {/* Steps Timeline */}
                    <div className="max-w-4xl mx-auto">
                      <div className="space-y-6">
                        {path.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="relative">
                            {/* Timeline line */}
                            {stepIndex < path.steps.length - 1 && (
                              <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                            )}
                            
                            <div className="flex gap-6">
                              {/* Step number */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                  {step.number}
                                </div>
                              </div>
                              
                              {/* Step content */}
                              <div className="flex-1 min-w-0">
                                <div className="grid lg:grid-cols-2 gap-6 items-start">
                                  {/* Step info */}
                                  <div>
                                    <h4 className="text-lg font-semibold text-foreground mb-2">
                                      {step.title}
                                    </h4>
                                    <p className="text-muted-foreground mb-4">
                                      {step.description}
                                    </p>
                                  </div>
                                  
                                  {/* Code block */}
                                  <div className="relative">
                                    <Card className="bg-muted/50 border border-border/30">
                                      <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="text-xs text-muted-foreground font-mono">
                                            {step.number === 1 ? 'HTML' : step.number === 2 ? 'HTML' : 'JavaScript'}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(step.code, `${path.id}-${stepIndex}`)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <pre className="text-sm overflow-x-auto">
                                          <code className="text-foreground whitespace-pre-wrap">
                                            {step.code}
                                          </code>
                                        </pre>
                                        {copiedCode === `${path.id}-${stepIndex}` && (
                                          <div className="absolute -top-8 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                            Copied!
                                          </div>
                                        )}
                                      </div>
                                    </Card>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-6 bg-muted/20 rounded-lg p-4">
                        {path.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Live Examples */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Live Code Examples
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See ckPayment in action with real-world implementations you can fork and customize.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {liveExamples.map((example, index) => (
                <Card key={index} className="bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 group">
                  <div className="p-6">
                    <div className="aspect-video bg-muted/30 rounded-lg mb-4 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                      <Play className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {example.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {example.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:border-primary/50"
                      onClick={() => window.open(example.preview, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Demo
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-muted/20 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready for More?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore advanced features, get community support, and take your integration to the next level.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={index} className="bg-background/80 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 group">
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="group-hover:border-primary/50"
                        onClick={() => window.open(step.link, '_blank')}
                      >
                        {step.cta}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationHub;