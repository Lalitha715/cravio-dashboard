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

  // Filter & Search logic
  useEffect(() => {
    let filtered = [...users];

    // Search by name or email or phone
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          (u.phone && u.phone.includes(lower))
      );
    }

    // Filter by role
    if (filterRole) {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    // Filter by active status
    if (filterActive) {
      filtered = filtered.filter(
        (u) => (filterActive === "active" ? u.is_active : !u.is_active)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchText, filterRole, filterActive]);

  if (loading) return <p className="ml-64 mt-6">Loading users...</p>;
  if (error) return <p className="ml-64 mt-6 text-red-500">Failed to load users</p>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
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
          {/* Add more roles if needed */}
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
        <div className="overflow-auto max-h-[70vh]">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Active</th>
                <th className="py-3 px-4 text-left">Created At</th>
                <th className="py-3 px-4 text-left">Updated At</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phone || "-"}</td>
                  <td className="py-3 px-4">{user.role}</td>
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
