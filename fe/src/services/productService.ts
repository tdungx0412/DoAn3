import api from './api';
import { Product, ApiResponse } from '../types';

export const productService = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { 
      params: { status: 'active', ...params } 
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },
};