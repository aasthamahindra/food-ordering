import { createContext, useContext, useReducer, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { PaymentMethod, MenuItem } from '../types';
import { paymentService } from '../services/paymentService';

interface CartItemType extends Omit<MenuItem, '_id' | 'price'> {
  _id: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItemType[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  restaurantId: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; restaurantId: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PAYMENT_METHODS'; paymentMethods: PaymentMethod[] }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

interface CartContextType extends Omit<CartState, 'isLoading' | 'error'> {
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  fetchPaymentMethods: () => Promise<void>;
  setSelectedPaymentMethod: (id: string) => void;
  selectedPaymentMethod: string | null;
  totalItems: number;
  totalPrice: number;
  isCartEmpty: boolean;
  paymentMethods: PaymentMethod[];
  restaurantId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurantId } = action.payload;
      
      // If adding an item from a different restaurant, clear the cart first
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return {
          items: [{ ...item, quantity: 1 }],
          paymentMethods: state.paymentMethods,
          isLoading: state.isLoading,
          error: state.error,
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
        paymentMethods: state.paymentMethods,
        isLoading: state.isLoading,
        error: state.error,
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
      return { 
        items: [], 
        paymentMethods: state.paymentMethods, 
        isLoading: state.isLoading, 
        error: state.error, 
        restaurantId: null 
      };
      
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.paymentMethods };

    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [],
    paymentMethods: [],
    isLoading: false,
    error: null,
    restaurantId: null
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const lastFetchTime = useRef(0);
  const isFetching = useRef(false);

  const fetchPaymentMethods = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    // Don't fetch if we're already fetching or if we've fetched recently (unless forced)
    if ((isFetching.current || (timeSinceLastFetch < 30000 && !force)) && state.paymentMethods.length > 0) {
      return;
    }

    isFetching.current = true;
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    
    try {
      const methods = await paymentService.getPaymentMethods();
      lastFetchTime.current = Date.now();
      
      // Map the payment methods to match the expected type
      const formattedMethods = methods.map(method => ({
        ...method,
        details: {
          ...method.details,
          isDefault: method.isDefault || false,
          nameOnCard: (method.details as any).cardHolderName || ''
        }
      }));
      
      dispatch({ type: 'SET_PAYMENT_METHODS', paymentMethods: formattedMethods });
      
      // Auto-select the first method if none is selected
      if (!selectedPaymentMethod && formattedMethods.length > 0) {
        const defaultMethod = formattedMethods.find(m => m.isDefault) || formattedMethods[0];
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      // Only show error if we don't have any cached methods
      if (state.paymentMethods.length === 0) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load payment methods. Please try again later.' });
      }
    } finally {
      isFetching.current = false;
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [state.paymentMethods, selectedPaymentMethod]);

  // Calculate cart metrics
  const cartTotal = state.items.reduce((total: number, item: CartItemType) => {
    return total + (item.price * item.quantity);
  }, 0);

  const itemCount = state.items.reduce((count: number, item: CartItemType) => {
    return count + item.quantity;
  }, 0);

  const totalPrice = cartTotal;
  const totalItems = itemCount;
  const isCartEmpty = state.items.length === 0;

  // Cart actions
  const addItem = useCallback((item: MenuItem, restaurantId: string) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { item, restaurantId }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { itemId }
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { itemId, quantity }
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Load payment methods when component mounts
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        restaurantId: state.restaurantId
      }));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items, state.restaurantId]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          clearCart();
          parsedCart.items.forEach((item: CartItemType) => {
            if (item._id && parsedCart.restaurantId) {
              addItem(item, parsedCart.restaurantId);
            }
          });
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage', error);
      }
    }
  }, [addItem, clearCart]);

  const contextValue = {
    items: state.items,
    paymentMethods: state.paymentMethods,
    restaurantId: state.restaurantId,
    cartTotal,
    itemCount,
    totalPrice,
    totalItems,
    isCartEmpty,
    isLoading: state.isLoading,
    error: state.error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    fetchPaymentMethods,
    setSelectedPaymentMethod,
    selectedPaymentMethod,
  };

  // Update document title with cart item count
  useEffect(() => {
    document.title = totalItems > 0 ? `(${totalItems}) Food Ordering App` : 'Food Ordering App';
  }, [totalItems]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
