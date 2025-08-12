import { renderHook, act } from '@testing-library/react';
import { useCart, formatCkBTC } from '../useCart';
import { Product } from '@/components/CkPaymentEcommerceDemo';

// Mock products for testing
const mockProducts: Product[] = [
  {
    id: 'test-product-1',
    name: 'Test T-Shirt',
    price: 0.5,
    description: 'Test product description',
    inStock: true
  },
  {
    id: 'test-product-2',
    name: 'Test Hat',
    price: 0.3,
    description: 'Another test product',
    inStock: true
  },
  {
    id: 'test-product-3',
    name: 'Test Course',
    price: 0.8,
    description: 'Digital test product',
    inStock: true
  }
];

describe('useCart Hook', () => {
  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('test-product-1');
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].subtotal).toBe(0.5);
    expect(result.current.total).toBe(0.5);
    expect(result.current.itemCount).toBe(1);
  });

  it('should increase quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.addItem(mockProducts[0]);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].subtotal).toBe(1.0);
    expect(result.current.total).toBe(1.0);
    expect(result.current.itemCount).toBe(2);
  });

  it('should add multiple different items', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.addItem(mockProducts[1]);
    });
    
    expect(result.current.items).toHaveLength(2);
    expect(result.current.total).toBe(0.8); // 0.5 + 0.3
    expect(result.current.itemCount).toBe(2);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.addItem(mockProducts[1]);
      result.current.removeItem('test-product-1');
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('test-product-2');
    expect(result.current.total).toBe(0.3);
    expect(result.current.itemCount).toBe(1);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.updateQuantity('test-product-1', 3);
    });
    
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.items[0].subtotal).toBe(1.5); // 0.5 * 3
    expect(result.current.total).toBe(1.5);
    expect(result.current.itemCount).toBe(3);
  });

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.updateQuantity('test-product-1', 0);
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('should clear all items from cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.addItem(mockProducts[1]);
      result.current.clearCart();
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('should check if item is in cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
    });
    
    expect(result.current.isInCart('test-product-1')).toBe(true);
    expect(result.current.isInCart('test-product-2')).toBe(false);
  });

  it('should get item quantity', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.addItem(mockProducts[0]);
    });
    
    expect(result.current.getItemQuantity('test-product-1')).toBe(2);
    expect(result.current.getItemQuantity('test-product-2')).toBe(0);
  });

  it('should return correct cart summary', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProducts[0]);
      result.current.addItem(mockProducts[1]);
      result.current.addItem(mockProducts[0]); // Add first item again
    });
    
    const summary = result.current.getCartSummary();
    
    expect(summary.items).toHaveLength(2);
    expect(summary.subtotal).toBe(1.3); // (0.5 * 2) + (0.3 * 1)
    expect(summary.total).toBe(1.3);
    expect(summary.itemCount).toBe(3);
  });

  it('should handle ckBTC precision correctly', () => {
    const { result } = renderHook(() => useCart());
    
    // Test with a product that has many decimal places
    const precisionProduct: Product = {
      id: 'precision-test',
      name: 'Precision Test',
      price: 0.12345678,
      description: 'Test precision',
      inStock: true
    };
    
    act(() => {
      result.current.addItem(precisionProduct);
      result.current.updateQuantity('precision-test', 3);
    });
    
    // Should maintain 8 decimal places precision
    expect(result.current.total).toBe(0.37037034); // 0.12345678 * 3
  });
});

describe('formatCkBTC utility', () => {
  it('should format ckBTC amounts correctly', () => {
    expect(formatCkBTC(0.5)).toBe('0.5');
    expect(formatCkBTC(0.50000000)).toBe('0.5');
    expect(formatCkBTC(1.23456789)).toBe('1.23456789');
    expect(formatCkBTC(0.00000001)).toBe('0.00000001');
    expect(formatCkBTC(0)).toBe('0');
    expect(formatCkBTC(1)).toBe('1');
  });
});