'use client';
import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Palette, Sofa, Lightbulb, Star } from 'lucide-react';
import { serviceAPI } from '../../services/api';

const showcases = [
    {
        title: 'Modern Living Space',
        style: 'Scandinavian Oak & Natural Tones',
        img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
        tag: 'Trending'
    },
    {
        title: 'Modular Kitchen',
        style: 'German Hardware & Quartz Countertops',
        img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
        tag: 'Premium'
    },
    {
        title: 'Master Bedroom Suite',
        style: 'Ambient Lighting & Velvet Upholstery',
        img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0',
        tag: 'Luxury'
    },
];

const features = [
    { icon: Palette, title: '3D Visualisation', desc: 'Full 3D walkthroughs before execution begins', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { icon: Sofa, title: 'End-to-End Furniture', desc: 'Curated modular furniture & décor sourcing', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { icon: Lightbulb, title: 'Smart Lighting', desc: 'Mood-adaptive lighting & ambient design plans', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { icon: Star, title: '500+ Completed Homes', desc: 'Projects across Bengaluru, Hyderabad, Chennai', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];

export default function InteriorDesignPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bhk, setBhk] = useState('3 BHK');
    const [budget, setBudget] = useState('₹5 - 10 Lakhs');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await serviceAPI.submitLead({
                service_type: 'interior',
                details: { name, phone, bhk, budget }
            });
            setSubmitted(true);
        } catch (err) {
            alert('Submission failed');
        }
    };

    const inputCls = "w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

            {/* Page Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Interior Design Service
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                    Interior Design & 3D Showcase
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                    Transform your new home with award-winning interior designers. 3D preview before a single nail goes in.
                </p>
            </div>

            {/* Design Showcase Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {showcases.map((s, idx) => (
                    <div key={idx} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                            <img
                                src={s.img}
                                alt={s.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 shadow-xs">
                                {s.tag}
                            </span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{s.title}</h3>
                            <div className="text-xs text-slate-500">{s.style}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${f.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="font-bold text-sm text-slate-900 mb-1">{f.title}</div>
                            <div className="text-xs text-slate-500">{f.desc}</div>
                        </div>
                    );
                })}
            </div>

            {/* Consultation Request Form */}
            <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1 text-center">
                        Request Free 3D Design Consultation
                    </h3>
                    <p className="text-xs text-slate-500 text-center mb-6">
                        Our designer will prepare a free mood board & rough estimate for your space
                    </p>

                    {submitted ? (
                        <div className="text-center py-8 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Consultation Booked!</h3>
                            <p className="text-sm text-slate-500">Our interior designer will call you within 2 business hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                    <input type="text" className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                                    <input type="tel" className={inputCls} placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Layout</label>
                                    <select className={inputCls} value={bhk} onChange={(e) => setBhk(e.target.value)}>
                                        <option value="2 BHK">2 BHK Apartment</option>
                                        <option value="3 BHK">3 BHK Apartment</option>
                                        <option value="4 BHK Villa">4 BHK Villa</option>
                                        <option value="Commercial Space">Commercial Space</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estimated Budget</label>
                                    <select className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)}>
                                        <option value="₹3 - 5 Lakhs">₹3 – 5 Lakhs</option>
                                        <option value="₹5 - 10 Lakhs">₹5 – 10 Lakhs</option>
                                        <option value="₹10+ Lakhs">₹10+ Lakhs (Premium)</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                            >
                                Get Free Design Estimate <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
