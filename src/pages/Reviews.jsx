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
          {[5, 4, 3, 2, 1].map(n => (
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
      {/* Reviews Table */}
      <div className="overflow-auto max-h-[70vh] bg-white shadow rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left rounded-tl-lg">User</th>
              <th className="p-3 text-left">Restaurant</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Comment</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left rounded-tr-lg">Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50 align-top">
                <td className="p-3 font-semibold">{r.user?.name || "-"}</td>
                <td className="p-3">{r.restaurant?.name || "-"}</td>
                <td className="p-3 font-semibold">⭐ {r.rating}</td>
                <td className="p-3 text-gray-600 text-sm">{r.comment}</td>
                <td className="p-3 font-medium">
                  {r.status === "visible" ? "Visible": "Hidden"}
                </td>
                <td className="p-3 w-44">
                  <div className="flex flex-col gap-2">
                    {r.status !== "visible" && (
                      <button
                        onClick={() => handleStatus(r.id, "visible")}
                        className="w-full py-1 rounded bg-green-500 text-white text-xs font-medium"
                      >
                        Show
                      </button>
                    )}
                    {r.status !== "hidden" && (
                      <button
                        onClick={() => handleStatus(r.id, "hidden")}
                        className="w-full py-1 rounded bg-yellow-500 text-white text-xs font-medium"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-full py-1 rounded bg-red-500 text-white text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  );
}

