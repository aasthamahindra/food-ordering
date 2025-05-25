import api from './api';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

interface MenuResponse {
  restaurant: {
    _id: string;
    name: string;
    cuisineType: string;
  };
  menuItems: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export const getMenuItems = async (
  restaurantId: string,
  params: {
    category?: string;
    isAvailable?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<MenuResponse> => {
  try {
    // Remove undefined parameters
    const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await api.get<{ data: MenuResponse }>(
      `/restaurants/${restaurantId}/menu`,
      { params: queryParams }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};
