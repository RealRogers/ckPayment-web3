/**
 * Example usage of useCkPayment hook
 * This file demonstrates how to integrate the ckPayment SDK hook
 */

import React, { useState } from 'react';
import { useCkPayment } from './useCkPayment';
import { formatCkBTC, generateOrderId, createPaymentMetadata } from '../utils/ckPaymentHelpers';

// Example cart item interface
interface CartItem {
  productId: string;
  product: {
    name: string;
    price: number;
  };
  quantity: number;
  subtotal: number;
}

const CkPaymentExample: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Example cart items
  const [cartItems] = useState<CartItem[]>([
    {
      productId: 'tshirt-001',
      product: { name: 'Premium T-Shirt', price: 0.5 },
      quantity: 2,
      subtotal: 1.0
    },
    {
      productId: 'hat-001',
      product: { name: 'Designer Hat', price: 0.3 },
      quantity: 1,
      subtotal: 0.3
    }
  ]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Initialize ckPayment hook
  const {
    isLoaded,
    isInitialized,
    error: sdkError,
    isLoading,
    initializePayment,
    processPayment,
    cleanup
  } = useCkPayment();

  // Handle checkout button click
  const handleCheckout = async () => {
    try {
      setPaymentStatus('processing');
      setErrorMessage('');

      // Generate order ID and metadata
      const orderId = generateOrderId('demo');
      const metadata = createPaymentMetadata(orderId, cartItems, {
        customerEmail: 'demo@example.com',
        source: 'ckPayment Demo'
      });

      // Process payment with custom configuration
      const result = await processPayment({
        amount: totalAmount,
        currency: 'ckBTC',
        canisterId: process.env.REACT_APP_CANISTER_ID || 'demo-canister-id',
        metadata,
        onSuccess: (txId: string) => {
          console.log('Payment successful!', txId);
          setTransactionId(txId);
          setPaymentStatus('success');
        },
        onError: (error: string) => {
          console.error('Payment failed:', error);
          setErrorMessage(error);
          setPaymentStatus('error');
        },
        onClose: () => {
          console.log('Payment modal closed');
          if (paymentStatus === 'processing') {
            setPaymentStatus('idle');
          }
        }
      });

      console.log('Payment result:', result);

    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setPaymentStatus('error');
    }
  };

  // Handle retry payment
  const handleRetry = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setTransactionId('');
    cleanup();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">ckPayment Integration Example</h2>
      
      {/* SDK Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">SDK Status:</h3>
        <ul className="text-sm space-y-1">
          <li>Loaded: <span className={isLoaded ? 'text-green-600' : 'text-red-600'}>{isLoaded ? '✓' : '✗'}</span></li>
          <li>Initialized: <span className={isInitialized ? 'text-green-600' : 'text-gray-500'}>{isInitialized ? '✓' : '○'}</span></li>
          <li>Loading: <span className={isLoading ? 'text-blue-600' : 'text-gray-500'}>{isLoading ? '⟳' : '○'}</span></li>
        </ul>
        {sdkError && (
          <p className="text-red-600 text-sm mt-2">Error: {sdkError}</p>
        )}
      </div>

      {/* Cart Items */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Cart Items:</h3>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>{item.product.name} x{item.quantity}</span>
              <span>{formatCkBTC(item.subtotal)} ckBTC</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 mt-2 font-semibold">
          Total: {formatCkBTC(totalAmount)} ckBTC
        </div>
      </div>

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <div className="mb-4 p-3 rounded">
          {paymentStatus === 'processing' && (
            <div className="text-blue-600">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Processing payment...
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-green-600">
              <div className="font-semibold">✓ Payment Successful!</div>
              <div className="text-sm mt-1">Transaction ID: {transactionId}</div>
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="text-red-600">
              <div className="font-semibold">✗ Payment Failed</div>
              <div className="text-sm mt-1">{errorMessage}</div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {paymentStatus === 'idle' && (
          <button
            onClick={handleCheckout}
            disabled={!isLoaded || isLoading || cartItems.length === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : `Checkout ${formatCkBTC(totalAmount)} ckBTC`}
          </button>
        )}

        {paymentStatus === 'error' && (
          <button
            onClick={handleRetry}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Try Again
          </button>
        )}

        {paymentStatus === 'success' && (
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Start New Order
          </button>
        )}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify({
              isLoaded,
              isInitialized,
              isLoading,
              paymentStatus,
              sdkError,
              cartItems,
              totalAmount
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default CkPaymentExample;