import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  total: number;
  disabled: boolean;
  onCheckout: () => void;
  loading: boolean;
  className?: string;
}

/**
 * CheckoutButton Component
 * 
 * A dedicated button component for initiating ckPayment transactions.
 * Features:
 * - Disabled state when cart is empty
 * - Loading state during payment processing
 * - Proper accessibility attributes
 * - Tailwind CSS styling with gradient background
 */
const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  total,
  disabled,
  onCheckout,
  loading,
  className = ''
}) => {
  // Format ckBTC amount with proper precision
  const formatCkBTC = (amount: number): string => {
    return amount.toFixed(8);
  };

  // Determine button state and content
  const isDisabled = disabled || loading || total <= 0;
  const buttonText = loading ? 'Processing...' : 'Checkout with ckPayment';
  const ariaLabel = loading 
    ? 'Processing payment...' 
    : `Checkout with total of ${formatCkBTC(total)} ckBTC`;

  return (
    <Button
      className={`w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
      disabled={isDisabled}
      onClick={onCheckout}
      aria-label={ariaLabel}
      aria-describedby="checkout-total"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {buttonText}
    </Button>
  );
};

export default CheckoutButton;