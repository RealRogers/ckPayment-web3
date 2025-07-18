import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const codeExample = `<!-- Add ckPayment to your dApp -->\n<script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckpay.js"></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/5 bg-grid-pattern"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Pagos Descentralizados con la{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Simplicidad de Stripe
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
          Integra pagos en tu dApp de ICP con una sola línea de JavaScript, 
          servido directamente desde un canister. Cero servidores, cero intermediarios.
        </p>

        {/* Code example */}
        <Card className="max-w-3xl mx-auto mb-12 bg-code-bg border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Integración instantánea</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-8 w-8 p-0"
            >
              <Copy className={`h-4 w-4 ${copied ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>
          <pre className="text-left text-sm md:text-base text-foreground font-mono overflow-x-auto">
            <code>{codeExample}</code>
          </pre>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg shadow-glow-soft hover:shadow-glow-primary transition-all duration-300"
          >
            Explorar Documentación
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-border text-foreground hover:bg-muted px-8 py-4 text-lg"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Ver la Demo
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;