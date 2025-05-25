import api from './api';

export type PaymentMethodType = 'card' | 'paypal';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  details: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvv?: string;
    paypalEmail?: string;
  };
  isDefault: boolean;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  method: string;
  orderId: string;
  createdAt: string;
}

export interface AddCardMethodPayload {
  type: 'card';
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
}

export interface AddPayPalMethodPayload {
  type: 'paypal';
  paypalEmail: string;
  isDefault: boolean;
}

type AddPaymentMethodPayload = AddCardMethodPayload | AddPayPalMethodPayload;

export const paymentService = {
  // Get all payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await api.get('/payments/methods');
      return response.data.data?.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add a new payment method
  addPaymentMethod: async (data: AddPaymentMethodPayload): Promise<PaymentMethod> => {
    try {
      let payload: any = {
        type: data.type,
        isDefault: data.isDefault || false,
        details: {}
      };
      
      if (data.type === 'card') {
        // Format card payload
        const { type, isDefault = false, ...cardDetails } = data;
        payload.isDefault = isDefault;
        payload.type = type;
        payload.details = {
          ...cardDetails
        };
      } else {
        // Format PayPal payload
        const { type, isDefault = false, paypalEmail } = data;
        payload.isDefault = isDefault;
        payload.type = type;
        payload.details = {
          paypalEmail
        };
      }
      
      console.log('Sending payload to server:', JSON.stringify(payload, null, 2));
      try {
        const response = await api.post('/payments/methods', payload);
        console.log('Server response:', response.data);
        return response.data.data;
      } catch (error: any) {
        console.error('Full error response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        throw error;
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Update a payment method
  updatePaymentMethod: async (
    id: string,
    data: Partial<PaymentMethod>
  ): Promise<PaymentMethod> => {
    try {
      const response = await api.put(`/payments/methods/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete a payment method
  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`/payments/methods/${id}`);
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await api.patch(`/payments/methods/${id}/default`);
    return response.data;
  },

  // Process payment
  processPayment: async (data: {
    orderId: string;
    paymentMethodId: string;
    amount: number;
  }): Promise<{ success: boolean; transactionId: string }> => {
    const response = await api.post('/payments/process', data);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (params: {
    page?: number;
    limit?: number;
  }): Promise<{ data: PaymentHistory[]; total: number }> => {
    const response = await api.get('/payments/history', { params });
    return response.data;
  },
};

export default paymentService;
