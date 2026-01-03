// src/components/RecentOrders.jsx
import React from "react";

export default function RecentOrders({ orders }) {
  // Get last 5 orders
  const lastOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>

      {lastOrders.length === 0 ? (
        <p className="text-gray-600">No recent orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                  Order ID
                </th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                  User
                </th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                  Restaurant
                </th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                  Total
                </th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {lastOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-2 px-4 text-sm">{order.order_number}</td>
                  <td className="py-2 px-4 text-sm">{order.user?.name || "-"}</td>
                  <td className="py-2 px-4 text-sm">{order.restaurant?.name || "-"}</td>
                  <td className="py-2 px-4 text-sm">₹{order.total_amount}</td>
                  <td
                    className={`py-2 px-4 text-sm font-semibold ${
                      order.status === "pending"
                        ? "text-yellow-600"
                        : order.status === "completed"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
