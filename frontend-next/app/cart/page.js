'use client';

import Link from 'next/link';
import { ArrowRight, Search, ShoppingCart } from 'lucide-react';

export default function CartPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-xs sm:px-10">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <ShoppingCart className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Your cart is empty</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Browse verified properties and add the ones you want to compare or enquire about.
                </p>
                <Link
                    href="/search"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                >
                    <Search className="h-4 w-4" />
                    Find Properties
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </main>
    );
}
