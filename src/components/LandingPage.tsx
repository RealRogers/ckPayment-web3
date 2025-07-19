import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ProblemSection from "./ProblemSection";
import ProblemCards from "./ProblemCards";
import SolutionSection from "./SolutionSection";
import SecurityTrustSection from "./SecurityTrustSection";
import UseCasesSection from "./UseCasesSection";
import PricingSection from "./PricingSection";
import HowItWorksSection from "./HowItWorksSection";
import GameChangerSection from "./GameChangerSection";
import Footer from "./Footer";
import IntegrationSteps from "./IntegrationSteps";
import ComparisonSection from "./ComparisonSection";
import FAQSection from "./FAQSection";
import EnhancedCTASection from "./EnhancedCTASection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="space-y-0">
        <HeroSection />
        <div className="py-12 md:py-16">
          <ProblemCards />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <ProblemSection />
        </div>
        <div className="py-12 md:py-16">
          <SolutionSection />
        </div>
        <div className="py-12 md:py-16 bg-muted/30">
          <HowItWorksSection />
        </div>
        <div className="py-12 md:py-16">
          <IntegrationSteps />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <ComparisonSection />
        </div>
        <GameChangerSection />
        <div className="py-12 md:py-16 bg-muted/30">
          <UseCasesSection />
        </div>
        <div className="py-12 md:py-16">
          <SecurityTrustSection />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <PricingSection />
        </div>
        <div className="py-12 md:py-16">
          <FAQSection />
        </div>
        <EnhancedCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;