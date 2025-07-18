import { Twitter, MessageCircle, Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer id="community" className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Social Links */}
          <div className="flex justify-center space-x-8 mb-8">
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <Twitter className="h-5 w-5" />
              <span>Twitter</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Discord</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Built with love */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-muted-foreground">Construido con</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">en el Internet Computer</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2025 ckPayment. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;