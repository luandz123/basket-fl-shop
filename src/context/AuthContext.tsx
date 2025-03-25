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

// Define the Auth Context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
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
  loading: true,
  error: null,
  isAdmin: false,
  isAuthenticated: false
});

// Create the Auth Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
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
          // If API call fails, clear token
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
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Clear token from API headers
    clearAuthToken();
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Redirect to login page
    router.push('/login');
  };

  // Compute derived values
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  // Return provider with value
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
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

// Create a custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};