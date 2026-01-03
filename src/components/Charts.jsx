// src/components/Charts.jsx
import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Charts({ orders }) {
  // Orders per day (Bar chart)
  const ordersPerDayData = () => {
    const days = {};
    orders.forEach((o) => {
      const day = o.created_at.split("T")[0];
      days[day] = (days[day] || 0) + 1;
    });
    const labels = Object.keys(days).sort();
    const data = labels.map((label) => days[label]);
    return {
      labels,
      datasets: [
        {
          label: "Orders per Day",
          data,
          backgroundColor: "rgba(59, 130, 246, 0.7)",
        },
      ],
    };
  };

  // Revenue per month (Line chart)
  const revenuePerMonthData = () => {
    const months = {};
    orders.forEach((o) => {
      const month = o.created_at.slice(0, 7); // YYYY-MM
      months[month] = (months[month] || 0) + Number(o.total_amount || 0);
    });
    const labels = Object.keys(months).sort();
    const data = labels.map((label) => months[label]);
    return {
      labels,
      datasets: [
        {
          label: "Revenue per Month",
          data,
          borderColor: "rgba(249, 115, 22, 1)",
          backgroundColor: "rgba(249, 115, 22, 0.3)",
          tension: 0.3,
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Orders per Day */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Orders per Day</h2>
        <Bar data={ordersPerDayData()} />
      </div>

      {/* Revenue per Month */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Revenue per Month</h2>
        <Line data={revenuePerMonthData()} />
      </div>
    </div>
  );
}