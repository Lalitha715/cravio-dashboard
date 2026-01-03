import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { fetchHygieneRatings } from "../api/hasura";
import Header from "../components/Header";

export default function Hygiene() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchHygieneRatings();
      setRestaurants(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatus = (rating) => {
    if (rating >= 4) return "Good";
    if (rating >= 2.5) return "Average";
    return "Poor";
  };

  const getColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">
      <Header />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Restaurant Hygiene Ratings</h1>

        {loading ? (
          <p>Loading hygiene data...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-gray-600">No hygiene data found.</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Restaurant</th>
                  <th className="px-4 py-2 text-left">Hygiene Rating</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((res) => (
                  <tr key={res.id} className="border-t">
                    <td className="px-4 py-2 font-medium">
                      {res.name}
                    </td>

                    <td className="px-4 py-2">
                      ⭐ {res.hygiene_rating ?? "N/A"}
                    </td>

                    <td
                      className={`px-4 py-2 font-semibold ${getColor(
                        res.hygiene_rating
                      )}`}
                    >
                      {getStatus(res.hygiene_rating)}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-600">
                      {res.updated_at
                        ? new Date(res.updated_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
