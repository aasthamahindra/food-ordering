import api from './api';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  saveInfo: boolean;
}

export interface OrderData {
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress: string;
  notes?: string;
}

export interface OrderResponse {
  _id: string;
  orderNumber?: string;
  items: Array<OrderItem & { _id: string }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingInfo: ShippingInfo;
  paymentMethodId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentData {
  orderId: string;
  amount: number;
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  orderId: string;
  status: string;
  amount: number;
  payment?: {
    success: boolean;
    transactionId?: string;
    status: string;
    error?: {
      code: string;
      message: string;
    };
  };
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const orderService = {
  /**
   * Create a new order
   */
  createOrder: async (data: OrderData): Promise<OrderResponse> => {
    try {
      console.log('Sending order data:', JSON.stringify(data, null, 2));
      const response = await api.post<{ data: { order: OrderResponse } }>('/orders', data);
      return response.data.data.order;
    } catch (error: any) {
      console.error('Error creating order:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        errorMessage = 'Validation error: ' + validationErrors
          .map((err: any) => {
            const field = err.instancePath ? err.instancePath.slice(1) : 'field';
            return `${field} ${err.message}`;
          })
          .join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Process payment for an order
   */
  processPayment: async (data: PaymentData): Promise<PaymentResult> => {
    try {
      console.log('Processing payment with data:', JSON.stringify(data, null, 2));
      const response = await api.post<{ data: PaymentResult }>('/payments/process', data);
      console.log('Payment processed successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error processing payment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Payment processing failed. Please try again.';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        errorMessage = 'Payment validation error: ' + validationErrors
          .map((err: any) => {
            const field = err.instancePath ? err.instancePath.slice(1) : 'field';
            return `${field} ${err.message}`;
          })
          .join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response = await api.get<{ data: { order: OrderResponse } }>(`/orders/${orderId}`);
      return response.data.data.order;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch order. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get user's order history
   */
  getOrderHistory: async (): Promise<OrderResponse[]> => {
    try {
      const response = await api.get<{ data: { orders: OrderResponse[] } }>('/orders');
      return response.data.data.orders;
    } catch (error: any) {
      console.error('Error fetching order history:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch order history.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { success: boolean; message: string } }>(`/orders/${orderId}/cancel`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order.';
      throw new Error(errorMessage);
    }
  }
};
