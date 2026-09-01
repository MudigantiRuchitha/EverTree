'use client';
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { serviceAPI } from '../../services/api';

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

    const services = [
        { id: 'title_search', title: 'Property Title Verification', desc: '30-year encumbrance search & advocate report.' },
        { id: 'agreement_drafting', title: 'Sale Agreement Drafting', desc: 'Custom binding sale agreements & lease deeds.' },
        { id: 'registration_assistance', title: 'Sub-Registrar Registration', desc: 'Stamp duty calculation & slot booking.' }
    ];

    return (
        <div className="container section-padding">
            <div className="section-header" style={{ maxWidth: '750px', margin: '0 auto 32px auto' }}>
                <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Page 4 Service</span>
                <h1 style={{ fontSize: '2.2rem', color: '#0f172a' }}>Property Legal Services</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {services.map(s => (
                        <div key={s.id} className="glass-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <ShieldCheck size={20} color="var(--primary-emerald)" />
                                <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{s.title}</h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '14px' }}>Request Legal Review</h3>

                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '20px 10px', color: '#059669' }}>
                            <CheckCircle2 size={40} style={{ marginBottom: '8px' }} />
                            <h3>Request Sent!</h3>
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
                                <label>Service</label>
                                <select className="form-control" value={serviceRequired} onChange={(e) => setServiceRequired(e.target.value)}>
                                    <option value="title_search">Title Search</option>
                                    <option value="agreement_drafting">Sale Agreement Drafting</option>
                                    <option value="registration_assistance">Registration Support</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.95rem', marginTop: '6px' }}>
                                Book Consultation <ArrowRight size={14} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
