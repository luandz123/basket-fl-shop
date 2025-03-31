'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, register as registerApi } from '@/lib/api';

// New getCurrentUser using localStorage
const getCurrentUser = async () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: unknown;
  isAdmin: boolean;
  loading: boolean;
  login: (userData: unknown) => void;
  logout: () => void;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  registerUser: (userData: { email: string; password: string; name: string }) => Promise<void>;
  loginUser: (credentials: { email: string; password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<unknown>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAdmin((userData as User)?.role === 'admin');
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: unknown) => {
    setUser(userData);
    setIsAdmin((userData as User)?.role === 'admin');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Update this method to redirect admins to admin page
  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      const response = await loginApi(credentials);
      login(response.user);
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        router.push('/admin/orders'); // Or any default admin page
      } else {
        router.push('/');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginUser = async (credentials: { email: string; password: string }) => {
    return signIn(credentials);
  };

  const registerUser = async (userData: { email: string; password: string; name: string }) => {
    try {
      const response = await registerApi(userData);
      login(response.user);
      router.push('/');
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAdmin,
    loading,
    login,
    logout,
    signIn,
    loginUser,
    registerUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
