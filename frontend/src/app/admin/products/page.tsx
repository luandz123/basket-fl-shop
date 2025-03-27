'use client';

import React, { useState, useEffect, useRef } from 'react';
import useAuth from '@/hooks/useAuth';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import SafeImage from '@/components/SafeImage';
import './products.css';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!isAdmin) { router.push('/'); return; }
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);      
      try {
        const productsData = await getProducts({ page: 1, limit: 100 });
        if (productsData && productsData.data) {
          setProducts(productsData.data);
        } else if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          setProducts([]);
          setError('Không thể đọc dữ liệu sản phẩm');
        }
        const categoriesData = await getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
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

  const onSubmit = async (data: FormData) => {
    if (!editingProduct && !selectedImage) {
      alert('Vui lòng chọn hình cho sản phẩm');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        formData.append('categoryId', data.categoryId.toString());
        if (data.description) formData.append('description', data.description);
        if (selectedImage) formData.append('file', selectedImage);
        await updateProduct(editingProduct.id, {
          name: data.name,
          price: data.price,
          categoryId: data.categoryId,
          description: data.description,
          image: selectedImage ? 'selected' : undefined,
        });
        alert('Cập nhật sản phẩm thành công!');
      } else {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        formData.append('file', selectedImage as File);
        formData.append('categoryId', data.categoryId.toString());
        if (data.description) formData.append('description', data.description);
        await createProduct(formData);
        alert('Thêm sản phẩm thành công!');
      }
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEditingProduct(null);
      setShowForm(false);
      const refreshed = await getProducts({ page: 1, limit: 100 });
      if (refreshed && refreshed.data) setProducts(refreshed.data);
      else if (Array.isArray(refreshed)) setProducts(refreshed);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Không thể lưu sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      alert('Xóa sản phẩm thành công!');
      const refreshed = await getProducts({ page: 1, limit: 100 });
      if (refreshed && refreshed.data) setProducts(refreshed.data);
      else if (Array.isArray(refreshed)) setProducts(refreshed);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Không thể xóa sản phẩm.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('categoryId', product.categoryId || 0);
    setValue('description', product.description || '');
    setSelectedImage(null);
    setImagePreview(product.image);
    setShowForm(true);
  };

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

  if (loading || isLoading) return <div className="products-container">Đang tải...</div>;
  if (error) return (
    <div className="products-container">
      <h1 className="products-title">Quản Trị - Quản Lý Sản Phẩm</h1>
      <div className="error-message">{error}
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginLeft: '10px' }}>Thử lại</button>
      </div>
    </div>
  );
  if (!isAdmin) return <div className="products-container">Không có quyền truy cập. Đang chuyển hướng...</div>;

  return (
    <div className="products-container">
      <h1 className="products-title">Quản Trị - Quản Lý Sản Phẩm</h1>
      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-box"
        />
      </div>
      {/* New Product Button */}
      <div className="mb-4">
        <button onClick={handleNewProduct} className="new-product-btn">
          Thêm Sản Phẩm Mới
        </button>
      </div>
      {/* Form */}
      {showForm && (
        <div className="form-container">
          <h2 className="form-title">{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name">Tên:</label>
              <input type="text" id="name" {...register("name", { required: true })} className="input-field" />
              {errors.name && <span className="error-message">Trường này là bắt buộc</span>}
            </div>
            <div>
              <label htmlFor="price">Giá:</label>
              <input type="number" id="price" step="0.01" {...register("price", { required: true })} className="input-field" />
              {errors.price && <span className="error-message">Trường này là bắt buộc</span>}
            </div>
            <div>
              <label htmlFor="image">Hình sản phẩm:</label>
              <input type="file" id="image" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="input-field" required={!editingProduct} />
              {imagePreview && (
                <div style={{ marginTop: '8px' }}>
                  <p>Xem trước hình ảnh:</p>
                  <img src={imagePreview} alt="Xem trước" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }} onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,...';
                  }} />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="categoryId">Danh mục:</label>
              <select id="categoryId" {...register("categoryId", { required: true })} className="select-field">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {errors.categoryId && <span className="error-message">Vui lòng chọn danh mục</span>}
            </div>
            <div>
              <label htmlFor="description">Mô tả:</label>
              <textarea id="description" {...register("description")} className="textarea-field" rows={3} />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (editingProduct ? 'Đang cập nhật...' : 'Đang thêm...') : (editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
              </button>
              <button type="button" onClick={() => { reset(); setSelectedImage(null); setImagePreview(null); setEditingProduct(null); setShowForm(false); }} className="btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Product List */}
      <div className="list-container">
        <h2 className="form-title">Danh sách sản phẩm</h2>
        {filteredProducts.length > 0 ? (
          <ul className="product-list">
            {filteredProducts.map(product => (
              <li key={product.id} className="product-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', marginRight: '16px', background: '#f3f4f6', overflow: 'hidden' }}>
                    <SafeImage src={product.image || ''} alt={product.name} width={64} height={64} />
                  </div>
                  <div>
                    <div>{product.name} - ${product.price}</div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      Danh mục: {categories.find(c => c.id === product.categoryId)?.name || 'Chưa xác định'}
                    </div>
                    {product.description && <div style={{ fontSize: '13px', color: '#999' }}>{product.description}</div>}
                  </div>
                </div>
                <div className="product-actions">
                  <button onClick={() => handleEdit(product)} className="btn-edit">Sửa</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-delete">Xóa</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có sản phẩm nào</p>
        )}
      </div>
    </div>
  );
}
