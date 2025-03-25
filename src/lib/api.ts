import axios, { AxiosError } from 'axios';
import { 
  setAuthToken as setToken, 
  clearAuthToken as clearToken,
  getAuthToken
} from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Safe way to check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Function to set auth header from localStorage - only in browser environment
const setAuthHeader = () => {
  if (!isBrowser()) return;
  
  const tokenFromStorage = getAuthToken();
  if (tokenFromStorage) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
  }
};

// Run setAuthHeader on the client side only
if (isBrowser()) {
  // Run this in the next tick to avoid hydration issues
  setTimeout(() => {
    setAuthHeader();
  }, 0);
}

// Add a response interceptor to handle 401 errors - only in browser environment
if (isBrowser()) {
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Add more robust error handling
      if (error.response) {
        const status = error.response.status;
        const path = error.config?.url || 'unknown endpoint';
        
        console.error(`API Error: ${status} at ${path}`, error.response.data);
        
        // Handle authentication errors
        if (status === 401) {
          console.log('Authentication error - clearing token');
          clearToken();
          // Only redirect if we're in a browser context and not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            console.log('Redirecting to login page due to 401 error');
            window.location.href = '/login?error=session_expired';
          }
        }
        
        // Handle forbidden errors (no permission)
        if (status === 403) {
          console.log('Permission denied');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/')) {
            window.location.href = '/?error=permission_denied';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
}

export function setAuthToken(token: string): void {
  setToken(token);
  if (isBrowser()) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export function clearAuthToken(): void {
  clearToken();
  if (isBrowser()) {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export async function register(data: { email: string; password: string; name: string }) {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

export async function login(data: { email: string; password: string }) {
  try {
    console.log('Making login request to API');
    const response = await apiClient.post('/auth/login', data);
    console.log('Login API response received:', {
      status: response.status,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      userRole: response.data.user?.role
    });
    
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
}

export async function getProducts(params: { page?: number; limit?: number; categoryId?: number } = {}) {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function getProductById(id: number) {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}

// Unified addToCart function that works with both old and new formats
export async function addToCart(productIdOrData: number | { productId: number; quantity: number }, quantity = 1) {
  let data: { productId: number; quantity: number };
  
  if (typeof productIdOrData === 'object') {
    data = productIdOrData;
  } else {
    data = { productId: productIdOrData, quantity };
  }
  
  const response = await apiClient.post('/cart', data);
  return response.data;
}

export async function getCart() {
  const response = await apiClient.get('/cart');
  return response.data;
}

// Update cart item quantity
export async function updateCartItem(productId: number, quantity: number) {
  const response = await apiClient.put(`/cart/${productId}`, { quantity });
  return response.data;
}

// Remove item from cart
export async function removeFromCart(productId: number) {
  const response = await apiClient.delete(`/cart/${productId}`);
  return response.data;
}

// Unified createOrder function with complete parameter typing
export async function createOrder(data: { 
  items?: Array<{ productId: number; quantity: number; price: number }>; 
  address: string; 
  paymentMethod: string;
}) {
  // We will build the request body based on what's provided
  const requestBody: any = {
    address: data.address,
    paymentMethod: data.paymentMethod
  };
  
  // If items are provided explicitly, use them
  if (data.items) {
    requestBody.items = data.items;
  }
  
  const response = await apiClient.post('/orders', requestBody);
  return response.data;
}

export async function getOrders(params: { page?: number; limit?: number } = {}) {
  const response = await apiClient.get('/orders', { params });
  return response.data;
}

export async function getUserProfile() {
  try {
    console.log('Fetching user profile...');
    const response = await apiClient.get('/users/me');
    console.log('User profile fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function createProduct(data: FormData | { name: string; price: number; image: string; description?: string; categoryId?: number }) {
  let response;
  
  if (data instanceof FormData) {
    // If FormData, we're handling file upload
    response = await apiClient.post('/admin/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    // Legacy support for direct object
    response = await apiClient.post('/admin/products', data);
  }
  
  return response.data;
}

export async function updateProduct(id: number, data: Partial<{ name: string; price: number; image: string; description?: string; categoryId?: number }>) {
  const response = await apiClient.patch(`/admin/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number) {
  const response = await apiClient.delete(`/admin/products/${id}`);
  return response.data;
}

// Admin APIs
export async function getCategories() {
  const response = await apiClient.get('/categories');
  return response.data;
}

export async function createCategory(data: { name: string }) {
  const response = await apiClient.post('/admin/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: { name: string }) {
  const response = await apiClient.patch(`/admin/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number) {
  const response = await apiClient.delete(`/admin/categories/${id}`);
  return response.data;
}

export async function getAdminUsers() {
  const response = await apiClient.get('/admin/users');
  return response.data;
}

export async function updateUser(id: number, data: { isActive: boolean }) {
  const response = await apiClient.patch(`/admin/users/${id}`, data);
  return response.data;
}

export async function getAdminOrders(params: { page?: number; limit?: number } = {}) {
  const response = await apiClient.get('/admin/orders', { params });
  return response.data;
}

export async function updateOrder(id: number, data: { status?: string; paymentStatus?: string }) {
  const response = await apiClient.patch(`/admin/orders/${id}`, data);
  return response.data;
}

// Thêm hàm initiatePayment
export async function initiatePayment(data: { orderId: number, customerName: string, phone: string }) {
  try {
    // Trong trường hợp thực tế, bạn sẽ gọi API backend
    // const response = await apiClient.post('/payment/initiate', data);
    // return response.data;
    
    // Nhưng vì backend đang giả lập, chúng ta sẽ giả lập phản hồi thành công
    console.log("Initiating payment for order:", data.orderId);
    return { 
      success: true, 
      message: "Payment session created",
      paymentUrl: "/payment-simulation" // URL này sẽ được sử dụng trong môi trường thực
    };
  } catch (error) {
    console.error('Failed to initiate payment:', error);
    return { success: false, message: 'Failed to initiate payment' };
  }
}
// Thêm hàm processPayment nếu chưa có
export async function processPayment(data: { orderId: number, paymentStatus: string }) {
  try {
    // Trong trường hợp thực tế, bạn sẽ gọi API backend
    const response = await apiClient.post('/payment/process', {
      orderId: data.orderId,
      paymentData: { status: data.paymentStatus }
    });
    return response.data;
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, message: 'Payment processing failed' };
  }
}