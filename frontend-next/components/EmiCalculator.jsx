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
        <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(217, 119, 6, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Calculator size={18} color="var(--accent-gold)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Loan EMI Calculator</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* Sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                            <span>Loan Amount</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>{formatCurrency(principal)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="500000" 
                            max="50000000" 
                            step="100000" 
                            value={principal} 
                            onChange={(e) => setPrincipal(e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--primary-emerald)' }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                            <span>Interest Rate (% p.a.)</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>{rate}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="6.5" 
                            max="15.0" 
                            step="0.1" 
                            value={rate} 
                            onChange={(e) => setRate(e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                            <span>Tenure</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>{tenureYears} Years</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            step="1" 
                            value={tenureYears} 
                            onChange={(e) => setTenureYears(e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
                        />
                    </div>
                </div>

                {/* Result Card */}
                <div style={{
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        MONTHLY EMI
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-primary)',
                        fontSize: '1.8rem',
                        fontWeight: '800',
                        color: 'var(--primary-emerald)',
                        margin: '4px 0 12px 0'
                    }}>
                        {formatCurrency(emiDetails.monthlyEmi)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Principal:</span>
                            <span style={{ color: '#0f172a' }}>{formatCurrency(principal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Interest:</span>
                            <span style={{ color: 'var(--accent-gold)' }}>{formatCurrency(emiDetails.totalInterest)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmiCalculator;
