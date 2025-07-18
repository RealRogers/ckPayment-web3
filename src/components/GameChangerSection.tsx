import { Card } from "@/components/ui/card";
import { Cloud, Code, Globe } from "lucide-react";

const GameChangerSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
            Más que Pagos:{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Una Nueva Nube Descentralizada
            </span>
          </h2>
          
          <Card className="bg-gradient-card border border-border/50 p-8 mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                <Cloud className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              ckPayment es la prueba de concepto de una idea más grande: alojar software complejo 
              (SDKs, librerías, etc.) 100% on-chain. Demostramos que ICP puede funcionar como una 
              nube descentralizada, abriendo la puerta a un futuro donde el software sea 
              verdaderamente soberano y resistente.
            </p>
          </Card>

          {/* Vision cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Software Soberano</h3>
              <p className="text-sm text-muted-foreground">
                SDKs y librerías completamente independientes de infraestructura tradicional
              </p>
            </Card>

            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Web3 Nativo</h3>
              <p className="text-sm text-muted-foreground">
                Una nueva generación de aplicaciones verdaderamente descentralizadas
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameChangerSection;