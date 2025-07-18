import { Blocks, Rocket, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const SolutionSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              ckPayment: Tu Gateway{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                100% On-Chain
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-gradient-card border border-border/50 p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors duration-300">
                <Blocks className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">100% On-Chain</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tanto el backend como el frontend (nuestro SDK de JS) se alojan y se sirven 
                directamente desde canisters de ICP. Verdadera descentralización.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-gradient-card border border-border/50 p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors duration-300">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Integración Instantánea</h3>
              <p className="text-muted-foreground leading-relaxed">
                Inspirado en Stripe, solo necesitas añadir una etiqueta &lt;script&gt; para empezar. 
                Sin configuraciones complejas.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-gradient-card border border-border/50 p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors duration-300">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Seguridad de ICP</h3>
              <p className="text-muted-foreground leading-relaxed">
                Hereda toda la seguridad, velocidad y resistencia a la censura 
                de la red del Internet Computer Protocol.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;