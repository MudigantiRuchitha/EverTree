'use client';
import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight, Calculator, Building2, Percent, Clock } from 'lucide-react';
import EmiCalculator from '../../components/EmiCalculator';
import { serviceAPI } from '../../services/api';

const banks = [
    { name: 'HDFC Bank', rate: '8.40%', logo: '🏦', highlight: true },
    { name: 'State Bank of India', rate: '8.50%', logo: '🏛️', highlight: false },
    { name: 'ICICI Bank', rate: '8.75%', logo: '🏢', highlight: false },
    { name: 'Axis Bank', rate: '8.90%', logo: '🏗️', highlight: false },
];

export default function HomeLoanPage() {
    const [loanAmount, setLoanAmount] = useState('5000000');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [bankPreference, setBankPreference] = useState('HDFC Bank');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await serviceAPI.submitLead({
                service_type: 'loan',
                details: { name, phone, email, loanAmount, bankPreference }
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
                    Home Loan Partner Service
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                    Home Loan Referral & EMI
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                    Get the lowest interest rates from India's top banks with zero processing fee through Evertree
                </p>
            </div>

            {/* Partner Banks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {banks.map((bank, i) => (
                    <div key={i} className={`bg-white rounded-2xl border p-4 text-center shadow-xs transition-all ${bank.highlight ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200'}`}>
                        <div className="text-2xl sm:text-3xl mb-2">{bank.logo}</div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{bank.name}</div>
                        <div className="text-base sm:text-lg font-black text-emerald-600">{bank.rate}</div>
                        <div className="text-[10px] text-slate-400 font-medium">per annum</div>
                        {bank.highlight && (
                            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Best Rate</span>
                        )}
                    </div>
                ))}
            </div>

            {/* EMI Calculator + Application Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <EmiCalculator defaultPrincipal={Number(loanAmount)} />

                {/* Application Form */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Award className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Apply for Home Loan</h3>
                    </div>

                    {submitted ? (
                        <div className="text-center py-10 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
                            <p className="text-sm text-slate-500">Our loan advisor will contact you within 24 hours on the provided number.</p>
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
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                <input type="email" className={inputCls} placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loan Amount Required (₹)</label>
                                <input type="number" className={inputCls} value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preferred Bank</label>
                                <select className={inputCls} value={bankPreference} onChange={(e) => setBankPreference(e.target.value)}>
                                    <option value="HDFC Bank">HDFC Bank (8.40% p.a.)</option>
                                    <option value="State Bank of India (SBI)">State Bank of India — SBI</option>
                                    <option value="ICICI Bank">ICICI Bank</option>
                                    <option value="Axis Bank">Axis Bank</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 cursor-pointer mt-2"
                            >
                                Submit Loan Application <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: Percent, title: 'Lowest Rate Guarantee', desc: 'We compare 10+ lenders to get you the best deal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { icon: Clock, title: 'Fast Approval in 24 Hrs', desc: 'Dedicated loan officer to fast-track your sanction', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { icon: Building2, title: 'Zero Processing Fee', desc: 'No hidden charges — we earn commission from banks', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                ].map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${f.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-slate-900 mb-0.5">{f.title}</div>
                                <div className="text-xs text-slate-500">{f.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
