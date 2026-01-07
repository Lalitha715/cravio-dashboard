import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  fetchRestaurants,
  addRestaurant,
  updateRestaurantStatus,
  updateRestaurant,
} from "../api/hasura";

export default function Restaurants() {
  /* =========================
     STATES
  ========================= */
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // add / edit modal
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // search & filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [commission, setCommission] = useState("");
  const [hygieneRating, setHygieneRating] = useState(0);

  /* =========================
     FETCH RESTAURANTS
  ========================= */
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await fetchRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setImageUrl("");
    setOpenTime("");
    setCloseTime("");
    setCommission("");
    setHygieneRating(0);
    setEditingId(null);
  };

  /* =========================
     ADD RESTAURANT
  ========================= */
  const handleAddRestaurant = async () => {
    await addRestaurant({
      name,
      email,
      phone,
      address,
      image_url: imageUrl,
      open_time: openTime || null,
      close_time: closeTime || null,
      commission_percentage: commission
        ? Number(commission)
        : null,
      hygiene_rating: Number(hygieneRating),
      status: "pending",
    });

    setShowAdd(false);
    resetForm();
    loadRestaurants();
  };

  /* =========================
     EDIT RESTAURANT
  ========================= */
  const handleEditClick = (res) => {
    setEditingId(res.id);
    setName(res.name || "");
    setEmail(res.email || "");
    setPhone(res.phone || "");
    setAddress(res.address || "");
    setImageUrl(res.image_url || "");
    setOpenTime(res.open_time || "");
    setCloseTime(res.close_time || "");
    setCommission(res.commission_percentage || "");
    setHygieneRating(res.hygiene_rating || 0);

    setShowEdit(true);
  };

  const handleUpdateRestaurant = async () => {
    await updateRestaurant(editingId, {
      name,
      email,
      phone,
      address,
      image_url: imageUrl,
      open_time: openTime || null,
      close_time: closeTime || null,
      commission_percentage: commission
        ? Number(commission)
        : null,
      hygiene_rating: Number(hygieneRating),
    });

    setShowEdit(false);
    resetForm();
    loadRestaurants();
  };

  /* =========================
     APPROVE / REJECT
  ========================= */
  const handleStatusChange = async (id, status) => {
    await updateRestaurantStatus(id, status);
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status } : r
      )
    );
  };

  /* =========================
     SEARCH + FILTER
  ========================= */
  const filteredRestaurants = restaurants.filter((r) => {
    const matchSearch = r.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" || r.status === filterStatus;

    return matchSearch && matchStatus;
  });

  if (loading) return <AdminLayout>Loading...</AdminLayout>;
  if (error)
    return (
      <AdminLayout>
        <p className="text-red-500">Failed to load restaurants</p>
      </AdminLayout>
    );

  /* =========================
     UI
  ========================= */
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search restaurant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Restaurant
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {(showAdd || showEdit) && (
        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {showAdd ? "Add Restaurant" : "Edit Restaurant"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border px-3 py-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <input type="time" className="border px-3 py-2 rounded" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            <input type="time" className="border px-3 py-2 rounded" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="Commission %" value={commission} onChange={(e) => setCommission(e.target.value)} />
            <input type="number" min="0" max="5" className="border px-3 py-2 rounded" placeholder="Hygiene Rating" value={hygieneRating} onChange={(e) => setHygieneRating(e.target.value)} />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={showAdd ? handleAddRestaurant : handleUpdateRestaurant}
              className="bg-blue-600 text-white px-5 py-2 rounded"
            >
              {showAdd ? "Save" : "Update"}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setShowEdit(false);
                resetForm();
              }}
              className="bg-gray-400 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Rating</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRestaurants.map((res) => (
              <tr key={res.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <img
                    src={res.image_url || "https://via.placeholder.com/60"}
                    alt={res.name}
                    className="w-14 h-14 rounded object-cover"
                  />
                </td>
                <td className="py-3 px-4 font-semibold">{res.name}</td>
                <td className="py-3 px-4">{res.phone}</td>
                <td className="py-3 px-4">⭐ {res.hygiene_rating}</td>
                <td className="py-3 px-4 capitalize">{res.status}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => handleEditClick(res)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  {res.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(res.id, "approved")}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(res.id, "rejected")}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
