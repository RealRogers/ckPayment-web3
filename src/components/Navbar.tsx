import { Button } from "@/components/ui/button";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ckP</span>
          </div>
          <span className="text-xl font-bold text-foreground">ckPayment</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('features')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </button>
          <button 
            onClick={() => scrollToSection('docs')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </button>
          <button 
            onClick={() => scrollToSection('community')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Community
          </button>
        </div>

        {/* CTA Button */}
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-soft hover:shadow-glow-primary transition-all duration-300">
          Get Started
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;