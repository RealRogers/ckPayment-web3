import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Zap,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  Cpu,
  Coins,
  Trophy,
  ShieldCheck,
  ArrowLeft,
  Code,
  Sparkles,
  Target,
  Smartphone,
  Monitor,
  Globe,
  Swords,
  BarChart3,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Rocket,
  Settings,
  Github
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const Gaming = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Stats data
  const stats = [
    { value: "40%", label: "More Revenue", icon: TrendingUp, color: "text-purple-500" },
    { value: "3x", label: "Faster Checkout", icon: Zap, color: "text-pink-500" },
    { value: "0%", label: "Chargeback Risk", icon: Shield, color: "text-purple-600" },
    { value: "1B+", label: "Gamers Reached", icon: Users, color: "text-pink-600" }
  ];

  // Features data
  const features = [
    {
      icon: Cpu,
      title: "In-Game Purchases",
      description: "Seamlessly integrate microtransactions for in-game items, skins, and power-ups.",
      benefits: [
        "One-click purchases",
        "Instant item delivery",
        "Support for all major cryptocurrencies",
        "Fraud prevention"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Coins,
      title: "Play-to-Earn",
      description: "Enable players to earn real value through gameplay with blockchain integration.",
      benefits: [
        "Tokenized rewards",
        "NFT item ownership",
        "Staking mechanisms",
        "Leaderboard rewards"
      ],
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: ShieldCheck,
      title: "Secure Trading",
      description: "Facilitate secure player-to-player trading of in-game assets with smart contracts.",
      benefits: [
        "Escrow protection",
        "Royalty on secondary sales",
        "Cross-game compatibility",
        "Secure wallet integration"
      ],
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: Trophy,
      title: "Tournaments & Rewards",
      description: "Host competitive tournaments with automated prize distribution.",
      benefits: [
        "Automated payouts",
        "Smart contract rewards",
        "Transparent leaderboards",
        "Custom reward structures"
      ],
      color: "from-pink-600 to-purple-600"
    }
  ];

  // Integration steps
  const integrationSteps = [
    {
      step: 1,
      title: "Install Gaming SDK",
      description: "Add our gaming SDK to your game engine or platform",
      code: `npm install @ckpayment/gaming
// or via CDN
<script src="https://ckpayment.icp0.io/gaming.js"></script>`,
      time: "2 minutes"
    },
    {
      step: 2,
      title: "Configure Your Game",
      description: "Set up your game configuration with supported tokens and items",
      code: `ckGaming.init({
  gameId: 'your-game-id',
  tokens: ['ICP', 'ckBTC', 'CHAT'],
  theme: 'dark', // Match your game's UI
  network: 'mainnet'
});`,
      time: "5 minutes"
    },
    {
      step: 3,
      title: "Add Items & Rewards",
      description: "Define your in-game items and reward structures",
      code: `// Define an in-game item
ckGaming.createItem({
  id: 'legendary_sword',
  name: 'Legendary Sword',
  price: 4.99,
  currency: 'ICP',
  type: 'weapon',
  rarity: 'legendary',
  metadata: { attack: 150, durability: 100 }
});`,
      time: "10 minutes"
    },
    {
      step: 4,
      title: "Enable Transactions",
      description: "Add purchase and reward functionality to your game",
      code: `// Handle item purchase in your game
const purchase = await ckGaming.purchaseItem(
  'player123', 
  'legendary_sword',
  { 
    discountCode: 'GAMER2024',
    deliveryMethod: 'instant' 
  }
);

// Reward players for achievements
await ckGaming.rewardPlayer('player123', {
  amount: 10,
  currency: 'GAME_TOKEN',
  reason: 'level_completion'
});`,
      time: "15 minutes"
    }
  ];

  // Use Cases
  const useCases = [
    {
      title: "Mobile Games",
      description: "Casual and competitive mobile gaming with microtransactions",
      icon: Smartphone,
      examples: ["Match-3 games", "Battle royale mobile", "Puzzle games", "Idle clickers"],
      gameTypes: ["Casual", "Competitive", "Social"]
    },
    {
      title: "PC/Console Games",
      description: "AAA and indie games with complex economies and trading",
      icon: Monitor,
      examples: ["MMORPGs", "FPS games", "Strategy games", "Racing simulators"],
      gameTypes: ["AAA", "Indie", "Simulation"]
    },
    {
      title: "Web3 Games",
      description: "Blockchain-native games with NFT integration and DeFi mechanics",
      icon: Globe,
      examples: ["Play-to-earn RPGs", "NFT collectibles", "DeFi gaming", "Metaverse worlds"],
      gameTypes: ["P2E", "NFT", "DeFi"]
    },
    {
      title: "Esports Platforms",
      description: "Competitive gaming platforms with tournaments and rewards",
      icon: Swords,
      examples: ["Tournament platforms", "Betting systems", "Skill-based games", "Leaderboards"],
      gameTypes: ["Competitive", "Tournaments", "Betting"]
    }
  ];

  // Competitive Advantages
  const competitiveAdvantages = [
    {
      traditional: "High payment processing fees (3-5%)",
      ckPayment: "Ultra-low blockchain fees (<0.1%)",
      icon: DollarSign,
      improvement: "95% cost reduction",
      metric: "Save $950 per $10k revenue"
    },
    {
      traditional: "Slow payment settlements (2-7 days)",
      ckPayment: "Instant blockchain settlements",
      icon: Zap,
      improvement: "Real-time payouts",
      metric: "From days to seconds"
    },
    {
      traditional: "Chargeback risks and fraud",
      ckPayment: "Immutable blockchain transactions",
      icon: Shield,
      improvement: "Zero chargeback risk",
      metric: "100% fraud protection"
    },
    {
      traditional: "Limited global payment methods",
      ckPayment: "Universal crypto payments",
      icon: Globe,
      improvement: "Global accessibility",
      metric: "Reach 1B+ crypto users"
    },
    {
      traditional: "Complex integration processes",
      ckPayment: "Simple SDK integration",
      icon: Code,
      improvement: "10x faster setup",
      metric: "35 minutes vs 6 weeks"
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How does ckPayment handle in-game transactions?",
      answer: "ckPayment uses blockchain technology to process transactions instantly and securely, with minimal fees. Players can purchase items using various cryptocurrencies, and the items are delivered to their in-game inventory in real-time."
    },
    {
      question: "Can I integrate ckPayment with my existing game?",
      answer: "Yes! ckPayment is designed to work with any game engine or platform. Our SDK provides simple APIs for Unity, Unreal Engine, and custom game engines. Integration typically takes less than 35 minutes."
    },
    {
      question: "What blockchain does ckPayment use?",
      answer: "ckPayment is built on the Internet Computer Protocol (ICP), which offers fast, low-cost transactions perfect for gaming applications. We also support cross-chain functionality with Bitcoin and Ethereum."
    },
    {
      question: "How do players get started with ckPayment?",
      answer: "Players simply connect their wallet (like Plug or Stoic) to your game, and they're ready to make purchases or earn rewards. No complicated setup required - it's as easy as connecting to any web3 application."
    },
    {
      question: "What about transaction fees for gaming?",
      answer: "We've optimized our solution specifically for gaming with ultra-low fees (<0.1%). For most in-game transactions, the cost is negligible, and we offer batch processing to further reduce costs for high-volume games."
    },
    {
      question: "Do you support play-to-earn mechanics?",
      answer: "Absolutely! Our platform is built for modern gaming economics including play-to-earn, NFT ownership, staking mechanisms, and automated tournament rewards. Players can earn real value through gameplay."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content Overlay with purple/pink tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background/20 to-pink-500/5 pointer-events-none" style={{ zIndex: 5 }} />

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
      <section className="relative py-20 bg-gradient-to-br from-purple-900/80 to-pink-900/80 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border border-purple-400/30 hover:bg-purple-500/30 transition-colors">
              <Gamepad2 className="h-4 w-4 mr-2" />
              GAMING SOLUTIONS
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              Powering the Next Generation of <span className="text-pink-400">Blockchain Games</span>
            </h1>
            <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Seamlessly integrate blockchain payments, NFTs, and play-to-earn mechanics into your games with our developer-friendly SDK.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Get Started for Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-purple-900/50 to-background relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything You Need to Build the <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Future of Gaming</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive toolkit helps you integrate blockchain technology into your games with minimal effort.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="overflow-hidden border border-border/30 hover:shadow-lg transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}/10`}>
                        <Icon className={`h-6 w-6 ${feature.color.replace('from-', 'text-').split(' ')[0]}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground mb-4">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Steps */}
      <section className="py-20 bg-gradient-to-r from-purple-500/5 via-background/90 to-pink-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Setup
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Launch Your Gaming Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your game integrated with blockchain payments in under 35 minutes with our gaming SDK
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {step.time}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  <div className="bg-muted/10 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(step.code, `step-${index}`)}
                      className="absolute top-2 right-2 p-2 rounded-md hover:bg-muted/20 transition-colors"
                    >
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-purple-500' : 'text-muted-foreground'}`} />
                    </button>
                    <pre className="text-sm font-mono text-foreground overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-500/10 text-pink-600 border-pink-500/20">
              <Target className="h-3 w-3 mr-1" />
              Gaming Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Gaming Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From mobile games to esports platforms, support all types of gaming experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-pink-500/20 hover:border-pink-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-pink-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-pink-600 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-purple-600 mb-1">Game Types:</div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {useCase.gameTypes.map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx}>• {example}</li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gradient-to-r from-pink-500/5 via-background/90 to-purple-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Why Choose ckPayment for Gaming?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern Gaming</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment revolutionizes gaming payments compared to traditional solutions
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional Gaming</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 mb-1">
                        {advantage.improvement}
                      </Badge>
                      {advantage.metric && (
                        <div className="text-xs text-muted-foreground">{advantage.metric}</div>
                      )}
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-purple-600">ckPayment Gaming</span>
                        <IconComponent className="h-6 w-6 text-purple-500" />
                      </div>
                      <p className="text-sm font-medium text-purple-600">{advantage.ckPayment}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-600 border-purple-500/20">
              <HelpCircle className="h-3 w-3 mr-1" />
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Got Questions? We've Got Answers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about integrating ckPayment into your gaming platform
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-border/30 pt-4">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-purple-600/10 border-purple-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-purple-500/10 text-purple-600 border-purple-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Level Up Your Game?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Launch Your Gaming Platform Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of game developers who are using ckPayment to create the next generation 
                of blockchain games with seamless payments and play-to-earn mechanics.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button size="lg" className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Gamepad2 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Building
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-purple-500/30 text-purple-600 hover:bg-purple-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-purple-600 hover:bg-purple-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span>Instant Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-pink-500 flex-shrink-0" />
                  <span>Zero Chargebacks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-3 sm:h-4 w-3 sm:w-4 text-purple-600 flex-shrink-0" />
                  <span>Global Reach</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-3 sm:h-4 w-3 sm:w-4 text-pink-600 flex-shrink-0" />
                  <span>Play-to-Earn Ready</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Gaming;
