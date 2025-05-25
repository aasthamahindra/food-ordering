import api from './api';
import type { PaymentMethod, PaymentHistory } from '../types';

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<{ data: PaymentMethod[] }>('/payments/methods');
  return response.data.data;
};

export const addPaymentMethod = async (data: {
  type: string;
  cardNumber: string;
  expiryDate: string;
  nameOnCard: string;
  isDefault?: boolean;
}): Promise<PaymentMethod> => {
  const response = await api.post<{ data: { paymentMethod: PaymentMethod } }>('/payments/methods', {
    type: data.type,
    details: {
      cardNumber: data.cardNumber,
      expiryDate: data.expiryDate,
      nameOnCard: data.nameOnCard,
      isDefault: data.isDefault || false
    }
  });
  return response.data.data.paymentMethod;
};

export const updatePaymentMethod = async (
  id: string,
  data: Partial<PaymentMethod>
): Promise<PaymentMethod> => {
  const response = await api.put<{ data: { paymentMethod: PaymentMethod } }>(
    `/payments/methods/${id}`,
    data
  );
  return response.data.data.paymentMethod;
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await api.delete(`/payments/methods/${id}`);
};

export const setDefaultPaymentMethod = async (id: string): Promise<PaymentMethod> => {
  const response = await api.patch<{ data: { paymentMethod: PaymentMethod } }>(
    `/payments/methods/${id}/default`
  );
  return response.data.data.paymentMethod;
};

export const processPayment = async (data: {
  orderId: string;
  paymentMethodId: string;
  amount: number;
}): Promise<{ success: boolean; transactionId?: string }> => {
  const response = await api.post<{ data: { success: boolean; transactionId?: string } }>(
    '/payments/process',
    data
  );
  return response.data.data;
};

export const getPaymentHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: PaymentHistory[]; pagination: { totalCount: number } }> => {
  const response = await api.get<{ 
    data: PaymentHistory[]; 
    pagination: { totalCount: number; page: number; limit: number; totalPages: number } 
  }>('/payments/history', { params });
  
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};
