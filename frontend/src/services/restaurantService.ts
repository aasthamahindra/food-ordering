import api from './api';

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisineType: string;
  address: string;
  country: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems?: MenuItem[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface RestaurantsResponse {
  restaurants: Restaurant[];
  pagination: PaginationInfo;
}

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  try {
    const response = await api.get<ApiResponse<{ restaurant: Restaurant }>>(`/restaurants/${id}`);
    return response.data.data.restaurant;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

interface GetRestaurantsParams {
  search?: string;
  cuisineType?: string;
  country?: string;
  page?: number;
  limit?: number;
}

export const getRestaurants = async (params: GetRestaurantsParams = {}): Promise<RestaurantsResponse> => {
  try {
    // Remove undefined or empty string parameters
    const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await api.get<ApiResponse<RestaurantsResponse>>('/restaurants', { 
      params: queryParams 
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};
