"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { adminAPI } from "../../../../services/api";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "admin") {
      router.replace("/evertree/secure/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        setPageLoading(true);
        setError("");

        const response = await adminAPI.getUsers();

        console.log("Admin users response:", response.data);

        const data = response.data;

        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data?.users)) {
          setUsers(data.users);
        } else if (Array.isArray(data?.data)) {
          setUsers(data.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Failed to load users:", err);

        if (
          err?.response?.status === 401 ||
          err?.response?.status === 403
        ) {
          router.replace("/evertree/secure/login");
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load users."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchUsers();
  }, [user, loading, router]);

  if (loading || pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-white">Loading Users...</p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const filteredUsers = users.filter((currentUser) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      currentUser?.name?.toLowerCase().includes(searchText) ||
      currentUser?.email?.toLowerCase().includes(searchText) ||
      currentUser?.phone?.toLowerCase().includes(searchText) ||
      currentUser?.verification_id
        ?.toLowerCase()
        .includes(searchText);

    const matchesRole =
      roleFilter === "all" ||
      currentUser?.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      currentUser?.approval_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Users
          </h1>

          <p className="mt-2 text-slate-400">
            Manage registered EverTree users and their approval status.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Search users
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Role
              </label>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="broker">Broker</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Approval Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending_admin_verification">
                  Pending
                </option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

          </div>
        </div>

        {/* User count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {users.length}
            </span>{" "}
            users
          </p>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-slate-800 bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Verification
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((currentUser) => (
                    <tr
                      key={currentUser.id}
                      className="transition hover:bg-slate-800/50"
                    >
                      {/* User */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-white">
                            {currentUser.name || "Unknown"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {currentUser.email || "No email"}
                          </p>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-5 text-sm text-slate-300">
                        {currentUser.phone || "—"}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
                          {currentUser.role || "—"}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm text-slate-300">
                            {currentUser.verification_id || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {currentUser.email_verified
                              ? "Email verified"
                              : "Email not verified"}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            currentUser.approval_status === "approved"
                              ? "bg-emerald-950 text-emerald-400"
                              : currentUser.approval_status ===
                                "rejected"
                              ? "bg-red-950 text-red-400"
                              : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {currentUser.approval_status ===
                          "pending_admin_verification"
                            ? "Pending"
                            : currentUser.approval_status || "Unknown"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-5 text-sm text-slate-400">
                        {currentUser.created_at
                          ? new Date(
                              currentUser.created_at
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-lg font-semibold text-slate-300">
                        No users found
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        There are no users matching the selected filters.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}