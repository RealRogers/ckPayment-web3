import { renderHook, act, waitFor } from '@testing-library/react';
import { useCkPayment } from '../useCkPayment';

// Mock the global window object
const mockCkPaySDK = {
  PaymentComponent: {
    initialize: jest.fn(),
    renderPaymentModal: jest.fn(),
    destroy: jest.fn()
  }
};

// Mock DOM methods
const mockAppendChild = jest.fn();
const mockRemove = jest.fn();
const mockGetElementById = jest.fn();

// Setup DOM mocks
Object.defineProperty(document, 'head', {
  value: { appendChild: mockAppendChild },
  writable: true
});

Object.defineProperty(document, 'body', {
  value: { appendChild: mockAppendChild },
  writable: true
});

Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      src: '',
      async: false,
      crossOrigin: '',
      id: '',
      style: { cssText: '' },
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      addEventListener: jest.fn(),
      remove: mockRemove
    };
    return element;
  }),
  writable: true
});

describe('useCkPayment', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockGetElementById.mockReturnValue(null);
    
    // Reset window.ckPaySDK
    delete (window as any).ckPaySDK;
  });

  afterEach(() => {
    // Clean up any remaining DOM elements
    delete (window as any).ckPaySDK;
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCkPayment());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.initializePayment).toBe('function');
    expect(typeof result.current.processPayment).toBe('function');
    expect(typeof result.current.cleanup).toBe('function');
  });

  it('should load SDK script on mount', async () => {
    renderHook(() => useCkPayment());

    await waitFor(() => {
      expect(mockAppendChild).toHaveBeenCalled();
    });

    // Verify script element was created with correct properties
    const scriptCall = mockAppendChild.mock.calls.find(call => 
      call[0].tagName === 'SCRIPT'
    );
    expect(scriptCall).toBeDefined();
    expect(scriptCall[0].src).toBe('https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/ckPay.js');
    expect(scriptCall[0].async).toBe(true);
  });

  it('should handle SDK load success', async () => {
    const { result } = renderHook(() => useCkPayment());

    // Simulate SDK loading
    (window as any).ckPaySDK = mockCkPaySDK;
    
    // Find the script element and trigger onload
    const scriptCall = mockAppendChild.mock.calls.find(call => 
      call[0].tagName === 'SCRIPT'
    );
    
    if (scriptCall && scriptCall[0].onload) {
      act(() => {
        scriptCall[0].onload();
      });
    }

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle SDK load error', async () => {
    const { result } = renderHook(() => useCkPayment());

    // Find the script element and trigger onerror
    const scriptCall = mockAppendChild.mock.calls.find(call => 
      call[0].tagName === 'SCRIPT'
    );
    
    if (scriptCall && scriptCall[0].onerror) {
      act(() => {
        scriptCall[0].onerror();
      });
    }

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.error).toContain('Failed to load ckPayment SDK');
    });
  });

  it('should initialize payment successfully', async () => {
    // Setup SDK
    (window as any).ckPaySDK = mockCkPaySDK;
    
    const { result } = renderHook(() => useCkPayment());

    // Simulate SDK loaded
    act(() => {
      const scriptCall = mockAppendChild.mock.calls.find(call => 
        call[0].tagName === 'SCRIPT'
      );
      if (scriptCall && scriptCall[0].onload) {
        scriptCall[0].onload();
      }
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // Initialize payment
    await act(async () => {
      await result.current.initializePayment(1.5);
    });

    expect(mockCkPaySDK.PaymentComponent.initialize).toHaveBeenCalledWith('ckpayment-modal');
    expect(mockCkPaySDK.PaymentComponent.renderPaymentModal).toHaveBeenCalled();
    expect(result.current.isInitialized).toBe(true);
  });

  it('should handle payment initialization error', async () => {
    const { result } = renderHook(() => useCkPayment());

    // Try to initialize payment without SDK loaded
    await act(async () => {
      try {
        await result.current.initializePayment(1.5);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should cleanup modal container', () => {
    const { result } = renderHook(() => useCkPayment());

    // Mock existing modal
    const mockModal = { remove: jest.fn() };
    mockGetElementById.mockReturnValue(mockModal);

    act(() => {
      result.current.cleanup();
    });

    expect(mockModal.remove).toHaveBeenCalled();
  });

  it('should process payment with custom configuration', async () => {
    // Setup SDK
    (window as any).ckPaySDK = mockCkPaySDK;
    
    const { result } = renderHook(() => useCkPayment());

    // Simulate SDK loaded
    act(() => {
      const scriptCall = mockAppendChild.mock.calls.find(call => 
        call[0].tagName === 'SCRIPT'
      );
      if (scriptCall && scriptCall[0].onload) {
        scriptCall[0].onload();
      }
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    const mockConfig = {
      amount: 2.5,
      currency: 'ckBTC' as const,
      onSuccess: jest.fn(),
      onError: jest.fn()
    };

    // Process payment
    const paymentPromise = act(async () => {
      return result.current.processPayment(mockConfig);
    });

    // The payment should be initialized
    expect(mockCkPaySDK.PaymentComponent.initialize).toHaveBeenCalled();
    expect(mockCkPaySDK.PaymentComponent.renderPaymentModal).toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useCkPayment());

    // Mock existing modal
    const mockModal = { remove: jest.fn() };
    mockGetElementById.mockReturnValue(mockModal);

    unmount();

    // Verify cleanup was called
    expect(mockRemove).toHaveBeenCalled();
  });
});