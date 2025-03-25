'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, addToCart } from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string;
  description?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price : numPrice.toFixed(2);
    }
    return price.toFixed(2);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const productData = await getProductById(Number(id));
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setShowCartNotification(true);
      
      setTimeout(() => {
        setShowCartNotification(false);
      }, 5000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add product to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      router.push('/checkout');
    } catch (error) {
      console.error('Error buying now:', error);
      setError('Failed to process buy now request.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Product not found.'}
        </div>
        <div className="mt-4">
          <Link href="/products" className="text-blue-500 hover:underline">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Notification when product is added to cart */}
      {showCartNotification && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 max-w-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>
                <b>{product.name}</b> added to cart!
              </span>
            </div>
            <button 
              onClick={() => setShowCartNotification(false)}
              className="text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
          <div className="flex justify-between mt-3">
            <Link 
              href="/cart" 
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              View Cart
            </Link>
            <button 
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              onClick={() => setShowCartNotification(false)}  
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <ol className="flex items-center space-x-1">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link href="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
          </li>
          <li className="text-gray-500">/</li>
          {product.category && (
            <>
              <li>
                <Link 
                  href={`/products?category=${product.category.id}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {product.category.name}
                </Link>
              </li>
              <li className="text-gray-500">/</li>
            </>
          )}
          <li className="text-gray-900 font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product image */}
          <div className="md:w-1/2">
            <div className="h-96 overflow-hidden">
              <SafeImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Product info */}
          <div className="p-8 md:w-1/2">
            <div className="mb-2">
              {product.category && (
                <Link 
                  href={`/products?category=${product.category.id}`}
                  className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                >
                  {product.category.name}
                </Link>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl text-green-600 font-semibold mb-4">${formatPrice(product.price)}</p>
            
            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
            
            {/* Quantity selector */}
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center">
                <button 
                  className="bg-gray-200 px-3 py-1 rounded-l"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 text-center border-t border-b border-gray-300 py-1"
                  min="1"
                />
                <button 
                  className="bg-gray-200 px-3 py-1 rounded-r"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to cart and buy now buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="bg-white border border-green-500 text-green-500 px-6 py-2 rounded-md hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex-1"
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isAdding}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex-1"
              >
                Buy Now
              </button>
            </div>
            
            {/* Shipping information */}
            <div className="mt-8 border-t pt-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-1-1h-1.05A2.5 2.5 0 0016 1.95V1a1 1 0 00-1-1H5a1 1 0 00-1 1v.95A2.5 2.5 0 001.05 4H1zm14 8h-3.05a2.5 2.5 0 00-4.9 0H3V5h1.05a2.5 2.5 0 004.9 0H15v7z"/>
                </svg>
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">30 Days Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}