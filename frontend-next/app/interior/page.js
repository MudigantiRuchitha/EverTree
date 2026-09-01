'use client';
import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { serviceAPI } from '../../services/api';

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

    const showcases = [
        { title: 'Modern Living Space', style: 'Scandinavian Oak', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6' },
        { title: 'Modular Kitchen', style: 'German Hardware & Quartz', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f' },
        { title: 'Master Bedroom', style: 'Ambient Lighting & Velvet', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0' }
    ];

    return (
        <div className="container section-padding">
            <div className="section-header" style={{ maxWidth: '750px', margin: '0 auto 32px auto' }}>
                <span className="badge badge-gold" style={{ marginBottom: '8px' }}>Page 4 Service</span>
                <h1 style={{ fontSize: '2.2rem', color: '#0f172a' }}>Interior Design & 3D Showcase</h1>
            </div>

            {/* Visual Image Grid */}
            <div className="grid-3" style={{ marginBottom: '32px' }}>
                {showcases.map((s, idx) => (
                    <div key={idx} className="glass-card" style={{ overflow: 'hidden' }}>
                        <img src={s.img} alt={s.title} style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
                        <div style={{ padding: '14px' }}>
                            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '2px' }}>{s.title}</h3>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.style}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ maxWidth: '580px', margin: '0 auto', padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '14px', textAlign: 'center' }}>
                    Request Free 3D Design Consultation
                </h3>

                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '20px 10px', color: '#059669' }}>
                        <CheckCircle2 size={40} style={{ marginBottom: '8px' }} />
                        <h3>Consultation Request Submitted!</h3>
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
                            <label>Layout</label>
                            <select className="form-control" value={bhk} onChange={(e) => setBhk(e.target.value)}>
                                <option value="2 BHK">2 BHK Apartment</option>
                                <option value="3 BHK">3 BHK Apartment</option>
                                <option value="4 BHK Villa">4 BHK Villa</option>
                                <option value="Commercial Space">Commercial Space</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estimated Budget</label>
                            <select className="form-control" value={budget} onChange={(e) => setBudget(e.target.value)}>
                                <option value="₹3 - 5 Lakhs">₹3 - 5 Lakhs</option>
                                <option value="₹5 - 10 Lakhs">₹5 - 10 Lakhs</option>
                                <option value="₹10+ Lakhs">₹10+ Lakhs</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.95rem', marginTop: '6px' }}>
                            Get Free Estimate <ArrowRight size={14} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
