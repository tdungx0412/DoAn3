export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  role_id?: number;
  status?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  category_id?: number;
  brand_id?: number;
  sku?: string;
  stock_quantity?: number;
  warranty_months?: number;
  capacity?: string;
  power_consumption?: string;
  energy_rating?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  main_image?: string;
  images?: string | string[];
  is_featured?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}