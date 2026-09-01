'use client';
import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight } from 'lucide-react';
import EmiCalculator from '../../components/EmiCalculator';
import { serviceAPI } from '../../services/api';

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

    return (
        <div className="container section-padding">
            <div className="section-header" style={{ maxWidth: '750px', margin: '0 auto 32px auto' }}>
                <span className="badge badge-gold" style={{ marginBottom: '8px' }}>Page 4 Service</span>
                <h1 style={{ fontSize: '2.2rem', color: '#0f172a' }}>Home Loan Referral Commission</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <EmiCalculator defaultPrincipal={Number(loanAmount)} />

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={20} color="var(--accent-gold)" /> Apply for Home Loan
                    </h3>
                    
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '20px 10px', color: '#059669' }}>
                            <CheckCircle2 size={40} style={{ marginBottom: '8px' }} />
                            <h3>Application Submitted!</h3>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" className="form-control" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" className="form-control" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Loan Amount (₹)</label>
                                <input type="number" className="form-control" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Bank Preference</label>
                                <select className="form-control" value={bankPreference} onChange={(e) => setBankPreference(e.target.value)}>
                                    <option value="HDFC Bank">HDFC Bank (8.40%)</option>
                                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                                    <option value="ICICI Bank">ICICI Bank</option>
                                    <option value="Axis Bank">Axis Bank</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.95rem', marginTop: '6px' }}>
                                Submit Application <ArrowRight size={14} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
