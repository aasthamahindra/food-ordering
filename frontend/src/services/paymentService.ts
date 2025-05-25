import api from './api';
import type { PaymentMethod as SharedPaymentMethod, PaymentHistory as SharedPaymentHistory } from '../types';

export type PaymentMethodType = 'card' | 'paypal';

// Re-export shared types
export type PaymentMethod = SharedPaymentMethod;

export interface PaymentHistory extends Omit<SharedPaymentHistory, 'paymentMethod'> {
  method: string;
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
      const methods = response.data.data?.paymentMethods || [];
      
      // Transform the API response to match our PaymentMethod type
      return methods.map((method: any) => ({
        _id: method._id,
        userId: method.userId,
        type: method.type,
        details: {
          cardNumber: method.cardNumber,
          cardHolderName: method.cardHolderName,
          expiryDate: method.expiryDate,
          cvv: method.cvv,
          paypalEmail: method.paypalEmail,
          email: method.email
        },
        cardHolderName: method.cardHolderName,
        cardNumber: method.cardNumber,
        expiryDate: method.expiryDate,
        paypalEmail: method.paypalEmail,
        last4: method.last4,
        brand: method.brand,
        expMonth: method.expMonth,
        expYear: method.expYear,
        isDefault: method.isDefault,
        createdAt: method.createdAt,
        updatedAt: method.updatedAt
      }));
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
        isDefault: data.isDefault || false
      };
      
      if (data.type === 'card') {
        // Format card payload
        const { type, isDefault = false, ...cardDetails } = data;
        payload = {
          ...payload,
          ...cardDetails,
          cardHolderName: data.cardHolderName,
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv
        };
      } else {
        // Format PayPal payload
        const { paypalEmail } = data as AddPayPalMethodPayload;
        payload = {
          ...payload,
          paypalEmail
        };
      }
      
      console.log('Sending payload to server:', JSON.stringify(payload, null, 2));
      try {
        const response = await api.post('/payments/methods', payload);
        console.log('Server response:', response.data);
        const method = response.data.data?.paymentMethod || response.data.data;
        
        if (!method) {
          throw new Error('Invalid response from server');
        }
        
        // Transform the response to match our PaymentMethod type
        return {
          _id: method._id,
          userId: method.userId,
          type: method.type,
          details: {
            cardNumber: method.cardNumber,
            cardHolderName: method.cardHolderName,
            expiryDate: method.expiryDate,
            cvv: method.cvv,
            paypalEmail: method.paypalEmail,
            email: method.email
          },
          cardHolderName: method.cardHolderName,
          cardNumber: method.cardNumber,
          expiryDate: method.expiryDate,
          paypalEmail: method.paypalEmail,
          last4: method.last4,
          brand: method.brand,
          expMonth: method.expMonth,
          expYear: method.expYear,
          isDefault: method.isDefault,
          createdAt: method.createdAt,
          updatedAt: method.updatedAt
        };
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
  updatePaymentMethod: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    try {
      const response = await api.put(`/payments/methods/${id}`, data);
      const method = response.data.data?.paymentMethod || response.data.data;
      
      if (!method) {
        throw new Error('Invalid response from server');
      }
      
      return {
        _id: method._id,
        userId: method.userId,
        type: method.type,
        details: {
          cardNumber: method.cardNumber,
          cardHolderName: method.cardHolderName,
          expiryDate: method.expiryDate,
          cvv: method.cvv,
          paypalEmail: method.paypalEmail,
          email: method.email
        },
        cardHolderName: method.cardHolderName,
        cardNumber: method.cardNumber,
        expiryDate: method.expiryDate,
        paypalEmail: method.paypalEmail,
        last4: method.last4,
        brand: method.brand,
        expMonth: method.expMonth,
        expYear: method.expYear,
        isDefault: method.isDefault,
        createdAt: method.createdAt,
        updatedAt: method.updatedAt
      };
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete a payment method
  deletePaymentMethod: async (id: string): Promise<void> => {
    try {
      await api.delete(`/payments/methods/${id}`);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    try {
      const response = await api.patch(`/payments/methods/${id}/default`);
      const method = response.data.data?.paymentMethod || response.data.data;
      
      if (!method) {
        throw new Error('Invalid response from server');
      }
      
      return {
        _id: method._id,
        userId: method.userId,
        type: method.type,
        details: {
          cardNumber: method.cardNumber,
          cardHolderName: method.cardHolderName,
          expiryDate: method.expiryDate,
          cvv: method.cvv,
          paypalEmail: method.paypalEmail,
          email: method.email
        },
        cardHolderName: method.cardHolderName,
        cardNumber: method.cardNumber,
        expiryDate: method.expiryDate,
        paypalEmail: method.paypalEmail,
        last4: method.last4,
        brand: method.brand,
        expMonth: method.expMonth,
        expYear: method.expYear,
        isDefault: method.isDefault,
        createdAt: method.createdAt,
        updatedAt: method.updatedAt
      };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  // Process payment
  processPayment: async (data: {
    orderId: string;
    paymentMethodId: string;
    amount: number;
  }): Promise<{ success: boolean; transactionId: string }> => {
    try {
      const response = await api.post('/payments/process', data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: PaymentHistory[]; total: number }> => {
    try {
      const response = await api.get('/payments/history', { params });
      const responseData = response.data.data || response.data;
      
      // Transform the API response to match our PaymentHistory type
      const data = Array.isArray(responseData.data) 
        ? responseData.data.map((item: any) => ({
            id: item._id || item.id,
            amount: item.amount,
            status: item.status,
            method: item.method || (item.paymentMethod ? item.paymentMethod.type : 'unknown'),
            orderId: item.orderId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }))
        : [];
      
      return {
        data,
        total: responseData.total || data.length
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },
};

export default paymentService;
