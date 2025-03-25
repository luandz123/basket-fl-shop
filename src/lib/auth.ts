// Authentication utility functions 
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: number;
  email: string;
  role?: string;
  exp: number;
  iat: number;
}

// Safe check for browser environment that avoids hydration mismatches
const isBrowser = typeof window !== 'undefined';

export const setAuthToken = (token: string) => {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const getAuthToken = () => {
  if (!isBrowser) return null;
  
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const clearAuthToken = () => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export const isTokenValid = (): boolean => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      clearAuthToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    clearAuthToken();
    return false;
  }
};

export const getUserFromToken = (): { id: number; email: string; role?: string } | null => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    
    const decoded = jwtDecode<DecodedToken>(token);
    
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};
