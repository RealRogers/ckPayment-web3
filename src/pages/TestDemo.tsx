import React from 'react';
import CkPaymentEcommerceDemo from '../components/CkPaymentEcommerceDemo';

const TestDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">
            ckPayment E-Commerce Demo - Test Page
          </h1>
        </div>
      </div>

      {/* Demo Component */}
      <CkPaymentEcommerceDemo 
        theme="light"
        canisterId="test-canister-id"
        testMode={true}
      />
    </div>
  );
};

export default TestDemo;