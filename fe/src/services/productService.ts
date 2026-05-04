import api from './api';
import { Product, ApiResponse } from '../types';

export const productService = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.post<ApiResponse<Product>>('/products', product);
    return response.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  },
};