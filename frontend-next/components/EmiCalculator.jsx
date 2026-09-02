'use client';
import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

const EmiCalculator = ({ defaultPrincipal = 5000000 }) => {
    const [principal, setPrincipal] = useState(defaultPrincipal);
    const [rate, setRate] = useState(8.5);
    const [tenureYears, setTenureYears] = useState(20);
    const [emiDetails, setEmiDetails] = useState({
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0
    });

    useEffect(() => {
        calculateEmiLocal();
    }, [principal, rate, tenureYears]);

    const calculateEmiLocal = () => {
        const p = Number(principal);
        const r = Number(rate) / (12 * 100);
        const n = Number(tenureYears) * 12;

        if (p > 0 && r > 0 && n > 0) {
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPay = emi * n;
            setEmiDetails({
                monthlyEmi: Math.round(emi),
                totalInterest: Math.round(totalPay - p),
                totalPayment: Math.round(totalPay)
            });
        }
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val).toLocaleString('en-IN')}`;
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Loan EMI Calculator</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Sliders Form */}
                <div className="space-y-4 sm:space-y-5">
                    <div>
                        <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                            <span className="text-slate-500">Loan Amount</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(principal)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="500000" 
                            max="50000000" 
                            step="100000" 
                            value={principal} 
                            onChange={(e) => setPrincipal(e.target.value)}
                            className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                            <span className="text-slate-500">Interest Rate (% p.a.)</span>
                            <span className="text-slate-900 font-bold">{rate}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="6.5" 
                            max="15.0" 
                            step="0.1" 
                            value={rate} 
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                            <span className="text-slate-500">Tenure</span>
                            <span className="text-slate-900 font-bold">{tenureYears} Years</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            step="1" 
                            value={tenureYears} 
                            onChange={(e) => setTenureYears(e.target.value)}
                            className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>

                {/* Result Card */}
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-5 border border-slate-200 flex flex-col justify-center text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        ESTIMATED MONTHLY EMI
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-600 my-2">
                        {formatCurrency(emiDetails.monthlyEmi)}
                    </div>

                    <div className="space-y-2 border-t border-slate-200/80 pt-4 mt-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Principal Amount:</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(principal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Total Interest:</span>
                            <span className="text-amber-600 font-bold">{formatCurrency(emiDetails.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
                            <span className="text-slate-600 font-bold">Total Payment:</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(emiDetails.totalPayment)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmiCalculator;
