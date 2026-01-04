import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchOrders, updateOrderStatus } from "../api/hasura";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = ["placed", "preparing", "delivered", "cancelled"];

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders = await fetchOrders();
        setOrders(allOrders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

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

  const getRestaurantDishes = (order) => {
    if (!order.order_items || order.order_items.length === 0) return [];
    const mapping = {};
    order.order_items.forEach((item) => {
      const restName = item.dish?.restaurant?.name || "Unknown";
      if (!mapping[restName]) mapping[restName] = [];
      mapping[restName].push(item.dish?.name);
    });
    return Object.entries(mapping);
  };

  // Filter orders
  const filteredOrders = orders
    .filter((o) =>
      getRestaurantDishes(o)
        .map(([rest]) => rest.toLowerCase())
        .some((rest) => rest.includes(searchTerm.toLowerCase()))
    )
    .filter((o) => paymentFilter === "all" || o.payment_method === paymentFilter)
    .filter((o) => statusFilter === "all" || o.status === statusFilter);

  // Today's summary
  const today = new Date().toLocaleDateString();
  const todayOrders = filteredOrders.filter(
    (o) => new Date(o.created_at).toLocaleDateString() === today
  );
  const totalTodayAmount = todayOrders.reduce(
    (acc, order) => acc + order.total_amount,
    0
  );

  if (loading) return <p className="ml-60 mt-6">Loading orders...</p>;

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by Restaurant"
          className="border px-3 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
        </select>
        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Today's Summary */}
      <div className="mb-4 p-4 bg-gray-100 text-sm">
        <div className="font-semibold mb-1">Today's Order Summary</div>
        <div>
          <span className="font-medium">Today:</span> ₹{totalTodayAmount}
        </div>
      </div>

      {/* Orders Table – Dishes Table Style */}
      <div className="overflow-auto max-h-[70vh] bg-white shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Order Number</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Restaurant & Dishes</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50 align-top">
                <td className="p-3">{o.order_number}</td>
                <td className="p-3 font-medium">{o.user?.name || "-"}</td>

                <td className="p-3">
                  {getRestaurantDishes(o).map(([restaurant, dishes]) => (
                    <div key={restaurant} className="mb-2">
                      <div className="font-semibold">
                        {highlightText(restaurant, searchTerm)}
                      </div>
                      <div className="text-gray-600 text-sm">{dishes.join(", ")}</div>
                    </div>
                  ))}
                </td>

                <td className="p-3 font-semibold">₹{o.total_amount}</td>
                <td className="p-3 capitalize">{o.status}</td>
                <td className="p-3">{o.payment_method || "-"}</td>
                <td className="p-3">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}</td>

                <td className="p-3 w-44">
                  <div className="flex flex-col gap-2">
                    {statusOptions.map((status) => {
                      let color = "bg-gray-200 text-black";
                      if (o.status === status) {
                        if (status === "placed") color = "bg-blue-500 text-white";
                        if (status === "preparing") color = "bg-yellow-500 text-white";
                        if (status === "delivered") color = "bg-green-500 text-white";
                        if (status === "cancelled") color = "bg-red-500 text-white";
                      }
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(o.id, status)}
                          className={`w-full py-1 rounded text-xs font-medium ${color}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
