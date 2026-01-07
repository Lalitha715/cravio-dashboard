// src/pages/Reviews.jsx
import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import AdminLayout from "../components/AdminLayout";

const GET_REVIEWS = gql`
  query GetReviews {
    reviews(order_by: { created_at: desc }) {
      id
      rating
      comment
      status
      created_at
      user { name }
      restaurant { id name }
    }
  }
`;

const UPDATE_REVIEW_STATUS = gql`
  mutation UpdateReviewStatus($id: uuid!, $status: String!) {
    update_reviews_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
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

export default function Reviews() {
  const { data, loading, error, refetch } = useQuery(GET_REVIEWS);
  const [updateStatus] = useMutation(UPDATE_REVIEW_STATUS);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  const [filterRating, setFilterRating] = useState("");
  const [searchRestaurant, setSearchRestaurant] = useState("");
  const [autoHide, setAutoHide] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    if (!data?.reviews) return;

    let filtered = [...data.reviews];

    if (autoHide) {
      filtered = filtered.filter(r => r.rating >= 2 || r.status === "hidden");
    }

    if (filterRating) {
      filtered = filtered.filter(r => r.rating === Number(filterRating));
    }

    if (searchRestaurant) {
      filtered = filtered.filter(r =>
        r.restaurant?.name
          ?.toLowerCase()
          .includes(searchRestaurant.toLowerCase())
      );
    }

    setReviews(filtered);

    // Analytics
    const map = {};
    filtered.forEach(r => {
      const name = r.restaurant?.name;
      if (!name) return;
      map[name] ??= { total: 0, count: 0 };
      map[name].total += r.rating;
      map[name].count++;
    });

    setAnalytics(
      Object.entries(map).map(([k, v]) => ({
        restaurant: k,
        avgRating: (v.total / v.count).toFixed(2),
      }))
    );
  }, [data, filterRating, searchRestaurant, autoHide]);

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

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {/* Loading */}
      {loading && (
        <div className="p-6 text-gray-500">Loading reviews...</div>
      )}

      {/* Error */}
      {error && (
        <div className="p-6 text-red-500">Error loading reviews</div>
      )}

      {!loading && !error && (
        <>
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
              Auto hide &lt; 2⭐
            </label>
          </div>

          {/* Analytics */}
          {analytics.length > 0 && (
            <div className="mb-6 p-4 bg-gray-100 rounded">
              <h2 className="font-semibold mb-2">Average Rating</h2>
              {analytics.map(a => (
                <p key={a.restaurant}>
                  <strong>{a.restaurant}:</strong> {a.avgRating} ⭐
                </p>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="overflow-auto max-h-[70vh] bg-white shadow rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Restaurant</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Comment</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{r.user?.name}</td>
                    <td className="p-3">{r.restaurant?.name}</td>
                    <td className="p-3">⭐ {r.rating}</td>
                    <td className="p-3 text-sm">{r.comment}</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3 space-y-1">
                      <button
                        onClick={() => handleStatus(r.id, "visible")}
                        className="block w-full bg-green-500 text-white text-xs py-1 rounded"
                      >
                        Show
                      </button>
                      <button
                        onClick={() => handleStatus(r.id, "hidden")}
                        className="block w-full bg-yellow-500 text-white text-xs py-1 rounded"
                      >
                        Hide
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="block w-full bg-red-500 text-white text-xs py-1 rounded"
                      >
                        Delete
                      </button>
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
        </>
      )}
    </AdminLayout>
  );
}
