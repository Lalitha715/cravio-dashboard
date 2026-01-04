// src/pages/Delivery.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { gql, useQuery, useMutation } from "@apollo/client";

const GET_DELIVERY_BOYS = gql`
  query GetDeliveryBoys {
    delivery_boys(order_by: { created_at: desc }) {
      id
      name
      phone
      status
      created_at
    }
  }
`;

const ADD_DELIVERY_BOY = gql`
  mutation AddDeliveryBoy($object: delivery_boys_insert_input!) {
    insert_delivery_boys_one(object: $object) {
      id
      name
      phone
      status
      created_at
    }
  }
`;

const UPDATE_DELIVERY_STATUS = gql`
  mutation UpdateDeliveryStatus($id: uuid!, $status: String!) {
    update_delivery_boys_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
    }
  }
`;

const DELETE_DELIVERY_BOY = gql`
  mutation DeleteDeliveryBoy($id: uuid!) {
    delete_delivery_boys_by_pk(id: $id) {
      id
    }
  }
`;

export default function Delivery() {
  const { data, loading, error, refetch } = useQuery(GET_DELIVERY_BOYS);
  const [addDeliveryBoy] = useMutation(ADD_DELIVERY_BOY);
  const [updateStatus] = useMutation(UPDATE_DELIVERY_STATUS);
  const [deleteBoy] = useMutation(DELETE_DELIVERY_BOY);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!data?.delivery_boys) return;

    let filtered = [...data.delivery_boys];
    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.phone.includes(search)
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }
    setDeliveryBoys(filtered);
  }, [data, search, filterStatus]);

  const handleAdd = async () => {
    if (!name || !phone) {
      alert("Name and Phone are required");
      return;
    }
    await addDeliveryBoy({
      variables: { object: { name, phone, status } },
    });
    setShowAdd(false);
    setName("");
    setPhone("");
    setStatus("active");
    refetch();
  };

  const handleStatus = async (id, newStatus) => {
    await updateStatus({ variables: { id, status: newStatus } });
    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this delivery boy?")) {
      await deleteBoy({ variables: { id } });
      refetch();
    }
  };

  if (loading) return <p className="ml-60 mt-6">Loading delivery boys...</p>;
  if (error)
    return (
      <p className="ml-60 mt-6 text-red-500">Error loading delivery boys</p>
    );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Delivery Boys</h1>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Delivery Boy
        </button>
      </div>

      {/* Add Delivery Boy Form */}
      {showAdd && (
        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Delivery Boy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border rounded px-3 py-2"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delivery Boys Table */}
      <div className="overflow-auto max-h-[70vh] bg-white shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created At</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveryBoys.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50 text-center">
                <td className="p-3">{d.name}</td>
                <td className="p-3">{d.phone}</td>
                <td className="p-3 font-semibold">
                      {d.status === "active" ? "Active" : "Inactive"}
                  </td>
                <td className="p-3">{new Date(d.created_at).toLocaleString()}</td>
                <td className="p-3 space-x-2">
                  {d.status !== "active" && (
                    <button
                      onClick={() => handleStatus(d.id, "active")}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Activate
                    </button>
                  )}
                  {d.status !== "inactive" && (
                    <button
                      onClick={() => handleStatus(d.id, "inactive")}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Deactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {deliveryBoys.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No delivery boys found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
