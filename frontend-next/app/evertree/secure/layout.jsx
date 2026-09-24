"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/evertree/secure",
      icon: "⌂",
    },
    {
      name: "Users",
      path: "/evertree/secure/users",
      icon: "♙",
    },
    {
      name: "Properties",
      path: "/evertree/secure/properties",
      icon: "⌂",
    },
    {
      name: "Approvals",
      path: "/evertree/secure/approvals",
      icon: "✓",
    },
    {
      name: "Messages",
      path: "/evertree/secure/messages",
      icon: "▱",
    },
    {
      name: "Settings",
      path: "/evertree/secure/settings",
      icon: "⚙",
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/evertree/secure/login");
  };

  const handleNavigation = (path) => {
    router.push(path);
    setSidebarOpen(false);
  };

  // Keep the admin login page separate.
  if (pathname === "/evertree/secure/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white">
              E
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                EverTree
              </h1>

              <p className="text-xs font-medium tracking-wide text-slate-500">
                ADMIN PANEL
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/evertree/secure" &&
                pathname.startsWith(item.path));

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="flex w-6 justify-center text-lg">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin information */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
              {user?.name || "Administrator"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <span className="text-lg">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open admin menu"
            >
              ☰
            </button>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                EverTree
              </p>

              <h2 className="text-lg font-bold text-slate-900">
                Administration
              </h2>
            </div>
          </div>

          {/* Admin profile */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}