import api from './api';
import type { Order, PaymentMethod } from '../types';

export const createOrder = async (orderData: {
  restaurantId: string;
  items: Array<{ menuItemId: string; quantity: number; name: string; price: number }>;
  deliveryAddress: string;
  paymentMethodId?: string;
}) => {
  const response = await api.post<{ data: { order: Order } }>('/orders', orderData);
  return response.data.data.order;
};

export const getOrders = async (params?: { 
  page?: number; 
  limit?: number; 
  status?: string 
}) => {
  const response = await api.get<{ 
    success: boolean;
    data: {
      orders: Order[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
      };
    };
  }>('/orders', { params });
  
  return response.data.data;
};

export const getOrderById = async (orderId: string) => {
  const response = await api.get<{ data: { order: Order } }>(`/orders/${orderId}`);
  return response.data.data.order;
};

export const cancelOrder = async (orderId: string) => {
  const response = await api.patch<{ data: { order: Order } }>(`/orders/${orderId}/cancel`);
  return response.data.data.order;
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<{ data: PaymentMethod[] }>('/payments/methods');
  return response.data.data;
};

export const addPaymentMethod = async (paymentMethod: {
  type: string;
  cardNumber: string;
  expiryDate: string;
  nameOnCard: string;
  isDefault?: boolean;
}): Promise<PaymentMethod> => {
  const response = await api.post<{ data: { paymentMethod: PaymentMethod } }>('/payments/methods', {
    ...paymentMethod,
    details: {
      cardNumber: paymentMethod.cardNumber,
      expiryDate: paymentMethod.expiryDate,
      nameOnCard: paymentMethod.nameOnCard,
      isDefault: paymentMethod.isDefault || false
    }
  });
  return response.data.data.paymentMethod;
};

export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
  const response = await api.patch<{ data: { paymentMethod: PaymentMethod } }>(
    `/payments/methods/${paymentMethodId}/default`
  );
  return response.data.data.paymentMethod;
};

export const removePaymentMethod = async (paymentMethodId: string) => {
  await api.delete(`/payments/methods/${paymentMethodId}`);
};
