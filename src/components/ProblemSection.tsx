import { AlertTriangle, Server, Link } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProblemSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
            La Web Descentralizada Merece{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Pagos Nativamente Descentralizados
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            La mayoría de las soluciones de pago en Web3 aún dependen de servidores Web2 
            para alojar sus componentes de frontend. Esto crea un punto central de fallo, 
            rompe el paradigma "end-to-end" y limita el verdadero potencial de la web descentralizada.
          </p>

          {/* Problem visualization */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Dependencia Web2</h3>
              <p className="text-sm text-muted-foreground">
                Frontend alojado en servidores centralizados tradicionales
              </p>
            </Card>

            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Punto de Fallo</h3>
              <p className="text-sm text-muted-foreground">
                Si el servidor cae, toda la funcionalidad de pagos se pierde
              </p>
            </Card>

            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Link className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Paradigma Roto</h3>
              <p className="text-sm text-muted-foreground">
                No es verdaderamente "end-to-end" descentralizado
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;