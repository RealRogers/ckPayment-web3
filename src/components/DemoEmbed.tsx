import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle, CreditCard, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// For production implementation, install ICP agent:
// npm install @dfinity/agent @dfinity/principal @dfinity/candid

interface DemoEmbedProps {
  type?: 'default' | 'crypto-link';
}

const DemoEmbed = ({ type = 'default' }: DemoEmbedProps) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { toast } = useToast();

  // Simulate canister call for subscription approval
  const handleApproveSubscription = async () => {
    setIsApproving(true);
    
    try {
      // In production, this would be a real canister call:
      // const actor = createActor(canisterId, { agentOptions: { host } });
      // await actor.approveSubscription({ amount: 10n, currency: "ICP" });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsApproved(true);
      setIsApproving(false);
      
      toast({
        title: "Subscription Approved!",
        description: "1-click payments are now enabled for this dApp",
      });
    } catch (error) {
      console.error('Subscription approval failed:', error);
      setIsApproving(false);
      toast({
        title: "Approval Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Reset state when type changes
  useEffect(() => {
    setIsApproved(false);
    setIsApproving(false);
  }, [type]);

  if (type === 'crypto-link') {
    return (
      <div className="relative w-full max-w-2xl h-96 lg:h-[28rem] rounded-xl overflow-hidden border border-border/30 bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

        {/* Demo content */}
        <div className="relative h-full flex flex-col">
          {/* Demo header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-xs text-muted-foreground">crypto-link.ckpayment.xyz</div>
            <div className="w-16" />
          </div>

          {/* Crypto Link Demo Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              {!isApproved ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <CreditCard className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Crypto Link Demo
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Approve once, pay with 1-click forever
                  </p>

                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Monthly Subscription</span>
                        <span className="text-sm font-bold">10 ICP</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>Secure on-chain approval</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleApproveSubscription}
                      disabled={isApproving}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isApproving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Approve Subscription
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                    Approved Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Future payments will be processed with 1-click
                  </p>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-left">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">Crypto Link Active</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +7% conversion rate improvement expected
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-70 -z-10" />
      </div>
    );
  }
  // Default demo view
  return (
    <div
      className="relative w-full max-w-2xl h-96 lg:h-[28rem] rounded-xl overflow-hidden border border-border/30 bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

      {/* Demo content placeholder */}
      <div className="relative h-full flex flex-col">
        {/* Demo header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-xs text-muted-foreground">demo.ckpayment.xyz</div>
          <div className="w-16" /> {/* Spacer for flex alignment */}
        </div>

        {/* Demo content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2v8" />
                  <path d="m17 7 1.5 1.5" />
                  <path d="M22 12h-8" />
                  <path d="m17 17 1.5-1.5" />
                  <path d="M12 22v-8" />
                  <path d="m7 17-1.5-1.5" />
                  <path d="M2 12h8" />
                  <path d="m7 7-1.5 1.5" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Live Demo</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Experience seamless Web3 payments in action</p>

            {/* Animated progress bar */}
            <div className="mt-8 w-full max-w-xs mx-auto h-2 bg-background/50 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            </div>

            {/* Network nodes animation */}
            <div className="mt-6 flex justify-center space-x-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s',
                    animationIterationCount: 'infinite',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-70 -z-10" />
    </div>
  );
};

export default DemoEmbed;
