import { Category } from '../types';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Tủ lạnh', slug: 'tu-lanh' },
  { id: 2, name: 'Máy lạnh', slug: 'may-lanh' },
  { id: 3, name: 'Máy giặt', slug: 'may-giat' },
  { id: 4, name: 'Tủ đông', slug: 'tu-dong' },
  { id: 5, name: 'Quạt & Điều hòa', slug: 'quat-dieu-hoa' },
  { id: 6, name: 'Máy lọc không khí', slug: 'may-loc-khong-khi' },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price);
};