import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart as ShoppingCartIcon,
  Plus,
  Minus,
  Trash2,
  Package
} from "lucide-react";
import { CartItem } from "./CkPaymentEcommerceDemo";
import CheckoutButton from "./CheckoutButton";

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isCheckoutDisabled?: boolean;
  isLoading?: boolean;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  total,
  itemCount,
  onCheckout,
  isCheckoutDisabled = false,
  isLoading = false
}) => {
  // Format ckBTC amount with proper precision
  const formatCkBTC = (amount: number): string => {
    return amount.toFixed(8);
  };

  // Handle quantity increase with validation
  const handleQuantityIncrease = (productId: string, currentQuantity: number) => {
    onUpdateQuantity(productId, currentQuantity + 1);
  };

  // Handle quantity decrease with validation
  const handleQuantityDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(productId, currentQuantity - 1);
    } else {
      onRemoveItem(productId);
    }
  };

  // Handle item removal
  const handleRemoveItem = (productId: string) => {
    onRemoveItem(productId);
  };

  return (
    <Card className="p-4 sm:p-6 sticky top-4 sm:top-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Shopping Cart</span>
          <span className="sm:hidden">Cart</span>
          {itemCount > 0 && (
            <Badge variant="secondary" className="ml-1 sm:ml-2">
              {itemCount}
            </Badge>
          )}
        </h2>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        // Empty cart state
        <div className="text-center py-8 text-muted-foreground">
          <ShoppingCartIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Your cart is empty</p>
          <p className="text-sm">Add some products to get started</p>
        </div>
      ) : (
        // Cart with items
        <div>
          {/* Cart Items List */}
          <div className="space-y-3 mb-4 sm:mb-6">
            {items.map((item) => (
              <div 
                key={item.productId} 
                className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 bg-muted/20 sm:bg-muted/30 rounded-lg border border-muted/30 hover:border-muted/70 transition-colors"
              >
                {/* Product Info */}
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      className="font-medium text-sm sm:text-base truncate max-w-[180px] sm:max-w-[200px]" 
                      title={item.product.name}
                    >
                      {item.product.name}
                    </h4>
                    <span className="text-sm font-medium text-blue-600 whitespace-nowrap sm:hidden">
                      {formatCkBTC(item.subtotal)} ckBTC
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCkBTC(item.product.price)} ckBTC each
                  </p>
                  <p className="text-xs font-medium text-blue-600 mt-1 hidden sm:block">
                    Subtotal: {formatCkBTC(item.subtotal)} ckBTC
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityDecrease(item.productId, item.quantity)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-50 hover:border-red-200 flex-shrink-0"
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                    
                    <span 
                      className="text-sm font-medium w-8 text-center bg-background border rounded px-1 py-1"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityIncrease(item.productId, item.quantity)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-green-50 hover:border-green-200 flex-shrink-0"
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveItem(item.productId)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 sm:ml-1"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-muted/30 pt-4 space-y-3 sm:space-y-4">
            {/* Item Count - Hidden on mobile since we show it in the header */}
            <div className="hidden sm:flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
              </span>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center py-2 sm:py-3 border-t border-muted/30">
              <div>
                <span className="font-semibold text-base sm:text-lg">Total:</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Excluding any network fees
                </p>
              </div>
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {formatCkBTC(total)} <span className="text-sm font-medium">ckBTC</span>
              </span>
            </div>

            {/* Checkout Button */}
            <div className="pt-1">
              <CheckoutButton
                total={total}
                disabled={isCheckoutDisabled}
                onCheckout={onCheckout}
                loading={isLoading}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium"
              />
              
              {/* Payment Icons - Show on mobile */}
              <div className="flex justify-center gap-2 mt-3 sm:mt-4 opacity-70">
                <div className="text-xs text-muted-foreground flex items-center">
                  <span className="hidden sm:inline mr-1">Secure payment with</span>
                  <span className="inline-block w-16 h-4 bg-muted rounded-sm"></span>
                </div>
              </div>
              
              {/* Checkout Help Text */}
              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure payment powered by ckPayment on the Internet Computer
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ShoppingCart;