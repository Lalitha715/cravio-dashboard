// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatsCard from "../components/StatsCard";
import { fetchUsers, fetchRestaurants, fetchOrders, fetchDeliveryBoys } from "../api/hasura";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await fetchUsers();
        const restaurants = await fetchRestaurants();
        const allOrders = await fetchOrders();
        const deliveryBoys = await fetchDeliveryBoys();

        setUserCount(users?.length || 0);
        setRestaurantCount(restaurants?.length || 0);
        setDeliveryCount(deliveryBoys?.length || 0);
        setOrders(allOrders || []);

        const today = new Date().toISOString().split("T")[0];
        const todayOrders = allOrders.filter((o) => o.created_at?.split("T")[0] === today);
        setTotalOrders(todayOrders.length);

        const revenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        setTotalRevenue(revenue);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Pending orders count
  const pendingOrders = orders.filter((o) => o.status === "pending");

  const stats = [
    { title: "Users", value: userCount, color: "bg-blue-500" },
    { title: "Restaurants", value: restaurantCount, color: "bg-green-500" },
    { title: "Orders Today", value: totalOrders, color: "bg-purple-500" },
    { title: "Revenue Today", value: `₹${totalRevenue}`, color: "bg-orange-500" },
    { title: "Delivery Boys", value: deliveryCount, color: "bg-pink-500" },
    { title: "Pending Orders", value: pendingOrders.length, color: "bg-red-500", onClick: () => setShowPendingOrdersModal(true) },
  ];

  const ordersPerDayData = () => {
    const days = {};
    orders.forEach((o) => {
      if (!o.created_at) return;
      const day = o.created_at.split("T")[0];
      days[day] = (days[day] || 0) + 1;
    });
    return {
      labels: Object.keys(days),
      datasets: [
        { label: "Orders per day", data: Object.values(days), backgroundColor: "rgba(59,130,246,0.7)" },
      ],
    };
  };

  const revenuePerMonthData = () => {
    const months = {};
    orders.forEach((o) => {
      if (!o.created_at) return;
      const month = o.created_at.slice(0, 7);
      months[month] = (months[month] || 0) + Number(o.total_amount || 0);
    });
    return {
      labels: Object.keys(months),
      datasets: [
        {
          label: "Revenue per month",
          data: Object.values(months),
          borderColor: "rgba(249,115,22,1)",
          backgroundColor: "rgba(249,115,22,0.3)",
          tension: 0.3,
        },
      ],
    };
  };

  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const getRestaurantDishMapping = (order) => {
    if (!order.order_items || order.order_items.length === 0) return "-";
    const map = {};
    order.order_items.forEach((item) => {
      const r = item.dish?.restaurant?.name || "-";
      const d = item.dish?.name || "-";
      if (!map[r]) map[r] = [];
      map[r].push(d);
    });
    return Object.entries(map).map(([r, dishes]) => `${r} → ${dishes.join(", ")}`).join(" | ");
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {stats.map((s, i) => (
              <StatsCard key={i} {...s} />
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-bold mb-3">Recent Orders</h2>
            {recentOrders.length === 0 ? (
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
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="p-2">{o.order_number}</td>
                      <td className="p-2">{o.user?.name || "-"}</td>
                      <td className="p-2">{getRestaurantDishMapping(o)}</td>
                      <td className="p-2">₹{o.total_amount}</td>
                      <td className="p-2">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pending Orders Modal */}
          {showPendingOrdersModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50 overflow-y-auto">
              <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Pending Orders</h2>
                  <button className="text-red-500 font-semibold" onClick={() => setShowPendingOrdersModal(false)}>
                    Close
                  </button>
                </div>
                {pendingOrders.length === 0 ? (
                  <p>No pending orders.</p>
                ) : (
                  <table className="w-full border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Order</th>
                        <th className="p-2 text-left">User</th>
                        <th className="p-2 text-left">Restaurant(s) & Dish(es)</th>
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((o) => (
                        <tr key={o.id} className="border-t">
                          <td className="p-2">{o.order_number}</td>
                          <td className="p-2">{o.user?.name || "-"}</td>
                          <td className="p-2">{getRestaurantDishMapping(o)}</td>
                          <td className="p-2">₹{o.total_amount}</td>
                          <td className="p-2 text-yellow-600 font-semibold">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Orders per Day</h2>
              <Bar data={ordersPerDayData()} />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Revenue per Month</h2>
              <Line data={revenuePerMonthData()} />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
