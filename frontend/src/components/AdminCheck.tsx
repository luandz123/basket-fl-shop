'use client';

import { useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { getDecodedToken, isAdmin as checkIsAdmin } from '@/lib/auth';

export default function AdminCheck() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.group('Admin Authentication Check');
    console.log('User from context:', user);
    console.log('User role from context:', user?.role);
    console.log('isAdmin from context:', isAdmin);
    
    const token = localStorage.getItem('authToken');
    console.log('Token exists:', !!token);
    
    if (token) {
      const decoded = getDecodedToken();
      console.log('Token decode result:', decoded);
      console.log('Role from token:', decoded?.role);
      console.log('isAdmin utility check:', checkIsAdmin());
    }
    console.groupEnd();
  }, [user, isAdmin]);

  // Hidden component, just for debugging
  return null;
}
