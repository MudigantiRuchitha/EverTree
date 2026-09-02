'use client';
import React from 'react';
import Link from 'next/link';
import { Building2, Phone, Mail, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8 text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    
                    {/* Brand Col */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-xs">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="font-bold text-xl text-slate-900 tracking-tight">
                                evertree<span className="text-emerald-600">.in</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            India's premier legal verified real estate portal. Connect directly with certified sellers & brokers.
                        </p>
                        <div className="flex gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Buy</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Sell</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Rent</span>
                        </div>
                    </div>

                    {/* Services Col */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Services</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/loan" className="hover:text-emerald-600 transition-colors">Home Loans & EMI</Link>
                            </li>
                            <li>
                                <Link href="/legal" className="hover:text-emerald-600 transition-colors">Legal Verification</Link>
                            </li>
                            <li>
                                <Link href="/interior" className="hover:text-emerald-600 transition-colors">Interior Design</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories Col */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Categories</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li className="hover:text-slate-800">Apartments & Flats</li>
                            <li className="hover:text-slate-800">Villas & Independent Houses</li>
                            <li className="hover:text-slate-800">Commercial Offices & Plots</li>
                            <li className="hover:text-slate-800">Agricultural Land</li>
                        </ul>
                    </div>

                    {/* Support Col */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Contact & Support</h4>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>+91 1800-EVERTREE</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>support@evertree.in</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                                Available Mon - Sat, 9:00 AM - 7:00 PM IST
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div>&copy; {new Date().getFullYear()} Evertree Real Estate Technologies Pvt Ltd. All rights reserved.</div>
                    <div className="flex items-center gap-1.5">
                        Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for verified real estate
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
