'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getAdminUsers, updateUser } from '@/lib/api';
import './users.css';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;
      if (!user) { router.push('/login'); return; }
      if (!isAdmin) { router.push('/'); return; }
      try {
        const usersData = await getAdminUsers();
        setUsers(usersData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        if (err?.response?.status === 401) router.push('/login');
        else setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchData();
  }, [user, isAdmin, loading, refreshTrigger, router]);

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await updateUser(id, { isActive: !isActive });
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, isActive: !isActive } : u)));
      setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
    } catch (err: any) {
      console.error('Error updating user status:', err);
      if (err?.response?.status === 401) router.push('/login');
      else alert('Không thể cập nhật trạng thái người dùng.');
    }
  };

  if (loading || isLoadingUsers) {
    return <div className="users-container">Đang tải trạng thái xác thực...</div>;
  }
  if (!user) return <div className="users-container">Bạn cần đăng nhập để truy cập trang này. Đang chuyển hướng...</div>;
  if (!isAdmin) return <div className="users-container">Chỉ dành cho quản trị. Đang chuyển hướng...</div>;

  return (
    <div className="users-container">
      <h1 className="users-title">Quản Trị - Quản Lý Người Dùng</h1>
      <p className="users-info">
        Đăng nhập bởi: {user.email} (Vai trò: {user.role})
      </p>
      {error && <div className="error-message">{error}</div>}
      <button
        onClick={() => setRefreshTrigger(prev => prev + 1)}
        disabled={isLoadingUsers}
        className="refresh-btn"
      >
        {isLoadingUsers ? 'Đang tải...' : 'Làm mới danh sách người dùng'}
      </button>
      {isLoadingUsers ? (
        <p>Đang tải người dùng...</p>
      ) : users.length > 0 ? (
        <ul className="users-list">
          {users.map(u => (
            <li key={u.id} className="user-item">
              <div>
                <p>{u.name}</p>
                <p className="users-info">
                  {u.email} - Vai trò: {u.role}
                </p>
              </div>
              <div>
                <span className={`user-status ${u.isActive ? 'status-active' : 'status-inactive'}`}>
                  {u.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                <button
                  onClick={() => handleToggleStatus(u.id, u.isActive)}
                  className={`toggle-btn ${u.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                >
                  {u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có người dùng nào</p>
      )}
    </div>
  );
}

function clearAuthToken() {
  throw new Error('Function not implemented.');
}