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
        <div className="py-8 md:py-12">
          <ProblemCards />
        </div>
        <div className="py-8 md:py-12 bg-muted/10">
          <ComparisonSection />
        </div>
        <div className="py-8 md:py-12">
          <ProblemSection />
        </div>
        <div className="py-8 md:py-12 bg-muted/30">
          <SolutionSection />
        </div>
        <SecurityTrustSection />
        <UseCasesSection />
        <PricingSection />
        <div className="py-8 md:py-12">
          <HowItWorksSection />
        </div>
        <div className="py-8 md:py-12 bg-muted/30">
          <IntegrationSteps />
        </div>
        <div className="py-8 md:py-12">
          <GameChangerSection />
        </div>
        <div className="py-12 md:py-16 bg-muted/10">
          <FAQSection />
        </div>
        <EnhancedCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;