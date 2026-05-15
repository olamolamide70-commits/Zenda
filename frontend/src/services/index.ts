import api from './api';
import { Product, CartItem } from '@/types';

export const productService = {
  getAll: (params?: Record<string, string>) => api.get<Product[]>('/products').then(res => res.data),
  getById: (id: string) => api.get<Product>(`/products/${id}`).then(res => res.data),
  create: (data: Partial<Product>) => api.post<Product>('/products', data).then(res => res.data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/products/${id}`).then(res => res.data),
};

export const authService = {
  login: (data: { email: string; password?: string }) => api.post('/auth/login', data).then(res => res.data),
  register: (data: { name: string; email: string; password?: string }) => api.post('/auth/signup', data).then(res => res.data),
  getProfile: () => api.get('/auth/profile').then(res => res.data),
  updateProfile: (data: { name?: string; card_design?: string; is_card_active?: boolean }) => api.put('/auth/profile', data).then(res => res.data),
  activateCard: () => api.post('/auth/activate-card').then(res => res.data),
};

export const orderService = {
  getAll: () => api.get('/orders').then(res => res.data),
  getById: (id: string) => api.get(`/orders/${id}`).then(res => res.data),
  create: (data: any) => api.post('/orders', data).then(res => res.data),
  getStats: () => api.get('/orders/stats').then(res => res.data),
  requestDeliveryCode: (orderId: string) => api.post('/orders/delivery-code', { orderId }).then(res => res.data),
  confirmDelivery: (orderId: string, otp: string) => api.post('/orders/confirm-delivery', { orderId, otp }).then(res => res.data),
};

export const installmentService = {
  getAll: () => api.get('/installments').then(res => ({ ...res, data: res.data || [] })),
  getById: (id: string) => api.get(`/installments/${id}`).then(res => res.data),
  calculate: (params: any) => api.post('/installments/calculate', params).then(res => res.data),
  create: (data: any) => api.post('/installments/create', data).then(res => res.data),
  autoDebit: (data: any) => api.post('/installments/auto-debit', data).then(res => res.data),
};

export const insuranceService = {
  getPlans: () => api.get('/insurance/plans').then(res => res.data),
};

export const paymentService = {
  getHistory: () => api.get('/transactions/history').then(res => res.data),
  getCards: () => api.get('/transactions/cards').then(res => res.data),
  getReceipts: () => api.get('/payments/receipts').then(res => res.data),
  addCard: (data: any) => api.post('/payments/cards', data).then(res => res.data),
  removeCard: (id: string) => api.delete(`/payments/cards/${id}`).then(res => res.data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then(res => res.data),
  getUsers: () => api.get('/admin/users').then(res => res.data),
  getAnalytics: () => api.get('/admin/analytics').then(res => res.data),
};

export const wishlistService = {
  get: () => api.get<Product[]>('/wishlist').then(res => res.data),
  add: (productId: string) => api.post('/wishlist/add', { productId }).then(res => res.data),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`).then(res => res.data),
};

export const cartService = {
  get: () => api.get<CartItem[]>('/cart').then(res => res.data),
  sync: (productId: string, quantity: number) => api.post('/cart/add', { productId, quantity }).then(res => res.data),
  remove: (productId: string) => api.delete(`/cart/${productId}`).then(res => res.data),
};

export const vendorService = {
  register: () => api.post('/vendor/register').then(res => res.data),
  getProducts: () => api.get('/vendor/products').then(res => res.data),
  getStats: () => api.get('/vendor/stats').then(res => res.data),
  getSalesHistory: () => api.get('/vendor/sales-history').then(res => res.data),
};
 
export const notificationService = {
  getAll: () => api.get('/notifications').then(res => res.data),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`).then(res => res.data),
};

export * from './referralService';
