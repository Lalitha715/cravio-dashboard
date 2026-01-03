// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { gql, useQuery, useMutation } from "@apollo/client";

// ============================
// GraphQL
// ============================
const GET_SETTINGS = gql`
  query GetSettings {
    admin_settings(limit: 1) {
      id
      app_name
      support_email
      support_phone
      default_currency
      tax_percentage
      commission_percentage
    }
  }
`;

const ADD_SETTINGS = gql`
  mutation AddSettings(
    $app_name: String!
    $support_email: String!
    $support_phone: String!
    $default_currency: String!
    $tax_percentage: numeric!
    $commission_percentage: numeric!
  ) {
    insert_admin_settings_one(
      object: {
        app_name: $app_name
        support_email: $support_email
        support_phone: $support_phone
        default_currency: $default_currency
        tax_percentage: $tax_percentage
        commission_percentage: $commission_percentage
      }
    ) {
      id
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings(
    $id: uuid!
    $app_name: String!
    $support_email: String!
    $support_phone: String!
    $default_currency: String!
    $tax_percentage: numeric!
    $commission_percentage: numeric!
  ) {
    update_admin_settings_by_pk(
      pk_columns: { id: $id }
      _set: {
        app_name: $app_name
        support_email: $support_email
        support_phone: $support_phone
        default_currency: $default_currency
        tax_percentage: $tax_percentage
        commission_percentage: $commission_percentage
      }
    ) {
      id
    }
  }
`;

// ============================
// Component
// ============================
export default function Settings() {
  const { data, loading, error, refetch } = useQuery(GET_SETTINGS);
  const [addSettings] = useMutation(ADD_SETTINGS);
  const [updateSettings] = useMutation(UPDATE_SETTINGS);

  const [settings, setSettings] = useState({
    id: null,
    app_name: "",
    support_email: "",
    support_phone: "",
    default_currency: "",
    tax_percentage: "",
    commission_percentage: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Load settings
  useEffect(() => {
    if (data?.admin_settings?.length > 0) {
      const s = data.admin_settings[0];
      setSettings({
        id: s.id,
        app_name: s.app_name || "",
        support_email: s.support_email || "",
        support_phone: s.support_phone || "",
        default_currency: s.default_currency || "",
        tax_percentage: s.tax_percentage || "",
        commission_percentage: s.commission_percentage || "",
      });
    }
  }, [data]);

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      if (settings.id) {
        // Update existing settings
        await updateSettings({
          variables: {
            id: settings.id,
            app_name: settings.app_name,
            support_email: settings.support_email,
            support_phone: settings.support_phone,
            default_currency: settings.default_currency,
            tax_percentage: Number(settings.tax_percentage),
            commission_percentage: Number(settings.commission_percentage),
          },
        });
      } else {
        // Insert new settings
        const res = await addSettings({
          variables: {
            app_name: settings.app_name,
            support_email: settings.support_email,
            support_phone: settings.support_phone,
            default_currency: settings.default_currency,
            tax_percentage: Number(settings.tax_percentage),
            commission_percentage: Number(settings.commission_percentage),
          },
        });
        setSettings((prev) => ({ ...prev, id: res.data.insert_admin_settings_one.id }));
      }

      await refetch();
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="ml-64 mt-6">Loading settings...</p>;
  if (error) return <p className="ml-64 mt-6 text-red-500">Failed to fetch settings</p>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

      <form className="max-w-xl space-y-4" onSubmit={handleSave}>
        <div>
          <label className="block font-semibold">App Name</label>
          <input
            type="text"
            value={settings.app_name}
            onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Support Email</label>
          <input
            type="email"
            value={settings.support_email}
            onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Support Phone</label>
          <input
            type="text"
            value={settings.support_phone}
            onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Default Currency</label>
          <input
            type="text"
            value={settings.default_currency}
            onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Tax Percentage</label>
          <input
            type="number"
            value={settings.tax_percentage}
            onChange={(e) => setSettings({ ...settings, tax_percentage: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Commission Percentage</label>
          <input
            type="number"
            value={settings.commission_percentage}
            onChange={(e) =>
              setSettings({ ...settings, commission_percentage: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {saveError && <p className="text-red-500">{saveError}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </AdminLayout>
  );
}
