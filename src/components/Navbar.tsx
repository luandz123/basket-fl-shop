'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();

  // Only interact with auth after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initial render should always match NavbarPlaceholder's structure exactly
  if (!isMounted) {
    return (
      <div className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Flower Shop</div>
          <div className="space-x-4">
            <span>Products</span>
            <span>Login</span>
            <span>Register</span>
          </div>
        </div>
      </div>
    );
  }

  // After mount, we can access auth safely
  const { user, isAdmin, logout, loading } = auth;

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Flower Shop</Link>
        <div className="space-x-4">
          <Link href="/products" className="hover:text-green-300">Products</Link>
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Link href="/cart" className="hover:text-green-300">Cart</Link>
              <Link href="/orders" className="hover:text-green-300">Orders</Link>
              {isAdmin && (
                <div className="inline-block">
                  <Link 
                    href="/admin/users" 
                    className="bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded mr-2"
                  >
                    Users
                  </Link>
                  <Link 
                    href="/admin/products" 
                    className="bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded mr-2"
                  >
                    Products
                  </Link>
                  <Link 
                    href="/admin/categories" 
                    className="bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded mr-2"
                  >
                    Categories
                  </Link>
                  <Link 
                    href="/admin/orders" 
                    className="bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded"
                  >
                    Orders
                  </Link>
                </div>
              )}
              <button 
                onClick={logout} 
                className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded ml-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-green-300">Login</Link>
              <Link href="/register" className="hover:text-green-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;