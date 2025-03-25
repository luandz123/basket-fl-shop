'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login as loginApi } from '@/lib/api';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for error message in URL query params
  useEffect(() => {
    const errorMsg = searchParams ? searchParams.get('error') : null;
    if (errorMsg === 'session_expired') {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('Already logged in - Auth provider will handle redirection');
      router.push('/'); // Redirect to home page if already logged in
    }
  }, [user, loading, router]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      console.log('Submitting login form:', data.email);
      // First authenticate with the backend
      const response = await loginApi(data);
      
      // If successful, use the token to update auth context
      if (response && response.token) {
        // Pass the token to the login function from AuthContext
        login(response.token);
        router.push('/'); // Redirect to home page after successful login
      } else {
        throw new Error('Login response did not contain a token');
      }
    } catch (error: any) {
      console.error('Login submission error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // If already logged in, don't show the form
  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border rounded"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border rounded"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}