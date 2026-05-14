import api from './api';

export const orderService = {
  createOrder: async (orderData: any) => {
    console.log('📡 Gửi request tới API:', orderData);
    const response = await api.post('/orders', orderData);
    console.log('📥 Nhận phản hồi:', response.data);
    return response.data;
  },
};