// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchOrders, updateOrderStatus } from "../api/hasura";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filter & Search logic
  useEffect(() => {
    let filtered = [...orders];

    // Search by order number, user name, or restaurant name
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.order_number.toLowerCase().includes(lower) ||
          o.user?.name?.toLowerCase().includes(lower) ||
          o.restaurant?.name?.toLowerCase().includes(lower)
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchText, filterStatus]);

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-500">Failed to load orders</p>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by order, user, restaurant..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="preparing">Preparing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-auto max-h-[70vh]">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Order Number</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Restaurant</th>
                <th className="py-3 px-4 text-left">Total Amount</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Payment Method</th>
                <th className="py-3 px-4 text-left">Created At</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{order.order_number}</td>
                  <td className="py-3 px-4">{order.user?.name || "-"}</td>
                  <td className="py-3 px-4">{order.restaurant?.name || "-"}</td>
                  <td className="py-3 px-4">₹{order.total_amount}</td>
                  <td className="py-3 px-4 capitalize">{order.status}</td>
                  <td className="py-3 px-4">{order.payment_method || "-"}</td>
                  <td className="py-3 px-4">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleStatusChange(order.id, "placed")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Placed
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, "preparing")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Preparing
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, "delivered")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, "cancelled")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
