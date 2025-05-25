import api from './api';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  items: OrderItem[];
  totalAmount: number;
  shippingInfo: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    saveInfo: boolean;
  };
  paymentMethodId: string;
}

export interface PaymentData {
  orderId: string;
  amount: number;
  paymentMethodId: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

export const orderService = {
  createOrder: async (data: OrderData) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  processPayment: async (data: PaymentData) => {
    const response = await api.post('/payments/process', data);
    return response.data as PaymentResult;
  }
};
