'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, setAuthToken, clearAuthToken } from '@/lib/api';

// Define the user type
export interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
}

// Define the Auth Context type – thêm registerUser
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  registerUser: (data: { name: string; email: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// Create the Auth Context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  registerUser: async () => {},
  loading: true,
  error: null,
  isAdmin: false,
  isAuthenticated: false,
});

// Create the Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for token in localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only run in the browser
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setLoading(false);
          return;
        }

        // Set token in state
        setToken(storedToken);
        
        // Try to fetch user data
        try {
          const userData = await getUserProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function that takes a token and updates state
  const login = (newToken: string) => {
    if (!newToken) {
      console.error('No token provided to login function');
      return;
    }
    
    // Set token in localStorage
    localStorage.setItem('token', newToken);
    
    // Set token in API headers
    setAuthToken(newToken);
    
    // Set token in state
    setToken(newToken);
    
    // Fetch user data
    getUserProfile()
      .then(userData => {
        setUser(userData);
      })
      .catch(err => {
        console.error('Failed to fetch user after login:', err);
        setError('Failed to load user profile');
      });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    clearAuthToken();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // Thêm registerUser – ví dụ gọi API đăng ký (giả lập)
  const registerUser = async (data: { name: string; email: string; password: string }) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    const result = await response.json();
    if (result.token) {
      login(result.token);
    }
  };

  // Compute derived values
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
        registerUser,
        loading, 
        error, 
        isAdmin, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};