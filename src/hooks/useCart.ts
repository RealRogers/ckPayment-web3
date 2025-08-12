import { useState, useCallback, useMemo } from 'react';
import { Product, CartItem, CartSummary } from '@/components/CkPaymentEcommerceDemo';

// Cart action types for reducer pattern (if needed later)
export type CartAction = 
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

// Hook return interface
export interface UseCartReturn {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartSummary: () => CartSummary;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Utility function to calculate subtotal for a cart item
const calculateSubtotal = (product: Product, quantity: number): number => {
  return Number((product.price * quantity).toFixed(8)); // 8 decimal places for ckBTC precision
};

// Utility function to format ckBTC amounts
export const formatCkBTC = (amount: number): string => {
  return amount.toFixed(8).replace(/\.?0+$/, ''); // Remove trailing zeros
};

// Custom hook for cart state management
export const useCart = (): UseCartReturn => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Add item to cart or increase quantity if already exists
  const addItem = useCallback((product: Product) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + 1;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: calculateSubtotal(product, newQuantity)
        };
        
        return updatedItems;
      } else {
        // New item, add to cart
        const newItem: CartItem = {
          productId: product.id,
          product,
          quantity: 1,
          subtotal: calculateSubtotal(product, 1)
        };
        
        return [...currentItems, newItem];
      }
    });
  }, []);

  // Remove item completely from cart
  const removeItem = useCallback((productId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.productId !== productId)
    );
  }, []);

  // Update quantity of specific item
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      removeItem(productId);
      return;
    }

    setItems(currentItems => {
      const updatedItems = currentItems.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            subtotal: calculateSubtotal(item.product, quantity)
          };
        }
        return item;
      });
      
      return updatedItems;
    });
  }, [removeItem]);

  // Clear all items from cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Check if product is in cart
  const isInCart = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // Get quantity of specific item in cart
  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }, [items]);

  // Calculate total price using useMemo for performance
  const total = useMemo(() => {
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    return Number(totalAmount.toFixed(8)); // Ensure precision for ckBTC
  }, [items]);

  // Calculate total item count
  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  // Get complete cart summary
  const getCartSummary = useCallback((): CartSummary => {
    return {
      items,
      subtotal: total,
      total, // Same as subtotal for demo simplicity
      itemCount
    };
  }, [items, total, itemCount]);

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartSummary,
    isInCart,
    getItemQuantity
  };
};

// Helper hook for cart operations with toast notifications
export const useCartWithToast = () => {
  const cart = useCart();
  
  // You can extend this to add toast notifications for cart operations
  // This would integrate with the existing toast system
  
  return cart;
};

export default useCart;