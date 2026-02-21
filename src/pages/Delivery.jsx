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
      is_active
      created_at
    }
  }
`;

const ADD_DELIVERY_BOY = gql`
  mutation AddDeliveryBoy($object: delivery_boys_insert_input!) {
    insert_delivery_boys_one(object: $object) {
      id
    }
  }
`;

const UPDATE_DELIVERY_STATUS = gql`
  mutation UpdateDeliveryStatus($id: uuid!, $is_active: Boolean!) {
    update_delivery_boys_by_pk(
      pk_columns: { id: $id }
      _set: { is_active: $is_active }
    ) {
      id
      is_active
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

    if (filterStatus === "active") {
      filtered = filtered.filter((d) => d.is_active === true);
    }

    if (filterStatus === "inactive") {
      filtered = filtered.filter((d) => d.is_active === false);
    }

    setDeliveryBoys(filtered);
  }, [data, search, filterStatus]);

  const handleAdd = async () => {
    if (!name || !phone) {
      alert("Name and Phone are required");
      return;
    }

    await addDeliveryBoy({
      variables: {
        object: {
          name,
          phone,
          is_active: true,
        },
      },
    });

    setShowAdd(false);
    setName("");
    setPhone("");
    refetch();
  };

  const handleStatus = async (id, newStatus) => {
    await updateStatus({
      variables: {
        id,
        is_active: newStatus,
      },
    });

    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this delivery boy?")) {
      await deleteBoy({ variables: { id } });
      refetch();
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Delivery Boys</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error loading delivery boys</p>}

      {!loading && !error && (
        <>
          {/* Search + Filter */}
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
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={() => setShowAdd(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Delivery Boy
            </button>
          </div>

          {/* Add Form */}
          {showAdd && (
            <div className="bg-white border p-6 mb-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">
                Add Delivery Boy
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  className="border px-3 py-2 rounded"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="border px-3 py-2 rounded"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 text-white px-5 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="bg-gray-400 text-white px-5 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-auto bg-white shadow rounded">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {deliveryBoys.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3">{d.name}</td>
                    <td className="p-3">{d.phone}</td>
                    <td className="p-3 font-semibold">
                      {d.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="p-3">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 space-x-2">
                      {!d.is_active && (
                        <button
                          onClick={() => handleStatus(d.id, true)}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Activate
                        </button>
                      )}

                      {d.is_active && (
                        <button
                          onClick={() => handleStatus(d.id, false)}
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
        </>
      )}
    </AdminLayout>
  );
}