"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login , logout } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCredentials((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!credentials.username || !credentials.password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const user = await login({
        identifier: credentials.username,
        password: credentials.password,
      });

      if (user?.role !== "admin") {
        logout();
        setError("You are not authorized to access the Admin Panel.");
        return;
      }

      router.push("/evertree/secure");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              EverTree Admin
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Secure Administration Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Username / Email
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Authorized EverTree administrators only
          </p>
        </div>
      </div>
    </main>
  );
}