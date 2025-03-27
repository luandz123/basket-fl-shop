'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

interface FormData {
  name: string;
}

export default function AdminCategoriesPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [user, isAdmin, loading, router]);

  const onSubmitCreate = async (data: FormData) => {
    try {
      await createCategory(data);
      alert('Category added successfully!');
      reset();
      // Refresh categories list
      const categoriesData = await getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to add category.');
    }
  };

  const onSubmitUpdate = async (data: FormData) => {
    if (editingCategoryId === null) return;

    try {
      await updateCategory(editingCategoryId, data);
      alert('Category updated successfully!');
      setEditingCategoryId(null);
      reset();
      // Refresh categories list
      const categoriesData = await getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All associated products will lose their category assignment.')) {
      return;
    }
    
    try {
      await deleteCategory(id);
      alert('Category deleted successfully!');
      // Refresh categories list
      const categoriesData = await getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setValue('name', category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    reset();
  };

  if (loading || isLoading) {
    return <div className="p-5">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Admin - Manage Categories</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
    return <div className="p-5">Admin access only. Redirecting...</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Categories</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Add New Category</h2>
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">Name:</label>
            <input 
              type="text" 
              id="name" 
              {...register("name", { required: true })} 
              className="w-full p-2 border rounded"
            />
            {errors.name && <span className="text-red-500 text-sm">This field is required</span>}
          </div>
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Category List</h2>
        {categories.length > 0 ? (
          <ul className="divide-y">
            {categories.map(category => (
              <li key={category.id} className="py-3">
                {editingCategoryId === category.id ? (
                  <form onSubmit={handleSubmit(onSubmitUpdate)} className="flex items-center space-x-2">
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      className="flex-grow p-2 border rounded"
                    />
                    <button 
                      type="submit" 
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <div className="space-x-2">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No categories available</p>
        )}
      </div>
    </div>
  );
}