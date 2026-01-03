// src/pages/Reviews.jsx
import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import AdminLayout from "../components/AdminLayout";

// ============================
// GraphQL Queries & Mutations
// ============================
const GET_REVIEWS = gql`
  query GetReviews {
    reviews(order_by: { created_at: desc }) {
      id
      rating
      comment
      status
      created_at
      user {
        name
      }
      restaurant {
        id
        name
      }
    }
  }
`;

const UPDATE_REVIEW_STATUS = gql`
  mutation UpdateReviewStatus($id: uuid!, $status: String!) {
    update_reviews_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($id: uuid!) {
    delete_reviews_by_pk(id: $id) {
      id
    }
  }
`;

// ============================
// Component
// ============================
export default function Reviews() {
  const { data, loading, error, refetch } = useQuery(GET_REVIEWS);
  const [updateStatus] = useMutation(UPDATE_REVIEW_STATUS);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  const [filterRating, setFilterRating] = useState(""); // 1-5 filter
  const [searchRestaurant, setSearchRestaurant] = useState(""); // search by restaurant
  const [autoHide, setAutoHide] = useState(true); // auto hide <2⭐

  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  // ============================
  // Load & Filter Reviews
  // ============================
  useEffect(() => {
    if (!data?.reviews) return;

    let filtered = [...data.reviews];

    // Auto hide reviews < 2⭐
    if (autoHide) {
      filtered.forEach(async (r) => {
        if (r.rating < 2 && r.status !== "hidden") {
          await updateStatus({ variables: { id: r.id, status: "hidden" } });
        }
      });
      filtered = filtered.filter(r => r.rating >= 2 || r.status === "hidden");
    }

    // Filter by rating
    if (filterRating) {
      filtered = filtered.filter(r => r.rating === Number(filterRating));
    }

    // Search by restaurant
    if (searchRestaurant) {
      filtered = filtered.filter(r =>
        r.restaurant?.name.toLowerCase().includes(searchRestaurant.toLowerCase())
      );
    }

    setReviews(filtered);

    // ============================
    // Analytics: Avg rating per restaurant
    // ============================
    const restaurantMap = {};
    filtered.forEach(r => {
      if (!r.restaurant?.name) return;
      if (!restaurantMap[r.restaurant.name]) {
        restaurantMap[r.restaurant.name] = { total: 0, count: 0 };
      }
      restaurantMap[r.restaurant.name].total += r.rating;
      restaurantMap[r.restaurant.name].count += 1;
    });

    const analyticsData = Object.entries(restaurantMap).map(([name, obj]) => ({
      restaurant: name,
      avgRating: (obj.total / obj.count).toFixed(2),
    }));

    setAnalytics(analyticsData);

  }, [data, filterRating, searchRestaurant, autoHide, updateStatus]);

  // ============================
  // Handlers
  // ============================
  const handleStatus = async (id, status) => {
    await updateStatus({ variables: { id, status } });
    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this review?")) {
      await deleteReview({ variables: { id } });
      refetch();
    }
  };

  if (loading) return <p className="ml-60 mt-6">Loading reviews...</p>;
  if (error) return <p className="ml-60 mt-6 text-red-500">Error loading reviews</p>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search Restaurant..."
          value={searchRestaurant}
          onChange={(e) => setSearchRestaurant(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Filter by rating</option>
          {[5,4,3,2,1].map(n => (
            <option key={n} value={n}>{n} ⭐</option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoHide}
            onChange={(e) => setAutoHide(e.target.checked)}
          />
          {"Auto hide < 2⭐"}
        </label>
      </div>

      {/* Analytics */}
      {analytics.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Average Rating per Restaurant</h2>
          <ul>
            {analytics.map(a => (
              <li key={a.restaurant}>
                <strong>{a.restaurant}:</strong> {a.avgRating} ⭐
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reviews Table */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">User</th>
              <th className="p-3 border">Restaurant</th>
              <th className="p-3 border">Rating</th>
              <th className="p-3 border">Comment</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="text-center hover:bg-gray-50">
                <td className="p-3 border">{r.user?.name || "-"}</td>
                <td className="p-3 border">{r.restaurant?.name || "-"}</td>
                <td className="p-3 border font-semibold">⭐ {r.rating}</td>
                <td className="p-3 border text-left max-w-xs">{r.comment}</td>
                <td className="p-3 border capitalize">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      r.status === "visible" ? "bg-green-600" : "bg-gray-500"
                    }`}
                  >
                    {r.status || "visible"}
                  </span>
                </td>
                <td className="p-3 border space-x-2">
                  {r.status !== "visible" && (
                    <button
                      onClick={() => handleStatus(r.id, "visible")}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Show
                    </button>
                  )}
                  {r.status !== "hidden" && (
                    <button
                      onClick={() => handleStatus(r.id, "hidden")}
                      className="px-3 py-1 bg-yellow-600 text-white rounded"
                    >
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

