import { create } from 'zustand';
import { Product } from '@/src/services/products';
import { cartAPI } from '@/src/services/cart';
import { getAuthToken } from '@/src/lib/useAuthStore';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  fetchCart: async () => {
    const token = getAuthToken();
    if (!token) {
        set({ items: [] });
        return;
    }
    
    set({ isLoading: true });
    try {
        const response = await cartAPI.getCart();
        const items = response.items.map(item => ({
            ...item.product,
            quantity: item.quantity
        }));
        set({ items });
    } catch (error) {
        console.error("Failed to fetch cart:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const token = getAuthToken();
    if (!token) {
        // Fallback or Alert? For now, require login or just local state?
        // User asked to move DB, implies login required.
        // We can just add to local state if not logged in, but the requirement was "move to DB".
        // Let's assume for now we force sync or handle partial.
        // Simplest: If logic requires DB, we try API, if fail (no auth), maybe redirect?
        // Let's implement optimistic update + API call.
        alert("Please login to add to cart"); 
        return;
    }

    try {
        await cartAPI.addItem(product.id, quantity);
        await get().fetchCart();
        set({ isOpen: true });
    } catch (error) {
        console.error("Failed to add item:", error);
        alert("Failed to add item to cart");
    }
  },

  removeItem: async (productId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
        // We need the cart item id, currently we have product_id.
        // fetchCart maps response to simple items list.
        // We might need to store cart_item_id or look it up.
        // API `removeItem` likely expects `cart_item_id`.
        // Let's check `cart.ts`: `removeItem: async (itemId: string)`
        // And `router.py`: `delete("/items/{item_id}")` looks for `CartItem.id`.
        // The current state structure `CartItem extends Product` mocks the old local cart.
        // I need to find the `cart_item_id`.
        // Problem: My `fetchCart` implementation lost the `cart_item_id`.
        // I should fix `fetchCart` first.
        
        // But wait, `cartAPI.getCart` returns `items: CartItemResponse[]`.
        // `CartItemResponse` has `id` (cart item id) and `product`.
        
        // Strategy: Refresh cart to get IDs.
        // Or better, let's look up the cart item ID from the current valid state if we stored it?
        // The current `items` buffer is just `Product & { quantity }`.
        
        // Let's re-fetch. But for removal, we need to know the ID.
        // I will hack this: `fetchCart` finds the item from server response matching productID.
        
        const response = await cartAPI.getCart();
        const itemToRemove = response.items.find(i => i.product_id === productId);
        
        if (itemToRemove) {
             await cartAPI.removeItem(itemToRemove.id);
             await get().fetchCart();
        }
    } catch (error) {
        console.error("Failed to remove item:", error);
    }
  },

  updateQuantity: async (productId, quantity) => {
     if (quantity < 1) {
        get().removeItem(productId);
        return;
     }

     try {
        const response = await cartAPI.getCart();
        const itemToUpdate = response.items.find(i => i.product_id === productId);
        
        if (itemToUpdate) {
             await cartAPI.updateItem(itemToUpdate.id, quantity);
             await get().fetchCart();
        }
     } catch (error) {
         console.error("Failed to update quantity:", error);
     }
  },

  clearCart: async () => {
      try {
          await cartAPI.clearCart();
          set({ items: [] });
      } catch (error) {
          console.error("Failed to clear cart:", error);
      }
  },

  setIsOpen: (isOpen) => set({ isOpen }),

  totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  
  totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
