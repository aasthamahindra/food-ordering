import React, { createContext, useContext, useReducer, type ReactNode, useEffect } from 'react';
import type { MenuItem } from '../types';

interface CartItem extends MenuItem {
  quantity: number;
}

type CartState = {
  items: CartItem[];
  restaurantId: string | null;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; restaurantId: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

export interface CartContextType extends CartState {
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartEmpty: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurantId } = action.payload;
      
      // If adding an item from a different restaurant, clear the cart first
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return {
          items: [{ ...item, quantity: 1 }],
          restaurantId,
        };
      }

      const existingItemIndex = state.items.findIndex((i) => i._id === item._id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
        restaurantId: restaurantId,
      };
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload.itemId),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item._id !== itemId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return { items: [], restaurantId: null };
      
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], restaurantId: null });

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          dispatch({ type: 'CLEAR_CART' });
          parsedCart.items.forEach((item: CartItem) => {
            if (item._id && parsedCart.restaurantId) {
              dispatch({
                type: 'ADD_ITEM',
                payload: { item, restaurantId: parsedCart.restaurantId },
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state]);

  const addItem = (item: MenuItem, restaurantId: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, restaurantId } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const isCartEmpty = state.items.length === 0;

  const value = {
    items: state.items,
    restaurantId: state.restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartEmpty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
