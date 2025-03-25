'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getAdminOrders, updateOrder } from '@/lib/api';
import Link from 'next/link';

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number | string;
}

interface Order {
    id: number;
    userId: number;
    user: {
        id: number;
        email: string;
        name?: string;
    };
    total: number | string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    address: string;
    createdAt: string;
    items?: OrderItem[];
}

export default function AdminOrdersPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState({
        status: '',
        search: '',
        dateFrom: '',
        dateTo: '',
        paymentStatus: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [processingOrder, setProcessingOrder] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');

    // Fetch orders function
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
            };

            // Prioritize viewMode over filter.status
            if (viewMode !== 'all') {
                params.status = viewMode;
            } else if (filter.status) {
                params.status = filter.status;
            }

            if (filter.search) {
                params.search = filter.search;
            }
            if (filter.dateFrom) {
                params.dateFrom = filter.dateFrom;
            }
            if (filter.dateTo) {
                params.dateTo = filter.dateTo;
            }
            if (filter.paymentStatus) {
                params.paymentStatus = filter.paymentStatus;
            }

            console.log('Fetching orders with params:', params);
            const response = await getAdminOrders(params);

            if (!response || (!response.orders && !Array.isArray(response))) {
                throw new Error('Invalid response format');
            }

            const orderData = response.orders || response;
            setOrders(orderData);
            setTotalPages(response.totalPages || Math.ceil((response.totalItems || 0) / itemsPerPage) || 1);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(`Failed to load orders: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, viewMode, filter]);

    useEffect(() => {
        if (!user) {
            router.push('/login?returnUrl=/admin/orders');
            return;
        }

        if (!isAdmin) {
            router.push('/');
            return;
        }

        fetchOrders();
    }, [user, isAdmin, router, fetchOrders]);

    // Handle view mode changes (All, Pending, Processing, etc.)
    const handleViewModeChange = (newMode: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered') => {
        setViewMode(newMode);
        setFilter(prev => ({ ...prev, status: '' })); // Clear status filter
        setCurrentPage(1);
    };

    // Handle status changes for individual orders
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            setProcessingOrder(id);
            await updateOrder(id, { status: newStatus });

            setOrders(prevOrders =>
                prevOrders.map(order => (order.id === id ? { ...order, status: newStatus } : order))
            );
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status.');
        } finally {
            setProcessingOrder(null);
        }
    };

    const formatPrice = (price: number | string | undefined | null): string => {
        if (price == null) {
            return '0.00';
        }
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Handle payment status changes
    const handlePaymentStatusChange = async (id: number, newPaymentStatus: string) => {
        try {
            setProcessingOrder(id);
            await updateOrder(id, { paymentStatus: newPaymentStatus });

            setOrders(prevOrders =>
                prevOrders.map(order => (order.id === id ? { ...order, paymentStatus: newPaymentStatus } : order))
            );
        } catch (err) {
            console.error('Error updating payment status:', err);
            setError('Failed to update payment status.');
        } finally {
            setProcessingOrder(null);
        }
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchOrders();
    };

    // Handle filter input changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    // Apply filters
    const applyFilters = () => {
        setCurrentPage(1);
        fetchOrders();
    };

    // Clear filters
    const clearFilters = () => {
        setFilter({
            status: '',
            search: '',
            dateFrom: '',
            dateTo: '',
            paymentStatus: '',
        });
        setCurrentPage(1);
    };

    // Handle bulk actions
    const handleBulkAction = async (action: string) => {
        if (selectedOrders.length === 0) {
            setError('Please select at least one order');
            return;
        }

        try {
            setLoading(true);
            await Promise.all(
                selectedOrders.map(orderId => updateOrder(orderId, { status: action }))
            );

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    selectedOrders.includes(order.id) ? { ...order, status: action } : order
                )
            );
            setSelectedOrders([]);
        } catch (err) {
            console.error('Error performing bulk action:', err);
            setError('Failed to update orders.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle select order
    const toggleSelectOrder = (orderId: number) => {
        setSelectedOrders(prevSelected =>
            prevSelected.includes(orderId)
                ? prevSelected.filter(id => id !== orderId)
                : [...prevSelected, orderId]
        );
    };

    // Toggle select all
    const toggleSelectAll = () => {
        setSelectedOrders(prevSelected =>
            prevSelected.length === orders.length ? [] : orders.map(order => order.id)
        );
    };

    const formatDate = (dateString: string) => {
        try {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getStatusColor = (status: string = '') => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string = '') => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!user || !isAdmin) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order Management</h1>
                <div className="flex space-x-2">
                    <Link
                        href="/admin"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex space-x-1 mb-4 md:mb-0">
                        <button
                            onClick={() => handleViewModeChange('all')}
                            className={`px-4 py-2 rounded-md ${viewMode === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => handleViewModeChange('pending')}
                            className={`px-4 py-2 rounded-md ${viewMode === 'pending' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => handleViewModeChange('processing')}
                            className={`px-4 py-2 rounded-md ${viewMode === 'processing' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Processing
                        </button>
                        <button
                            onClick={() => handleViewModeChange('shipped')}
                            className={`px-4 py-2 rounded-md ${viewMode === 'shipped' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Shipped
                        </button>
                        <button
                            onClick={() => handleViewModeChange('delivered')}
                            className={`px-4 py-2 rounded-md ${viewMode === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Delivered
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by order ID or customer"
                            value={filter.search}
                            onChange={handleFilterChange}
                            className="border rounded-l-md px-4 py-2 w-full"
                        />
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-md"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                        <select
                            name="status"
                            value={filter.status}
                            onChange={handleFilterChange}
                            className="border rounded-md px-4 py-2 w-full"
                            disabled={viewMode !== 'all'}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                            name="paymentStatus"
                            value={filter.paymentStatus}
                            onChange={handleFilterChange}
                            className="border rounded-md px-4 py-2 w-full"
                        >
                            <option value="">All Payment Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            name="dateFrom"
                            value={filter.dateFrom}
                            onChange={handleFilterChange}
                            className="border rounded-md px-4 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            name="dateTo"
                            value={filter.dateTo}
                            onChange={handleFilterChange}
                            className="border rounded-md px-4 py-2 w-full"
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <button
                            onClick={applyFilters}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex-grow"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Loading results...
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
                    <div>
                        <span className="font-medium">{selectedOrders.length} orders selected</span>
                    </div>
                    <div className="flex space-x-2">
                        <select
                            className="border rounded-md px-4 py-2"
                            onChange={(e) => e.target.value && handleBulkAction(e.target.value)}
                            value=""
                        >
                            <option value="" disabled>Bulk Action</option>
                            <option value="pending">Mark as Pending</option>
                            <option value="processing">Mark as Processing</option>
                            <option value="shipped">Mark as Shipped</option>
                            <option value="delivered">Mark as Delivered</option>
                            <option value="cancelled">Mark as Cancelled</option>
                        </select>
                        <button
                            onClick={() => setSelectedOrders([])}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                {loading && !orders.length ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === orders.length && orders.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.user?.name || order.user?.email || 'Unknown User'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${formatPrice(order.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {processingOrder === order.id ? (
                                                <div className="w-5 h-5 border-t-2 border-green-500 border-r-2 rounded-full animate-spin mx-auto"></div>
                                            ) : (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {processingOrder === order.id ? (
                                                <div className="w-5 h-5 border-t-2 border-green-500 border-r-2 rounded-full animate-spin mx-auto"></div>
                                            ) : (
                                                <>
                                                    <span className={`text-xs font-semibold inline-block px-2 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus || 'unpaid')} mr-2`}>
                                                        {order.paymentStatus || 'unpaid'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 block mt-1">
                                                        {order.paymentMethod}
                                                    </span>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    const newStatus = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
                                                    handlePaymentStatusChange(order.id, newStatus);
                                                }}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Mark as {order.paymentStatus === 'paid' ? 'Unpaid' : 'Paid'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <p className="text-gray-500">No orders found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">First</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNumber = currentPage <= 3
                                        ? i + 1
                                        : currentPage >= totalPages - 2
                                            ? totalPages - 4 + i
                                            : currentPage - 2 + i;

                                    if (pageNumber <= 0 || pageNumber > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            aria-current={currentPage === pageNumber ? 'page' : undefined}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                                ? 'z-10 bg-green-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Last</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}