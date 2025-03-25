'use client';

import React from 'react';
import { AuthProvider as ContextAuthProvider } from '@/context/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <ContextAuthProvider>
      {children}
    </ContextAuthProvider>
  );
};

export default AuthProvider;