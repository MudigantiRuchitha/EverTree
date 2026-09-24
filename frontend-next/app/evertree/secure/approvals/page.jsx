"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "../../../../services/api";

export default function AdminApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminAPI.getPendingUsers();

      console.log("Pending users response:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load pending users:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load pending users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");

      await adminAPI.approveUser(userId);

      await fetchPendingUsers();
    } catch (err) {
      console.error("Failed to approve user:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to approve user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");

      await adminAPI.rejectUser(userId, "Rejected by admin");

      await fetchPendingUsers();
    } catch (err) {
      console.error("Failed to reject user:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to reject user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          User Approvals
        </h1>

        <p className="mt-4 text-gray-500">
          Loading pending users...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          User Approvals
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review users waiting for admin verification
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            No pending users
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are currently no users waiting for approval.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Verification ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {user.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.email || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.phone || "-"}
                    </td>

                    <td className="px-5 py-4 capitalize">
                      {user.role || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {user.verification_id || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        {user.approval_status || "pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading === user.id
                            ? "Updating..."
                            : "Approve"}
                        </button>

                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
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