import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchOrders, updateOrderStatus } from "../api/hasura";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getRestaurantDishes = (order) => {
    if (!order.order_items || order.order_items.length === 0) return "-";

    const mapping = {};

    order.order_items.forEach((item) => {
      const restName = item.dish?.restaurant?.name || "Unknown";
      if (!mapping[restName]) mapping[restName] = [];
      mapping[restName].push(item.dish?.name);
    });

    return Object.entries(mapping)
      .map(([rest, dishes]) => `${rest} → ${dishes.join(", ")}`)
      .join(" | ");
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Order Number</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Restaurant & Dishes</th>
                <th className="p-2 text-left">Total Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Payment Method</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t align-top">
                  <td className="p-2">{o.order_number}</td>
                  <td className="p-2">{o.user?.name || "-"}</td>
                  <td className="p-2 max-w-xs">
                    {getRestaurantDishes(o)}
                  </td>
                  <td className="p-2">₹{o.total_amount}</td>
                  <td className="p-2 capitalize">{o.status}</td>
                  <td className="p-2">{o.payment_method || "-"}</td>
                  <td className="p-2">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((status, idx) => {
                        let colorClass = "bg-gray-200 text-black";
                        if (o.status === status) {
                          if (status === "placed")
                            colorClass = "bg-blue-500 text-white";
                          if (status === "preparing")
                            colorClass = "bg-yellow-500 text-white";
                          if (status === "delivered")
                            colorClass = "bg-green-500 text-white";
                          if (status === "cancelled")
                            colorClass = "bg-red-500 text-white";
                        }
                        return (
                          <button
                            key={status}
                            className={`px-2 py-1 rounded text-sm w-full text-center truncate ${colorClass}`}
                            onClick={() =>
                              handleStatusChange(o.id, status)
                            }
                          >
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
