'use client';

import Link from 'next/link';
import {
    Building2,
    Users,
    MessageSquare,
    Bell,
    PlusCircle,
    ArrowRight
} from 'lucide-react';

export default function SellerDashboard() {

    return (
        <main className="min-h-screen bg-slate-50">

            {/* HEADER */}
            <section className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    <p className="text-sm font-semibold text-emerald-600">
                        SELLER PORTAL
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Welcome back 👋
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Manage your properties and stay connected with interested buyers.
                    </p>

                </div>
            </section>


            {/* DASHBOARD */}
            <section className="max-w-7xl mx-auto px-6 py-8">

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <Building2 className="w-7 h-7 text-emerald-600" />

                        <p className="mt-4 text-sm text-slate-500">
                            My Listings
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-slate-900">
                            0
                        </h2>
                    </div>


                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <Users className="w-7 h-7 text-blue-600" />

                        <p className="mt-4 text-sm text-slate-500">
                            Buyer Requests
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-slate-900">
                            0
                        </h2>
                    </div>


                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <MessageSquare className="w-7 h-7 text-purple-600" />

                        <p className="mt-4 text-sm text-slate-500">
                            Messages
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-slate-900">
                            0
                        </h2>
                    </div>


                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <Bell className="w-7 h-7 text-amber-600" />

                        <p className="mt-4 text-sm text-slate-500">
                            Notifications
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-slate-900">
                            0
                        </h2>
                    </div>

                </div>


                {/* QUICK ACTIONS */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-white rounded-2xl border border-slate-200 p-7">

                        <h2 className="text-xl font-bold text-slate-900">
                            Manage Your Properties
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Add new properties or manage properties that you have already listed.
                        </p>

                        <div className="mt-6 flex gap-3 flex-wrap">

                            <Link
                                href="/add-property"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Post Property
                            </Link>

                            <Link
                                href="/my-listing"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                            >
                                My Listings
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                        </div>

                    </div>


                    <div className="bg-white rounded-2xl border border-slate-200 p-7">

                        <h2 className="text-xl font-bold text-slate-900">
                            Buyer Activity
                        </h2>

                        <p className="mt-2 text-slate-500">
                            See buyers who are interested in your properties and respond to their requests.
                        </p>

                        <div className="mt-6 flex gap-3">

                            <Link
                                href="/buyer-requests"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                                <Users className="w-5 h-5" />
                                Buyer Requests
                            </Link>

                            <Link
                                href="/messages"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Messages
                            </Link>

                        </div>

                    </div>

                </div>


                {/* RECENT REQUESTS */}
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-7">

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Recent Buyer Requests
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Buyers interested in your properties will appear here.
                            </p>
                        </div>

                        <Link
                            href="/buyer-requests"
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                            View all
                        </Link>

                    </div>

                    <div className="mt-6 py-12 text-center border border-dashed border-slate-300 rounded-xl">

                        <Users className="w-10 h-10 mx-auto text-slate-300" />

                        <p className="mt-3 font-semibold text-slate-600">
                            No buyer requests yet
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Buyer enquiries will appear here.
                        </p>

                    </div>

                </div>

            </section>

        </main>
    );
}