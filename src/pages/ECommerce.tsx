import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ShoppingCart,
  CreditCard,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  ExternalLink,
  Download,
  BookOpen,
  Github,
  Smartphone,
  Monitor,
  Wallet,
  Lock,
  BarChart3,
  Package,
  Truck,
  Star,
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Rocket,
  Code,
  Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import React from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";
import "../styles/slider.css";

const ECommerce = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const smoothyInstanceRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Smooothy Slider Initialization
  useEffect(() => {
    // Función para inicializar Smooothy
    const initializeSlider = () => {
      const sliderElement = document.getElementById('product-slider');
      const shoppingBagImage = document.getElementById('shopping-bag-3d');
      
      if (!sliderElement || !shoppingBagImage) return;

      // Configuración de Smooothy según especificaciones
      const smoothyConfig = {
        // Bucle infinito activado
        infinite: true,
        
        // Snapping a slides activado
        snap: true,
        
        // Sensibilidad al drag muy baja para control preciso
        dragSensitivity: 0.005,
        
        // Factor de suavidad para animaciones fluidas
        lerpFactor: 0.3,
        
        // Decaimiento de velocidad para desaceleración natural
        speedDecay: 0.85,
        
        // Callbacks para efectos personalizados
        onSlideChange: (slideIndex: number) => {
          console.log(`📍 Cambio a slide: ${slideIndex}`);
          setCurrentSlide(slideIndex);
          updateSliderIndicators(slideIndex);
        },
        
        onUpdate: (progress: number, velocity: number) => {
          // Efecto parallax en la imagen 3D
          handleParallaxUpdate(progress, velocity, shoppingBagImage);
        },
        
        onResize: () => {
          console.log('📐 Redimensionando slider...');
        }
      };

      try {
        // Inicializar Smooothy (asumiendo que está disponible globalmente)
        if (typeof window !== 'undefined' && (window as any).Smooothy) {
          smoothyInstanceRef.current = new (window as any).Smooothy(sliderElement, smoothyConfig);
          console.log('🚀 Smooothy inicializado correctamente');
        } else {
          console.warn('⚠️ Smooothy no está disponible, usando navegación manual');
          setupManualNavigation();
        }
      } catch (error) {
        console.error('❌ Error al inicializar Smooothy:', error);
        setupManualNavigation();
      }
    };

    // Función para manejar efectos parallax - ¡INTERACCIÓN DRAMÁTICA!
    const handleParallaxUpdate = (progress: number, velocity: number, imageElement: HTMLElement) => {
      if (currentSlide === 0 && imageElement) {
        const time = Date.now() * 0.001;
        
        // 🚀 Parallax más dramático con interacción
        const parallaxOffset = progress * 30; // Doble de intensidad
        const rotationY = velocity * 8; // Rotación más pronunciada
        const scale = 1.1 + Math.abs(velocity) * 0.08; // Zoom más dramático
        
        // 🌪️ Rotación adicional basada en velocidad
        const velocityRotation = velocity * 15;
        
        // 🎭 Combinar animación automática con interacción del usuario
        const floatY = Math.sin(time * 0.8) * 10; // Reducido durante interacción
        const floatX = Math.cos(time * 0.6) * 5;  // Reducido durante interacción
        const autoRotation = (time * 20) % 360;   // Rotación más lenta durante interacción
        
        // ✨ Aplicar transformaciones combinadas (automáticas + interactivas)
        imageElement.style.transform = `
          perspective(1000px) 
          translateX(${parallaxOffset + floatX}px) 
          translateY(${floatY}px)
          rotateZ(${autoRotation + velocityRotation}deg)
          rotateY(${-5 + rotationY + Math.sin(time * 0.7) * 10}deg)
          scale(${scale})
        `;
        
        // 🎨 Sombra que reacciona a la interacción
        const shadowIntensity = 0.4 + Math.abs(velocity) * 0.3;
        const shadowBlur = 40 + Math.abs(velocity) * 20;
        imageElement.style.filter = `
          drop-shadow(${parallaxOffset * 0.3}px ${25 + Math.abs(velocity) * 10}px ${shadowBlur}px rgba(59, 130, 246, ${shadowIntensity}))
          brightness(${1 + Math.abs(velocity) * 0.2})
        `;
      }
    };

    // Función para actualizar indicadores
    const updateSliderIndicators = (slideIndex: number) => {
      for (let i = 0; i < 3; i++) {
        const indicator = document.getElementById(`slider-indicator-${i}`);
        if (indicator) {
          if (i === slideIndex) {
            indicator.className = 'slider-indicator w-3 h-3 rounded-full bg-blue-500 transition-all duration-300';
          } else {
            indicator.className = 'slider-indicator w-3 h-3 rounded-full bg-blue-500/30 hover:bg-blue-500/60 transition-all duration-300';
          }
        }
      }
    };

    // Navegación manual como fallback
    const setupManualNavigation = () => {
      const slides = document.querySelectorAll('.slide');
      const totalSlides = slides.length;
      
      const goToSlide = (index: number) => {
        const slider = document.getElementById('product-slider');
        if (slider) {
          const translateX = -index * (100 / totalSlides);
          slider.style.transform = `translateX(${translateX}%)`;
          setCurrentSlide(index);
          updateSliderIndicators(index);
        }
      };

      // Event listeners para navegación
      const prevBtn = document.getElementById('slider-prev');
      const nextBtn = document.getElementById('slider-next');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          goToSlide(newSlide);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const newSlide = (currentSlide + 1) % totalSlides;
          goToSlide(newSlide);
        });
      }

      // Indicadores
      for (let i = 0; i < totalSlides; i++) {
        const indicator = document.getElementById(`slider-indicator-${i}`);
        if (indicator) {
          indicator.addEventListener('click', () => goToSlide(i));
        }
      }
      
      // 🎪 EFECTO ESPECIAL: Click en la imagen para "despertar"
      const shoppingBagImage = document.getElementById('shopping-bag-3d');
      if (shoppingBagImage) {
        shoppingBagImage.addEventListener('click', () => {
          // Efecto de "despertar" - animación especial
          shoppingBagImage.style.animation = 'none';
          shoppingBagImage.offsetHeight; // Trigger reflow
          shoppingBagImage.style.animation = 'imageWakeUp 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
          
          // Agregar clase temporal para efectos adicionales
          shoppingBagImage.classList.add('awakened');
          
          // 🎆 Crear partículas mágicas
          createMagicParticles();
          
          setTimeout(() => {
            shoppingBagImage.classList.remove('awakened');
          }, 1500);
        });
        
        // Efecto de hover mejorado
        shoppingBagImage.addEventListener('mouseenter', () => {
          shoppingBagImage.classList.add('hovered');
        });
        
        shoppingBagImage.addEventListener('mouseleave', () => {
          shoppingBagImage.classList.remove('hovered');
        });
      }
      
      // 🎆 Función para crear partículas mágicas
      const createMagicParticles = () => {
        const container = document.getElementById('particles-container');
        if (!container) return;
        
        // Limpiar partículas anteriores
        container.innerHTML = '';
        
        // Crear 15 partículas
        for (let i = 0; i < 15; i++) {
          const particle = document.createElement('div');
          particle.className = 'magic-particle';
          
          // Posición aleatoria
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          
          // Colores aleatorios
          const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          particle.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            animation: particleFloat 2s ease-out forwards;
            box-shadow: 0 0 10px ${color};
          `;
          
          container.appendChild(particle);
          
          // Remover partícula después de la animación
          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }, 2000);
        }
      };
    };

    // Bucle de animación con requestAnimationFrame - ¡IMAGEN CON VIDA!
    const startAnimationLoop = () => {
      const animate = () => {
        const shoppingBagImage = document.getElementById('shopping-bag-3d');
        
        // 🎭 ANIMACIONES DINÁMICAS - La imagen cobra vida
        if (shoppingBagImage && currentSlide === 0) {
          const time = Date.now() * 0.001;
          
          // Debug: Confirmar que la animación está corriendo (solo cada 2 segundos)
          if (Math.floor(time) % 2 === 0 && Math.floor(time * 10) % 10 === 0) {
            console.log(`🔄 Imagen animándose - Rotación: ${Math.floor((time * 60) % 360)}°`);
          }
          
          // 🌊 Movimiento flotante MÁS PRONUNCIADO (como si flotara en el aire)
          const floatY = Math.sin(time * 0.8) * 20; // Movimiento vertical más amplio
          const floatX = Math.cos(time * 0.6) * 12; // Movimiento horizontal más visible
          
          // 🔄 Rotación completa continua (vuelta completa cada 6 segundos - MÁS RÁPIDA)
          const fullRotation = (time * 60) % 360; // 60 grados por segundo = 6 segundos por vuelta
          
          // 🔍 Zoom dinámico MÁS DRAMÁTICO (se hace más grande y más pequeño)
          const zoomPulse = 1 + Math.sin(time * 0.5) * 0.2; // Oscila entre 0.8x y 1.2x
          
          // ✨ Rotación en Y para efecto 3D (bamboleo MÁS PRONUNCIADO)
          const rotateY = Math.sin(time * 0.7) * 25; // Bamboleo de -25° a +25°
          
          // 🎨 Efecto de sombra dinámica que sigue el movimiento
          const shadowX = floatX * 0.5;
          const shadowY = 25 + floatY * 0.3;
          const shadowBlur = 40 + Math.sin(time * 0.5) * 15;
          const shadowOpacity = 0.3 + Math.sin(time * 0.3) * 0.1;
          
          // 🌈 Aplicar todas las transformaciones juntas
          shoppingBagImage.style.transform = `
            perspective(1000px)
            translateX(${floatX}px)
            translateY(${floatY}px)
            rotateZ(${fullRotation}deg)
            rotateY(${rotateY}deg)
            scale(${zoomPulse})
          `;
          
          // 🎭 Sombra dinámica que sigue el movimiento
          shoppingBagImage.style.filter = `
            drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(59, 130, 246, ${shadowOpacity}))
          `;
          
          // 🎪 Efecto adicional: cambio sutil de brillo
          const brightness = 1 + Math.sin(time * 0.9) * 0.1;
          shoppingBagImage.style.filter += ` brightness(${brightness})`;
        }
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Inicializar después de un pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      initializeSlider();
      startAnimationLoop();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (smoothyInstanceRef.current && typeof smoothyInstanceRef.current.destroy === 'function') {
        smoothyInstanceRef.current.destroy();
        console.log('🧹 Smooothy destruido correctamente');
      }
    };
  }, [currentSlide]); // Dependencia en currentSlide para re-renderizar efectos

  // Cargar Smooothy desde CDN si no está disponible
  useEffect(() => {
    const loadSmooothy = () => {
      if (typeof window !== 'undefined' && !(window as any).Smooothy) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/smooothy@latest/dist/smooothy.min.js';
        script.async = true;
        script.onload = () => {
          console.log('📦 Smooothy cargado desde CDN');
        };
        script.onerror = () => {
          console.warn('⚠️ No se pudo cargar Smooothy desde CDN');
        };
        document.head.appendChild(script);
      }
    };

    loadSmooothy();
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

  const stats = [
    { value: "15%", label: "Higher Conversion", icon: TrendingUp, color: "text-blue-500" },
    { value: "3x", label: "Faster Checkout", icon: Zap, color: "text-cyan-500" },
    { value: "0%", label: "Chargeback Risk", icon: Shield, color: "text-blue-600" },
    { value: "200+", label: "Countries", icon: Globe, color: "text-cyan-600" }
  ];

  const ecommerceFeatures = [
    {
      icon: ShoppingCart,
      title: "Instant Global Payments",
      description: "Accept payments from customers worldwide without traditional banking barriers",
      benefits: [
        "No geographic restrictions",
        "Instant settlement in any currency",
        "24/7 payment processing",
        "Multi-currency support"
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Zero Chargeback Risk",
      description: "Eliminate fraudulent chargebacks and payment disputes permanently",
      benefits: [
        "Immutable blockchain transactions",
        "No payment reversals",
        "Fraud-proof payments",
        "Secure smart contracts"
      ],
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: DollarSign,
      title: "Lower Transaction Fees",
      description: "Reduce payment processing costs by up to 90% compared to traditional methods",
      benefits: [
        "No intermediary fees",
        "Transparent pricing",
        "Volume discounts available",
        "No hidden charges"
      ],
      color: "from-blue-600 to-cyan-400",
      bgColor: "bg-blue-600/10"
    },
    {
      icon: Zap,
      title: "Lightning Fast Checkout",
      description: "Reduce cart abandonment with sub-second payment processing",
      benefits: [
        "One-click payments",
        "Instant confirmation",
        "Mobile optimized",
        "Seamless UX"
      ],
      color: "from-cyan-400 to-blue-500",
      bgColor: "bg-cyan-400/10"
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Install ckPayment",
      description: "Add our lightweight SDK to your e-commerce platform",
      code: `npm install @ckpayment/ecommerce
// or via CDN
<script src="https://ckpayment.icp0.io/ecommerce.js"></script>`,
      time: "2 minutes"
    },
    {
      step: 2,
      title: "Configure Your Store",
      description: "Set up your store configuration with supported currencies",
      code: `ckPayment.init({
  storeId: 'your-store-id',
  currencies: ['ckBTC', 'ckETH', 'ICP'],
  theme: 'blue' // Match your brand
});`,
      time: "5 minutes"
    },
    {
      step: 3,
      title: "Add Payment Buttons",
      description: "Replace existing payment buttons with ckPayment",
      code: `// Replace your checkout button
ckPayment.createCheckout({
  amount: 99.99,
  currency: 'ckBTC',
  productId: 'premium-plan',
  onSuccess: handlePaymentSuccess
});`,
      time: "10 minutes"
    }
  ];

  const useCases = [
    {
      title: "Digital Products",
      description: "Software, courses, subscriptions, and digital downloads",
      icon: Download,
      examples: ["SaaS subscriptions", "Online courses", "Digital art", "Software licenses"]
    },
    {
      title: "Physical Goods",
      description: "Traditional e-commerce with global reach",
      icon: Package,
      examples: ["Electronics", "Fashion", "Home goods", "Collectibles"]
    },
    {
      title: "Services",
      description: "Professional services and consultations",
      icon: Users,
      examples: ["Consulting", "Design services", "Legal advice", "Coaching"]
    },
    {
      title: "Marketplaces",
      description: "Multi-vendor platforms and peer-to-peer trading",
      icon: Target,
      examples: ["NFT marketplaces", "Freelance platforms", "Rental services", "Auction sites"]
    }
  ];  
const competitiveAdvantages = [
    {
      traditional: "3-5% transaction fees",
      ckPayment: "0.1% transaction fees",
      icon: DollarSign,
      improvement: "95% cost reduction"
    },
    {
      traditional: "2-3 day settlement",
      ckPayment: "Instant settlement",
      icon: Clock,
      improvement: "Immediate liquidity"
    },
    {
      traditional: "Chargeback risk",
      ckPayment: "Zero chargebacks",
      icon: Shield,
      improvement: "100% fraud protection"
    },
    {
      traditional: "Limited global reach",
      ckPayment: "200+ countries",
      icon: Globe,
      improvement: "Unlimited expansion"
    }
  ];

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading E-Commerce Solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay with blue tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background/20 to-cyan-500/5 pointer-events-none" style={{ zIndex: 5 }} />
      
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
      </header>      {/*
 Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background/90 via-blue-500/5 to-cyan-500/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-6 border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-sm">
              <ShoppingCart className="h-3 w-3 mr-1" />
              E-Commerce Solutions
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Online Store
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Accept payments from anywhere in the world with zero chargebacks, 
              instant settlement, and fees up to 95% lower than traditional processors.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                    <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                onClick={() => navigate('/get-started')}
              >
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                View Integration Guide
              </Button>
            </div>
          </div>
        </div>
      </section> 

      {/* 3D Product Showcase Slider */}
      <section className="py-20 relative z-10 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Product Showcase
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience the Future of E-Commerce</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment transforms your shopping experience with 3D visualization and seamless payments
            </p>
          </div>

          {/* Smooothy Slider Container */}
          <div className="relative max-w-6xl mx-auto">
            <div 
              id="product-slider" 
              className="slider-wrapper overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-600/5 backdrop-blur-sm border border-blue-500/20"
              style={{ height: '500px' }}
            >
              {/* Slide 1: 3D Shopping Bag */}
              <div className="slide flex items-center justify-center p-8" data-slide="0">
                <div className="slide-content text-center max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                        Smart Shopping Experience
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Our 3D shopping cart represents the future of e-commerce - 
                        intuitive, secure, and powered by blockchain technology.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Smart Cart
                        </Badge>
                        <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Crypto Payments
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-600/10 text-blue-700">
                          <Globe className="h-3 w-3 mr-1" />
                          Global Access
                        </Badge>
                      </div>
                      
                      {/* 🎪 Botón para activar modo súper animado */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 group"
                        onClick={() => {
                          const img = document.getElementById('shopping-bag-3d');
                          if (img) {
                            if (img.classList.contains('super-alive')) {
                              img.classList.remove('super-alive');
                              img.style.animation = '';
                            } else {
                              img.classList.add('super-alive');
                            }
                          }
                        }}
                      >
                        <Sparkles className="h-3 w-3 mr-1 group-hover:animate-spin" />
                        ¡Dale vida!
                      </Button>
                    </div>
                    <div className="order-1 md:order-2 relative">
                      {/* 🎆 Contenedor de partículas mágicas */}
                      <div id="particles-container" className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                        {/* Las partículas se generarán dinámicamente con JavaScript */}
                      </div>
                      
                      <img 
                        id="shopping-bag-3d"
                        src="/IMG/CasodeUso1.jpg" 
                        alt="3D Shopping Bag with Euro Symbol" 
                        className="main-image w-full h-auto max-h-80 object-contain mx-auto rounded-xl shadow-2xl relative z-10 animate-on-load"
                        style={{ 
                          filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.3))',
                          transform: 'perspective(1000px) rotateY(-5deg)',
                          transition: 'none' // Removemos la transición para que la animación JS sea más fluida
                        }}
                      />
                      
                      {/* 🌟 Indicador de animación activa */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-xs text-blue-500/70 animate-pulse mb-1">
                          🔄 Rotación automática activa
                        </div>
                        <div className="text-xs text-cyan-500/60">
                          ¡Haz click para efectos especiales! ✨
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Features Overview */}
              <div className="slide flex items-center justify-center p-8" data-slide="1">
                <div className="slide-content text-center max-w-4xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                    Revolutionary Payment Features
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="feature-card p-6 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                      <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Zero Chargebacks</h4>
                      <p className="text-sm text-muted-foreground">Blockchain-secured transactions eliminate fraud risk</p>
                    </div>
                    <div className="feature-card p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                      <Zap className="h-8 w-8 text-cyan-500 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Instant Settlement</h4>
                      <p className="text-sm text-muted-foreground">Receive payments immediately, no waiting periods</p>
                    </div>
                    <div className="feature-card p-6 rounded-xl bg-blue-600/5 border border-blue-600/20 hover:border-blue-600/40 transition-all duration-300">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Lower Fees</h4>
                      <p className="text-sm text-muted-foreground">Up to 95% reduction in transaction costs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3: Integration Preview */}
              <div className="slide flex items-center justify-center p-8" data-slide="2">
                <div className="slide-content text-center max-w-4xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                    Easy Integration
                  </h3>
                  <div className="bg-muted/10 rounded-xl p-6 border border-blue-500/20">
                    <pre className="text-left text-sm font-mono text-foreground overflow-x-auto">
                      <code>{`// Add ckPayment to your store in 3 lines
import { ckPayment } from '@ckpayment/ecommerce';

ckPayment.init({
  storeId: 'your-store-id',
  currencies: ['ckBTC', 'ckETH', 'ICP'],
  theme: 'modern'
});

// Create checkout button
ckPayment.createCheckout({
  amount: 99.99,
  currency: 'ckBTC',
  onSuccess: handlePayment
});`}</code>
                    </pre>
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <Code className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </Button>
                </div>
              </div>
            </div>

            {/* Slider Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              <button 
                id="slider-indicator-0" 
                className="slider-indicator w-3 h-3 rounded-full bg-blue-500 transition-all duration-300"
                data-slide="0"
              ></button>
              <button 
                id="slider-indicator-1" 
                className="slider-indicator w-3 h-3 rounded-full bg-blue-500/30 hover:bg-blue-500/60 transition-all duration-300"
                data-slide="1"
              ></button>
              <button 
                id="slider-indicator-2" 
                className="slider-indicator w-3 h-3 rounded-full bg-blue-500/30 hover:bg-blue-500/60 transition-all duration-300"
                data-slide="2"
              ></button>
            </div>

            {/* Navigation Arrows */}
            <button 
              id="slider-prev" 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </button>
            <button 
              id="slider-next" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
            >
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </button>
          </div>
        </div>
      </section>

     {/* E-Commerce Features */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern E-Commerce</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to accept Web3 payments and grow your online business
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {ecommerceFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Integration Steps */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 via-background/90 to-cyan-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-600">
              <Code className="h-3 w-3 mr-1" />
              Quick Integration
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate ckPayment into your e-commerce platform in less than 20 minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {integrationSteps.map((step, index) => (
              <Card key={index} className="p-8 bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
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
                      <ArrowRight className={`h-4 w-4 ${copiedCode === `step-${index}` ? 'text-blue-500' : 'text-muted-foreground'}`} />
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
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
              <Target className="h-3 w-3 mr-1" />
              Use Cases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Every Business Model</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From digital products to physical goods, ckPayment scales with your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/80 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/40 hover:bg-card/90 transition-all duration-300 group">
                  <div className="p-3 rounded-xl bg-cyan-500/10 inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-600 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
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
      <section className="py-20 bg-gradient-to-r from-cyan-500/5 via-background/90 to-blue-500/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              Competitive Advantage
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ckPayment?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how ckPayment compares to traditional payment processors
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-muted-foreground">Traditional</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advantage.traditional}</p>
                    </div>
                    
                    <div className="text-center">
                      <ArrowRight className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {advantage.improvement}
                      </Badge>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <span className="font-medium text-blue-600">ckPayment</span>
                        <IconComponent className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-blue-600">{advantage.ckPayment}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>    
  {/* CTA Section */}
      <section className="py-20 relative overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-8 sm:p-12 md:p-16 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-600/10 border-blue-500/20 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500" />
            </div>
            
            <div className="relative z-10">
              <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Transform Your Store?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Start Accepting Web3 Payments Today
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of e-commerce businesses already using ckPayment to increase 
                conversions, reduce costs, and expand globally.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg font-medium group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  onClick={() => navigate('/get-started')}
                >
                  <ShoppingCart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium group border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                  <Settings className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
                <Button variant="ghost" size="lg" className="px-8 py-6 text-lg font-medium group text-blue-600 hover:bg-blue-500/10">
                  <Github className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Zero Chargebacks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-cyan-500 flex-shrink-0" />
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 flex-shrink-0" />
                  <span>Global Reach</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-3 sm:h-4 w-3 sm:w-4 text-cyan-600 flex-shrink-0" />
                  <span>95% Lower Fees</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ECommerce;