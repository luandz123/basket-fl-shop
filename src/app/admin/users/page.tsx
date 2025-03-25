'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getAdminUsers, updateUser } from '@/lib/api';

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
      if (loading) {
        return;
      }
      // Kiểm tra xác thực
      if (!user) {
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        router.push('/');
        return;
      }
      try {
        const usersData = await getAdminUsers();
        setUsers(usersData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        if (err?.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load users. Please try again.');
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchData();
  }, [user, isAdmin, loading, refreshTrigger, router]);

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await updateUser(id, { isActive: !isActive });
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, isActive: !isActive } : u))
      );
      // Reset trigger để refresh lại danh sách nếu cần
      setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
    } catch (err: any) {
      console.error('Error updating user status:', err);
      if (err?.response?.status === 401) {
        router.push('/login');
      } else {
        alert('Failed to update user status.');
      }
    }
  };

  if (loading || isLoadingUsers) {
    return <div className="p-5">Loading authentication status...</div>;
  }

  if (!user) {
    return <div className="p-5">You must be logged in to access this page. Redirecting...</div>;
  }

  if (!isAdmin) {
    return <div className="p-5">Admin access only. Redirecting...</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Users</h1>
      <p className="text-sm text-gray-500 mb-4">
        Logged in as: {user.email} (Role: {user.role})
      </p>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <button
        onClick={() => setRefreshTrigger(prev => prev + 1)}
        disabled={isLoadingUsers}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoadingUsers ? 'Loading...' : 'Refresh Users'}
      </button>
      {isLoadingUsers ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {users.map(u => (
            <li key={u.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-500">
                  {u.email} - Role: {u.role}
                </p>
              </div>
              <div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggleStatus(u.id, u.isActive)}
                  className={`ml-3 px-3 py-1 rounded ${
                    u.isActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users available</p>
      )}
    </div>
  );
}

function clearAuthToken() {
  throw new Error('Function not implemented.');
}