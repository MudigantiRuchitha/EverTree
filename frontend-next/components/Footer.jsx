'use client';
import React from 'react';
import Link from 'next/link';
import { Building2, Phone, Mail, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '48px 0 24px 0',
            marginTop: '60px',
            color: 'var(--text-muted)'
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                    
                    {/* Col 1: Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Building2 size={18} color="#ffffff" />
                            </div>
                            <div style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                                evertree<span style={{ color: 'var(--primary-emerald)' }}>.in</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                            <span className="badge badge-emerald">Buy</span>
                            <span className="badge badge-gold">Sell</span>
                            <span className="badge badge-blue">Rent</span>
                        </div>
                    </div>

                    {/* Col 2: Services */}
                    <div>
                        <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.95rem' }}>Services</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                            <li><Link href="/loan" style={{ color: 'inherit', textDecoration: 'none' }}>Home Loans</Link></li>
                            <li><Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}>Legal Verification</Link></li>
                            <li><Link href="/interior" style={{ color: 'inherit', textDecoration: 'none' }}>Interior Design</Link></li>
                        </ul>
                    </div>

                    {/* Col 3: Categories */}
                    <div>
                        <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.95rem' }}>Categories</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                            <li>Apartments & Villas</li>
                            <li>Commercial Offices</li>
                            <li>Agricultural Land</li>
                        </ul>
                    </div>

                    {/* Col 4: Contact */}
                    <div>
                        <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.95rem' }}>Support</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color="var(--primary-emerald)" /> +91 1800-EVERTREE</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color="var(--primary-emerald)" /> support@evertree.in</div>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem'
                }}>
                    <div>© {new Date().getFullYear()} evertree.in</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Real Estate
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
