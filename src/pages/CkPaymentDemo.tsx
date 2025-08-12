import React from 'react';
import CkPaymentEcommerceDemo from '../components/CkPaymentEcommerceDemo';

const CkPaymentDemo: React.FC = () => {
  return (
    <div>
      <CkPaymentEcommerceDemo 
        theme="light"
        canisterId="demo-canister-id"
        testMode={true}
      />
    </div>
  );
};

export default CkPaymentDemo;