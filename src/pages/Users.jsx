// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchUsers } from "../api/hasura";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // =========================
  // Highlight function
  // =========================
  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // =========================
  // Filter & Search logic
  // =========================
  useEffect(() => {
    let filtered = [...users];

    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(lower) ||
          (u.email?.toLowerCase() || "").includes(lower) ||
          (u.phone || "").includes(lower)
      );
    }

    if (filterRole) {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    if (filterActive) {
      filtered = filtered.filter(
        (u) => (filterActive === "active" ? u.is_active : !u.is_active)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchText, filterRole, filterActive]);

  if (loading) return <AdminLayout>Loading Users...</AdminLayout>;

  if (error)
    return (
      <AdminLayout>
        <p className="text-red-500">Failed to load users</p>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name, or phone..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-auto max-h-[70vh] bg-white shadow rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-lg">Name</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Active</th>
                <th className="py-3 px-4 text-left">Created At</th>
                <th className="py-3 px-4 text-left rounded-tr-lg">Updated At</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">
                    {highlightText(user.name || "-", searchText)}
                  </td>
                  <td className="py-3 px-4">
                    {user.addresses && user.addresses.length > 0
                      ? `${user.addresses[0].address_line}, ${user.addresses[0].state} - ${user.addresses[0].pincode}`
                      : "-"}
                  </td>
                  <td className="py-3 px-4">{highlightText(user.phone || "-", searchText)}</td>
                  <td className="py-3 px-4">{highlightText(user.role || "-", searchText)}</td>
                  <td className="py-3 px-4">{user.is_active ? "Yes" : "No"}</td>
                  <td className="py-3 px-4">
                    {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {user.updated_at ? new Date(user.updated_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
