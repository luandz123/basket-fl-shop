'use client';

import React, { useState, useEffect, useRef } from 'react';
import useAuth from '@/hooks/useAuth';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import SafeImage from '@/components/SafeImage';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  price: number;
  description?: string;
  categoryId: number;
}

export default function AdminProductsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);      
      try {
        const productsData = await getProducts({ page: 1, limit: 100 });
        if (productsData && productsData.data) {
          setProducts(productsData.data);
        } else if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          setProducts([]);
          setError('Failed to parse products data');
        }
        
        const categoriesData = await getCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Hàm xử lý khi submit form (cho thêm mới hoặc sửa)
  const onSubmit = async (data: FormData) => {
    // Nếu đang thêm mới, yêu cầu phải chọn hình
    if (!editingProduct && !selectedImage) {
      alert('Please select an image for the product');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // Nếu đang sửa, tạo FormData cho updateProduct
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        formData.append('categoryId', data.categoryId.toString());
        if (data.description) {
          formData.append('description', data.description);
        }
        if (selectedImage) {
          formData.append('file', selectedImage);
        }
        await updateProduct(editingProduct.id, {
          name: data.name,
          price: data.price,
          categoryId: data.categoryId,
          description: data.description,
          image: selectedImage ? 'selected' : undefined,
        });
        alert('Product updated successfully!');
      } else {
        // Nếu thêm mới, tạo FormData cho createProduct
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        formData.append('file', selectedImage as File);
        formData.append('categoryId', data.categoryId.toString());
        if (data.description) {
          formData.append('description', data.description);
        }
        await createProduct(formData);
        alert('Product added successfully!');
      }
      // Reset form
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEditingProduct(null);
      setShowForm(false);
      // Refresh list
      const refreshed = await getProducts({ page: 1, limit: 100 });
      if (refreshed && refreshed.data) {
        setProducts(refreshed.data);
      } else if (Array.isArray(refreshed)) {
        setProducts(refreshed);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      alert('Product deleted successfully!');
      const refreshed = await getProducts({ page: 1, limit: 100 });
      if (refreshed && refreshed.data) {
        setProducts(refreshed.data);
      } else if (Array.isArray(refreshed)) {
        setProducts(refreshed);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Pre-fill form fields
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('categoryId', product.categoryId || 0);
    setValue('description', product.description || '');
    // Reset image state (nếu không muốn tự động lấy hình cũ)
    setSelectedImage(null);
    setImagePreview(product.image);
    setShowForm(true);
  };

  // Khi nhấn nút "New Product", reset editing state và hiển thị form
  const handleNewProduct = () => {
    setEditingProduct(null);
    reset();
    setSelectedImage(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || isLoading) {
    return <div className="p-5">Loading...</div>;
  }
  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Admin - Manage Products</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return <div className="p-5">Access denied. Redirecting...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Products</h1>
      
      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Button hiển thị form */}
      <div className="mb-4">
        <button
          onClick={handleNewProduct}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          New Product
        </button>
      </div>
      
      {/* Form dùng chung cho thêm/sửa */}
      {showForm && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">Name:</label>
              <input
                type="text"
                id="name"
                {...register("name", { required: true })}
                className="w-full p-2 border rounded"
              />
              {errors.name && <span className="text-red-500">This field is required</span>}
            </div>
            <div>
              <label htmlFor="price" className="block mb-1 font-medium">Price:</label>
              <input
                type="number"
                id="price"
                step="0.01"
                {...register("price", { required: true })}
                className="w-full p-2 border rounded"
              />
              {errors.price && <span className="text-red-500">This field is required</span>}
            </div>
            <div>
              <label htmlFor="image" className="block mb-1 font-medium">Product Image:</label>
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                // Nếu đang thêm mới thì bắt buộc chọn ảnh, còn sửa thì tùy chọn
                required={!editingProduct}
              />
              {imagePreview && (
                <div className="mt-2">
                  <p>Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 max-w-xs h-auto border"
                    style={{ maxHeight: '200px' }}
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="categoryId" className="block mb-1 font-medium">Category:</label>
              <select
                id="categoryId"
                {...register("categoryId", { required: true })}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select Category --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="text-red-500">Please select a category</span>}
            </div>
            <div>
              <label htmlFor="description" className="block mb-1 font-medium">Description:</label>
              <textarea
                id="description"
                {...register("description")}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? editingProduct ? 'Updating...' : 'Adding...'
                  : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedImage(null);
                  setImagePreview(null);
                  setEditingProduct(null);
                  setShowForm(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Product List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Product List</h2>
        {filteredProducts.length > 0 ? (
          <ul className="divide-y">
            {filteredProducts.map(product => (
              <li key={product.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-16 h-16 mr-4 bg-gray-100 overflow-hidden">
                    <SafeImage
                      src={product.image || ''}
                      alt={product.name}
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                  <div>
                    <div>{product.name} - ${product.price}</div>
                    <div className="text-sm text-gray-500">
                      Category: {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                    </div>
                    {product.description && (
                      <div className="text-sm text-gray-400">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
}
