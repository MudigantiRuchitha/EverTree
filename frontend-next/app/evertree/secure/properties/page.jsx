"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "../../../../services/api";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminAPI.getProperties();
      console.log("Admin properties response:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setProperties(data);
      } else if (Array.isArray(data.properties)) {
        setProperties(data.properties);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleStatusChange = async (propertyId, status) => {
    try {
      setActionLoading(propertyId);
      setError("");

      await adminAPI.updatePropertyStatus(
        propertyId,
        status,
        status === "rejected" ? "Rejected by admin" : ""
      );

      await fetchProperties();
    } catch (err) {
      console.error("Failed to update property status:", err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to update property status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <p className="mt-4 text-gray-500">
          Loading properties...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Properties
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage properties submitted to EverTree
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            No properties found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are currently no properties in the database.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4 font-medium">
                      {property.title || "Untitled"}
                    </td>

                    <td className="px-5 py-4">
                      {property.city || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {property.price ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      {property.property_type || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          property.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : property.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {property.status || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {property.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusChange(
                                property.id,
                                "approved"
                              )
                            }
                            disabled={actionLoading === property.id}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading === property.id
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            onClick={() =>
                              handleStatusChange(
                                property.id,
                                "rejected"
                              )
                            }
                            disabled={actionLoading === property.id}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}