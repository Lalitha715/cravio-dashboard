import React from "react";

export default function RecentOrders({ orders }) {
  const lastOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const getRestaurantNames = (order) => {
    if (!order?.order_items || order.order_items.length === 0) return "-";

    return [
      ...new Set(
        order.order_items
          .map((i) => i.dish?.restaurant?.name)
          .filter(Boolean)
      ),
    ].join(", ");
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>

      {lastOrders.length === 0 ? (
        <p>No recent orders.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Restaurant(s)</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {lastOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.order_number}</td>
                <td className="p-2">{o.user?.name || "-"}</td>
                <td className="p-2">{getRestaurantNames(o)}</td>
                <td className="p-2">₹{o.total_amount}</td>
                <td className="p-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
