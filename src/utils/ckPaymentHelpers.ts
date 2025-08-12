/**
 * Utility functions for ckPayment SDK integration
 */

// ckPayment SDK configuration constants
export const CKPAYMENT_CONFIG = {
  SDK_URL: 'https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckPay.js',
  MODAL_CONTAINER_ID: 'ckpayment-modal',
  DEFAULT_CANISTER_ID: 'placeholder-canister-id',
  CURRENCY: 'ckBTC' as const,
  DECIMAL_PLACES: 8
} as const;

/**
 * Format ckBTC amount with proper precision
 * @param amount - Amount in ckBTC
 * @param decimals - Number of decimal places (default: 8)
 * @returns Formatted ckBTC string
 */
export const formatCkBTC = (amount: number, decimals: number = CKPAYMENT_CONFIG.DECIMAL_PLACES): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00000000';
  }
  
  return amount.toFixed(decimals);
};

/**
 * Parse ckBTC string to number
 * @param amountStr - ckBTC amount as string
 * @returns Parsed number or 0 if invalid
 */
export const parseCkBTC = (amountStr: string): number => {
  const parsed = parseFloat(amountStr);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate ckBTC amount
 * @param amount - Amount to validate
 * @returns True if valid, false otherwise
 */
export const isValidCkBTCAmount = (amount: number): boolean => {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         isFinite(amount) && 
         amount >= 0;
};

/**
 * Generate unique order ID
 * @param prefix - Optional prefix for the order ID
 * @returns Unique order ID string
 */
export const generateOrderId = (prefix: string = 'order'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Create payment metadata object
 * @param orderId - Order identifier
 * @param items - Cart items
 * @param additionalData - Additional metadata
 * @returns Payment metadata object
 */
export const createPaymentMetadata = (
  orderId: string,
  items: any[] = [],
  additionalData: Record<string, any> = {}
) => {
  return {
    orderId,
    items: items.map(item => ({
      productId: item.productId,
      name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.product?.price || 0,
      subtotal: item.subtotal || 0
    })),
    timestamp: Date.now(),
    currency: CKPAYMENT_CONFIG.CURRENCY,
    ...additionalData
  };
};

/**
 * Check if ckPayment SDK is loaded
 * @returns True if SDK is available, false otherwise
 */
export const isCkPaymentSDKLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         window.ckPaySDK !== undefined &&
         window.ckPaySDK.PaymentComponent !== undefined;
};

/**
 * Get canister ID from environment or use default
 * @returns Canister ID string
 */
export const getCanisterId = (): string => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_CANISTER_ID) {
    return process.env.REACT_APP_CANISTER_ID;
  }
  
  return CKPAYMENT_CONFIG.DEFAULT_CANISTER_ID;
};

/**
 * Create modal container styles
 * @returns CSS styles object for modal container
 */
export const getModalContainerStyles = (): string => {
  return `
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
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  `;
};

/**
 * Sanitize payment amount to prevent precision issues
 * @param amount - Raw amount
 * @returns Sanitized amount with proper precision
 */
export const sanitizePaymentAmount = (amount: number): number => {
  if (!isValidCkBTCAmount(amount)) {
    return 0;
  }
  
  // Round to 8 decimal places to prevent floating point precision issues
  return Math.round(amount * Math.pow(10, CKPAYMENT_CONFIG.DECIMAL_PLACES)) / Math.pow(10, CKPAYMENT_CONFIG.DECIMAL_PLACES);
};

/**
 * Calculate total from cart items
 * @param items - Array of cart items
 * @returns Total amount in ckBTC
 */
export const calculateCartTotal = (items: any[]): number => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  const total = items.reduce((sum, item) => {
    const itemTotal = (item.product?.price || 0) * (item.quantity || 0);
    return sum + itemTotal;
  }, 0);
  
  return sanitizePaymentAmount(total);
};

/**
 * Validate payment configuration
 * @param config - Payment configuration object
 * @returns Validation result with errors if any
 */
export const validatePaymentConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!config.amount || !isValidCkBTCAmount(config.amount)) {
    errors.push('Valid amount is required');
  }
  
  if (config.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!config.currency || config.currency !== CKPAYMENT_CONFIG.CURRENCY) {
    errors.push(`Currency must be ${CKPAYMENT_CONFIG.CURRENCY}`);
  }
  
  if (!config.onSuccess || typeof config.onSuccess !== 'function') {
    errors.push('onSuccess callback is required');
  }
  
  if (!config.onError || typeof config.onError !== 'function') {
    errors.push('onError callback is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create user-friendly error messages
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export const createUserFriendlyErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Map common technical errors to user-friendly messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Connection lost. Please check your internet and try again.';
    }
    
    if (errorMessage.includes('sdk') || errorMessage.includes('script')) {
      return 'Payment system unavailable. Please refresh and try again.';
    }
    
    if (errorMessage.includes('payment') || errorMessage.includes('transaction')) {
      return 'Payment could not be processed. Please try again or contact support.';
    }
    
    if (errorMessage.includes('canister') || errorMessage.includes('icp')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Log payment events for debugging (development only)
 * @param event - Event name
 * @param data - Event data
 */
export const logPaymentEvent = (event: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ckPayment] ${event}:`, data);
  }
};

/**
 * Debounce function for preventing rapid payment attempts
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Export configuration for external use
export { CKPAYMENT_CONFIG as default };