export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  role: 'admin' | 'manager' | 'team_member';
  country: 'india' | 'america';
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisineType: string;
  address: string;
  city: string;
  country: 'india' | 'america';
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  restaurantId: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethodId?: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethodType = 'credit_card' | 'paypal' | 'card';

export interface BasePaymentMethodDetails {
  isDefault: boolean;
  nameOnCard?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  email?: string;
}

export interface PaymentMethod {
  _id: string;
  userId: string;
  type: PaymentMethodType;
  details: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvv?: string;
    paypalEmail?: string;
    email?: string;
  };
  cardHolderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  paypalEmail?: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export type UserRole = 'admin' | 'manager' | 'team_member';
export type Country = 'india' | 'america';

export interface PaymentHistory {
  id: string;
  orderId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: {
    id: string;
    type: string;
    details: {
      cardNumber?: string;
      expiryDate?: string;
      nameOnCard?: string;
      isDefault: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}
