import { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript declarations for ckPayment SDK
declare global {
  interface Window {
    ckPaySDK?: {
      PaymentComponent: {
        initialize: (containerId: string) => void;
        renderPaymentModal: (config: PaymentConfig) => void;
        destroy: () => void;
      };
    };
  }
}

// Payment configuration interface
interface PaymentConfig {
  amount: number;
  currency: 'ckBTC';
  canisterId?: string;
  metadata?: {
    orderId: string;
    items: any[];
  };
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onClose?: () => void;
}

// Payment result interface
interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  timestamp: number;
}

// Hook return interface
interface UseCkPaymentReturn {
  isLoaded: boolean;
  isInitialized: boolean;
  error: string | null;
  isLoading: boolean;
  initializePayment: (amount: number, config?: Partial<PaymentConfig>) => Promise<void>;
  processPayment: (config: PaymentConfig) => Promise<PaymentResult>;
  cleanup: () => void;
}

// ckPayment SDK CDN URL
const CKPAYMENT_SDK_URL = 'https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckPay.js';

/**
 * Custom hook for ckPayment SDK integration
 * Handles SDK loading, initialization, and payment processing
 */
export const useCkPayment = (): UseCkPaymentReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to track SDK state and prevent memory leaks
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const isUnmountedRef = useRef(false);

  /**
   * Load ckPayment SDK from CDN
   */
  const loadCkPaymentSDK = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.ckPaySDK) {
        setIsLoaded(true);
        resolve();
        return;
      }

      // Check if script is already being loaded
      if (scriptRef.current) {
        // Wait for existing script to load
        scriptRef.current.addEventListener('load', () => resolve());
        scriptRef.current.addEventListener('error', () => reject(new Error('Failed to load ckPayment SDK')));
        return;
      }

      try {
        // Create and configure script element
        const script = document.createElement('script');
        script.src = CKPAYMENT_SDK_URL;
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        // Handle successful load
        script.onload = () => {
          if (!isUnmountedRef.current) {
            setIsLoaded(true);
            setError(null);
            resolve();
          }
        };

        // Handle load error
        script.onerror = () => {
          if (!isUnmountedRef.current) {
            const errorMsg = 'Failed to load ckPayment SDK. Please check your internet connection and try again.';
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        };

        // Add script to document
        document.head.appendChild(script);
        scriptRef.current = script;

      } catch (err) {
        const errorMsg = 'Error initializing ckPayment SDK loader';
        setError(errorMsg);
        reject(new Error(errorMsg));
      }
    });
  }, []);

  /**
   * Create payment modal container
   */
  const createModalContainer = useCallback((): string => {
    // Remove existing modal container if it exists
    const existingModal = document.getElementById('ckpayment-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create new modal container
    const modalDiv = document.createElement('div');
    modalDiv.id = 'ckpayment-modal';
    modalDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    document.body.appendChild(modalDiv);
    modalContainerRef.current = modalDiv;
    
    return modalDiv.id;
  }, []);

  /**
   * Initialize payment with ckPayment SDK
   */
  const initializePayment = useCallback(async (
    amount: number, 
    config: Partial<PaymentConfig> = {}
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure SDK is loaded
      if (!isLoaded) {
        await loadCkPaymentSDK();
      }

      // Verify SDK is available
      if (!window.ckPaySDK) {
        throw new Error('ckPayment SDK not available');
      }

      // Create modal container
      const containerId = createModalContainer();

      // Initialize ckPayment component
      window.ckPaySDK.PaymentComponent.initialize(containerId);
      setIsInitialized(true);

      // Default payment configuration
      const defaultConfig: PaymentConfig = {
        amount,
        currency: 'ckBTC',
        canisterId: process.env.REACT_APP_CANISTER_ID || 'placeholder-canister-id',
        metadata: {
          orderId: `order-${Date.now()}`,
          items: []
        },
        onSuccess: (transactionId: string) => {
          console.log('Payment successful:', transactionId);
        },
        onError: (error: string) => {
          console.error('Payment failed:', error);
          setError(error);
        },
        onClose: () => {
          cleanup();
        },
        ...config
      };

      // Render payment modal
      window.ckPaySDK.PaymentComponent.renderPaymentModal(defaultConfig);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, loadCkPaymentSDK, createModalContainer]);

  /**
   * Process payment with custom configuration
   */
  const processPayment = useCallback(async (config: PaymentConfig): Promise<PaymentResult> => {
    return new Promise((resolve, reject) => {
      try {
        setIsLoading(true);
        setError(null);

        // Wrap callbacks to handle promise resolution
        const wrappedConfig: PaymentConfig = {
          ...config,
          onSuccess: (transactionId: string) => {
            const result: PaymentResult = {
              success: true,
              transactionId,
              timestamp: Date.now()
            };
            
            // Call original success callback
            config.onSuccess(transactionId);
            
            // Resolve promise
            resolve(result);
            setIsLoading(false);
          },
          onError: (error: string) => {
            const result: PaymentResult = {
              success: false,
              error,
              timestamp: Date.now()
            };
            
            // Call original error callback
            config.onError(error);
            
            // Set error state
            setError(error);
            
            // Resolve with error result (don't reject to allow error handling)
            resolve(result);
            setIsLoading(false);
          }
        };

        // Initialize payment with wrapped config
        initializePayment(config.amount, wrappedConfig);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
        setError(errorMessage);
        setIsLoading(false);
        reject(new Error(errorMessage));
      }
    });
  }, [initializePayment]);

  /**
   * Cleanup function to remove modal and reset state
   */
  const cleanup = useCallback(() => {
    // Remove modal container
    if (modalContainerRef.current) {
      modalContainerRef.current.remove();
      modalContainerRef.current = null;
    }

    // Destroy ckPayment component if available
    if (window.ckPaySDK?.PaymentComponent?.destroy) {
      try {
        window.ckPaySDK.PaymentComponent.destroy();
      } catch (err) {
        console.warn('Error destroying ckPayment component:', err);
      }
    }

    // Reset initialization state
    setIsInitialized(false);
    setIsLoading(false);
  }, []);

  /**
   * Load SDK on mount
   */
  useEffect(() => {
    loadCkPaymentSDK().catch((err) => {
      console.error('Failed to load ckPayment SDK:', err);
    });

    // Cleanup on unmount
    return () => {
      isUnmountedRef.current = true;
      cleanup();
      
      // Remove script if we added it
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [loadCkPaymentSDK, cleanup]);

  return {
    isLoaded,
    isInitialized,
    error,
    isLoading,
    initializePayment,
    processPayment,
    cleanup
  };
};

export default useCkPayment;

// Export types for use in other components
export type { PaymentConfig, PaymentResult, UseCkPaymentReturn };