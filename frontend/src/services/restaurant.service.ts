import api from './api';
import type { Restaurant, MenuItem, PaginatedResponse } from '../types';

export const getRestaurants = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  cuisineType?: string;
  country?: string;
}) => {
  const response = await api.get<{ data: PaginatedResponse<Restaurant> }>('/restaurants', { params });
  return response.data.data;
};

export const getRestaurantById = async (id: string) => {
  const response = await api.get<{ data: { restaurant: Restaurant } }>(`/restaurants/${id}`);
  return response.data.data.restaurant;
};

export const getMenuItems = async (restaurantId: string, params?: { page?: number; limit?: number }) => {
  const response = await api.get<{ data: PaginatedResponse<MenuItem> }>(
    `/restaurants/${restaurantId}/menu`,
    { params }
  );
  return response.data.data;
};

export const getMenuCategories = async (restaurantId: string) => {
  const response = await api.get<{ data: string[] }>(`/restaurants/${restaurantId}/categories`);
  return response.data.data;
};
