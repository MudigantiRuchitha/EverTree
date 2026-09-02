'use client';
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, FileText, Scale, Stamp } from 'lucide-react';
import { serviceAPI } from '../../services/api';

const services = [
    {
        id: 'title_search',
        title: 'Property Title Verification',
        desc: '30-year encumbrance search & complete advocate report with clear title opinion.',
        icon: FileText,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
        id: 'agreement_drafting',
        title: 'Sale Agreement Drafting',
        desc: 'Legally binding custom sale agreements, lease deeds & MoU prepared by chartered advocates.',
        icon: Scale,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
        id: 'registration_assistance',
        title: 'Sub-Registrar Registration',
        desc: 'Stamp duty calculation, document preparation & slot booking at the Sub-Registrar Office.',
        icon: Stamp,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
];

export default function LegalServicesPage() {
    const [serviceRequired, setServiceRequired] = useState('title_search');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [propertyDetails, setPropertyDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await serviceAPI.submitLead({
                service_type: 'legal',
                details: { name, phone, serviceRequired, propertyDetails }
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Legal Services
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                    Property Legal Services
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                    Certified advocates and legal experts ensuring your property transaction is 100% protected
                </p>
            </div>

            {/* Services Grid + Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">

                {/* Service Cards */}
                <div className="space-y-4">
                    {services.map(s => {
                        const Icon = s.icon;
                        const active = serviceRequired === s.id;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setServiceRequired(s.id)}
                                className={`w-full text-left bg-white rounded-2xl border p-4 sm:p-6 flex items-start gap-4 shadow-xs transition-all cursor-pointer ${
                                    active ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shrink-0 ${s.color}`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{s.title}</h3>
                                        {active && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                                </div>
                            </button>
                        );
                    })}

                    {/* Trust Badges */}
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 sm:p-5 space-y-2.5">
                        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Why Legal Verification Matters</h4>
                        {[
                            'Prevents fraudulent property sales & double registrations',
                            'Clears encumbrances, loans & mortgages on title',
                            'Ensures rightful ownership before payment',
                        ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-emerald-600 shrink-0" />
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Consultation Request Form */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs sticky top-24">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 text-center">Request Legal Review</h3>

                    {submitted ? (
                        <div className="text-center py-10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Request Sent!</h3>
                            <p className="text-sm text-slate-500">Our legal team will reach out to you within 4 business hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                <input type="text" className={inputCls} placeholder="Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                                <input type="tel" className={inputCls} placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Service Required</label>
                                <select className={inputCls} value={serviceRequired} onChange={(e) => setServiceRequired(e.target.value)}>
                                    <option value="title_search">Property Title Search</option>
                                    <option value="agreement_drafting">Sale Agreement Drafting</option>
                                    <option value="registration_assistance">Sub-Registrar Registration</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Details (Optional)</label>
                                <textarea
                                    rows={3}
                                    className={inputCls}
                                    placeholder="City, Survey number, district, property type..."
                                    value={propertyDetails}
                                    onChange={(e) => setPropertyDetails(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                            >
                                Book Free Consultation <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
