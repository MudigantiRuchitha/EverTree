"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { authAPI } from "../../../../services/api";

export default function AdminSettingsPage() {
const router = useRouter();
const { user, loading, logout } = useAuth();

const [showPasswordForm, setShowPasswordForm] = useState(false);
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [passwordLoading, setPasswordLoading] = useState(false);
const [passwordMessage, setPasswordMessage] = useState("");
const [passwordError, setPasswordError] = useState("");

useEffect(() => {
if (loading) return;


if (!user || user.role !== "admin") {
  router.replace("/evertree/secure/login");
}


}, [user, loading, router]);

const handleChangePassword = async (e) => {
e.preventDefault();


setPasswordMessage("");
setPasswordError("");

if (!currentPassword || !newPassword || !confirmPassword) {
  setPasswordError("Please fill in all password fields.");
  return;
}

if (newPassword.length < 8) {
  setPasswordError("New password must be at least 8 characters long.");
  return;
}

if (newPassword !== confirmPassword) {
  setPasswordError("New passwords do not match.");
  return;
}

setPasswordLoading(true);

try {
  const response = await authAPI.changePassword({
    currentPassword,
    newPassword,
  });

  setPasswordMessage(
    response.data?.message || "Password changed successfully."
  );

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");
} catch (error) {
  setPasswordError(
    error.response?.data?.error ||
      "Failed to change password. Please try again."
  );
} finally {
  setPasswordLoading(false);
}


};

if (loading) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-950"> <p className="text-white">Loading Settings...</p> </main>
);
}

if (!user || user.role !== "admin") {
return null;
}

return ( <main className="min-h-screen bg-slate-950 p-6 sm:p-8"> <div className="mx-auto max-w-5xl">


    <div className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
        Administration
      </p>

      <h1 className="mt-1 text-3xl font-bold text-white">
        Settings
      </h1>

      <p className="mt-2 text-slate-400">
        Manage your administrator account and security.
      </p>
    </div>

    {/* Account Information */}
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
          {(user.name || "A").charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Administrator Account
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Your current EverTree administrator account
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Name
          </p>

          <p className="mt-2 rounded-xl bg-slate-800 px-4 py-3 text-white">
            {user.name || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Email
          </p>

          <p className="mt-2 rounded-xl bg-slate-800 px-4 py-3 text-white">
            {user.email || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Phone
          </p>

          <p className="mt-2 rounded-xl bg-slate-800 px-4 py-3 text-white">
            {user.phone || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Role
          </p>

          <p className="mt-2 rounded-xl bg-slate-800 px-4 py-3 font-semibold uppercase text-emerald-400">
            {user.role || "admin"}
          </p>
        </div>
      </div>
    </section>

    {/* Security */}
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-xl font-semibold text-white">
          Security
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Manage your account security.
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-slate-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">
              Password
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Your password is securely stored by the backend.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowPasswordForm((previous) => !previous);
              setPasswordMessage("");
              setPasswordError("");
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={handleChangePassword}
            className="mt-5 border-t border-slate-700 pt-5"
          >
            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              {passwordError && (
                <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-400">
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading
                  ? "Changing Password..."
                  : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>

    {/* Session */}
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-xl font-semibold text-white">
          Session
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Manage your current administrator session.
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-800 p-5">
        <div>
          <p className="font-medium text-white">
            Sign out
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Sign out of the EverTree admin panel.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </section>

  </div>
</main>


);
}
