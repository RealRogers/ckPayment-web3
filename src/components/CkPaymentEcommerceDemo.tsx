import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart as ShoppingCartIcon,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useCkPayment } from "@/hooks/useCkPayment";
import ProductList from "./ProductList";
import ShoppingCartComponent from "./ShoppingCart";
import PaymentStatus, { PaymentStatusType } from "./PaymentStatus";

// Core TypeScript Interfaces
export interface Product {
  id: string;
  name: string;
  price: number; // ckBTC amount
  description: string;
  image?: string;
  category?: string;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number; // calculated field
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  total: number; // same as subtotal for demo simplicity
  itemCount: number;
}

export interface PaymentConfig {
  amount: number;
  currency: 'ckBTC';
  canisterId?: string;
  metadata?: {
    orderId: string;
    items: CartItem[];
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  timestamp: number;
}

export interface ErrorState {
  type: 'sdk' | 'payment' | 'network' | 'validation';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Component Props Interfaces
export interface CkPaymentEcommerceDemoProps {
  theme?: 'light' | 'dark';
  canisterId?: string;
  testMode?: boolean;
}

// Sample Product Data with realistic ckBTC prices
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'tshirt-001',
    name: 'Premium T-Shirt',
    price: 0.5,
    description: 'High-quality cotton t-shirt with modern design. Perfect for everyday wear.',
    image: '/api/placeholder/300/300',
    category: 'clothing',
    inStock: true
  },
  {
    id: 'hat-001',
    name: 'Designer Hat',
    price: 0.3,
    description: 'Stylish hat perfect for any occasion. Made with premium materials.',
    image: '/api/placeholder/300/300',
    category: 'accessories',
    inStock: true
  },
  {
    id: 'course-001',
    name: 'Digital Course',
    price: 0.8,
    description: 'Complete guide to blockchain development on the Internet Computer.',
    image: '/api/placeholder/300/300',
    category: 'digital',
    inStock: true
  }
];

// Main Component
const CkPaymentEcommerceDemo: React.FC<CkPaymentEcommerceDemoProps> = ({
  theme = 'light',
  canisterId = 'placeholder-canister-id',
  testMode = true
}) => {
  const { toast } = useToast();

  // Cart state management using custom hook
  const {
    items: cartItems,
    total: cartTotal,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartSummary,
    getItemQuantity
  } = useCart();

  // Component state
  const [error, setError] = useState<ErrorState | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('idle');
  const [transactionId, setTransactionId] = useState<string>('');

  // ckPayment SDK integration
  const {
    isLoaded: sdkLoaded,
    isInitialized: sdkInitialized,
    error: sdkError,
    isLoading: sdkLoading,
    initializePayment,
    processPayment,
    cleanup: cleanupPayment
  } = useCkPayment();

  useEffect(() => {
    // Component initialization
    console.log('ckPayment E-Commerce Demo initialized', {
      theme,
      canisterId,
      testMode,
      cartItemCount: itemCount,
      cartTotal,
      sdkLoaded,
      sdkInitialized
    });
  }, [theme, canisterId, testMode, itemCount, cartTotal, sdkLoaded, sdkInitialized]);

  // Handle SDK errors
  useEffect(() => {
    if (sdkError) {
      setError({
        type: 'sdk',
        message: sdkError,
        recoverable: true,
        retryAction: () => {
          setError(null);
          // SDK will automatically retry loading
        }
      });
    }
  }, [sdkError]);

  // Handle adding product to cart with user feedback
  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Handle removing product from cart with user feedback
  const handleRemoveFromCart = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      removeItem(productId);
      toast({
        title: "Removed from cart",
        description: `${item.product.name} has been removed from your cart.`,
      });
    }
  };

  // Handle quantity updates with validation
  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return; // Prevent negative quantities

    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      updateQuantity(productId, newQuantity);

      if (newQuantity === 0) {
        toast({
          title: "Removed from cart",
          description: `${item.product.name} has been removed from your cart.`,
        });
      }
    }
  };

  // Handle clear cart with user feedback
  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  // Handle checkout initiation with ckPayment SDK
  const handleCheckout = async () => {
    try {
      console.log('Checkout initiated with total:', cartTotal);
      
      // Reset states
      setError(null);
      setPaymentStatus('processing');
      setTransactionId('');

      // Generate order ID for tracking
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Initialize payment with ckPayment SDK
      await initializePayment(cartTotal, {
        canisterId: canisterId,
        metadata: {
          orderId,
          items: cartItems.map(item => ({
            productId: item.productId,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            subtotal: item.subtotal
          }))
        },
        onSuccess: (txId: string) => {
          console.log('Payment successful:', { transactionId: txId, orderId });
          setTransactionId(txId);
          setPaymentStatus('success');
          
          // Clear cart after successful payment
          clearCart();
          
          // Show success toast
          toast({
            title: "Payment successful!",
            description: `Transaction ${txId.substring(0, 8)}... completed`,
          });
          
          // Cleanup payment modal
          cleanupPayment();
        },
        onError: (error: string) => {
          console.error('Payment failed:', error);
          setPaymentStatus('error');
          
          setError({
            type: 'payment',
            message: error,
            recoverable: true,
            retryAction: () => {
              setError(null);
              handleCheckout(); // Retry checkout
            }
          });

          toast({
            title: "Payment failed",
            description: error,
            variant: "destructive"
          });
          
          // Cleanup payment modal
          cleanupPayment();
        },
        onClose: () => {
          console.log('Payment modal closed');
          if (paymentStatus !== 'success') {
            setPaymentStatus('idle');
          }
          cleanupPayment();
        }
      });

    } catch (err) {
      // Handle initialization errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      console.error('Checkout initialization failed:', err);
      
      setPaymentStatus('error');
      setError({
        type: 'sdk',
        message: errorMessage,
        recoverable: true,
        retryAction: () => {
          setError(null);
          handleCheckout(); // Retry checkout
        }
      });

      toast({
        title: "Checkout failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-500/20">
            <ShoppingCartIcon className="h-3 w-3 mr-1" />
            ckPayment E-Commerce Demo
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Shop with{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              ckPayment
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience seamless crypto payments with our interactive demo.
            Add items to your cart and checkout with ckBTC on the Internet Computer.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error: {error.message}</span>
              {error.recoverable && error.retryAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={error.retryAction}
                  className="ml-auto"
                >
                  Retry
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {sdkLoading && (
          <Card className="mb-6 p-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading ckPayment SDK...</span>
            </div>
          </Card>
        )}

        {/* SDK Status */}
        {!sdkLoaded && !sdkLoading && !error && (
          <Card className="mb-6 p-4 border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">ckPayment SDK is loading...</span>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Products Section */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Page Title */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Our Products
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Browse our selection of premium items
              </p>
            </div>
            
            {/* Product List */}
            <ProductList
              products={SAMPLE_PRODUCTS}
              onAddToCart={addItem}
              cartItems={cartItems}
              getItemQuantity={getItemQuantity}
              onUpdateQuantity={updateQuantity}
            />
          </div>

          {/* Shopping Cart Section - Sticky on larger screens */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="space-y-4">
              {/* Payment Status */}
              <PaymentStatus
                status={paymentStatus}
                transactionId={transactionId}
                error={error?.message}
                amount={cartTotal}
                onRetry={error?.retryAction}
                onClose={() => {
                  setPaymentStatus('idle');
                  setError(null);
                }}
                className="transition-all duration-300 ease-in-out"
              />
              
              <ShoppingCartComponent
                items={cartItems}
                onUpdateQuantity={handleQuantityUpdate}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                total={cartTotal}
                itemCount={itemCount}
                onCheckout={handleCheckout}
                isCheckoutDisabled={!sdkLoaded || !!error || paymentStatus === 'processing'}
                isLoading={sdkLoading || paymentStatus === 'processing'}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            This is a demo implementation of ckPayment integration.
            Fork this code and customize it for your own e-commerce needs.
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="mr-2">
              Canister ID: {canisterId}
            </Badge>
            {testMode && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Test Mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal Container - Will be used in Task 7 */}
      <div id="ckpayment-modal"></div>
    </div>
  );
};

export default CkPaymentEcommerceDemo;