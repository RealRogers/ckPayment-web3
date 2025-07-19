import { AlertTriangle, Server, Link } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProblemSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
            The Decentralized Web Deserves{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Natively Decentralized Payments
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Most Web3 payment solutions still rely on Web2 servers 
            to host their frontend components. This creates a single point of failure, 
            breaks the "end-to-end" paradigm, and limits the true potential of the decentralized web.
          </p>

          {/* Problem visualization */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Web2 Dependency</h3>
              <p className="text-sm text-muted-foreground">
                Frontend hosted on traditional centralized servers
              </p>
            </Card>

            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Single Point of Failure</h3>
              <p className="text-sm text-muted-foreground">
                If the server goes down, all payment functionality is lost
              </p>
            </Card>

            <Card className="bg-gradient-card border border-border/50 p-6 text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Link className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Broken Paradigm</h3>
              <p className="text-sm text-muted-foreground">
                Not truly decentralized "end-to-end"
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;