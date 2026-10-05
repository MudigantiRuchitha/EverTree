"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { adminAPI, adAPI } from "../../../services/api";
import AnimatedAdsBanner from "../../../components/AnimatedAdsBanner";
import TopAdTicker from "../../../components/TopAdTicker";
import SpotlightAdCard from "../../../components/SpotlightAdCard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [overview, setOverview] = useState(null);
  const [adsCount, setAdsCount] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "admin") {
      router.replace("/evertree/secure/login");
      return;
    }

    const fetchOverview = async () => {
      try {
        setDashboardLoading(true);
        setError("");

        const [response, adsResponse] = await Promise.allSettled([
          adminAPI.getOverview(),
          adAPI.getAds()
        ]);

        if (response.status === "fulfilled") {
          console.log("Admin overview response:", response.value.data);
          setOverview(response.value.data);
        }

        if (adsResponse.status === "fulfilled") {
          setAdsCount(adsResponse.value.data?.length || 0);
        }
      } catch (err) {
        console.error("Failed to load admin overview:", err);

        if (
          err?.response?.status === 401 ||
          err?.response?.status === 403
        ) {
          router.replace("/evertree/secure/login");
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchOverview();
  }, [user, loading, router]);

  if (loading || dashboardLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-white">
          Loading Admin Dashboard...
        </p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const users = overview?.users || {};
  const properties = overview?.properties || {};

  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Dashboard heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            EverTree Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Welcome, {user.name}
          </p>
        </div>

        {/* Top Animated Deal Ticker */}
        <div className="mb-8">
          <TopAdTicker className="rounded-2xl border border-slate-800" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Statistics */}
        {overview && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              {/* Total Users */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <p className="text-sm font-medium text-slate-400">
                  Total Users
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {users.total_users ?? 0}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  All registered users
                </p>
              </div>

              {/* Pending Users */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <p className="text-sm font-medium text-slate-400">
                  Pending Users
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {users.pending_users ?? 0}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Awaiting admin approval
                </p>
              </div>

              {/* Total Properties */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <p className="text-sm font-medium text-slate-400">
                  Total Properties
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {properties.total_properties ?? 0}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  All listed properties
                </p>
              </div>

              {/* Pending Properties */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <p className="text-sm font-medium text-slate-400">
                  Pending Properties
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {properties.pending_properties ?? 0}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Awaiting admin review
                </p>
              </div>

              {/* Advertisements */}
              <Link href="/evertree/secure/ads" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all block group">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    Active Ads
                  </p>
                  <span className="text-xs text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                    Manage &rarr;
                  </span>
                </div>

                <p className="mt-3 text-4xl font-bold text-white">
                  {adsCount}
                </p>

                <p className="mt-2 text-xs text-emerald-400">
                  Reflected on Dashboard
                </p>
              </Link>

            </div>

            {/* User & Property Breakdown + Spotlight Ad Card (Distributed Placement) */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-lg font-semibold text-white">
                  User Overview
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-4">

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Buyers
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {users.buyers ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Sellers
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {users.sellers ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Brokers
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {users.brokers ?? 0}
                    </p>
                  </div>

                </div>
              </div>

              {/* Property breakdown */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-lg font-semibold text-white">
                  Property Overview
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Approved
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {properties.approved_properties ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Rejected
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {properties.rejected_properties ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Sold
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {properties.sold_properties ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="text-xs text-slate-400">
                      Rented
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {properties.rented_properties ?? 0}
                    </p>
                  </div>

                </div>
              </div>

              {/* Col 3: Animated Partner Privilege Spotlight */}
              <div className="flex flex-col justify-between">
                <SpotlightAdCard className="h-full" />
              </div>

            </div>

            {/* Bottom Place: Full Animated Showcase Banner */}
            <div className="mt-10">
              <AnimatedAdsBanner variant="dark" showManageLink={true} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}