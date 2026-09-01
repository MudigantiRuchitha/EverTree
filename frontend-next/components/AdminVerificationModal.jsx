'use client';
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';

const AdminVerificationModal = ({ isOpen, onClose }) => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadPendingVerifications();
        }
    }, [isOpen]);

    const loadPendingVerifications = async () => {
        setLoading(true);
        try {
            const res = await authAPI.getPendingVerifications();
            setPendingUsers(res.data);
        } catch (err) {
            console.error('Failed to load pending verifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await authAPI.approveUser(userId);
            alert('Legal verification approved!');
            loadPendingVerifications();
        } catch (err) {
            alert('Approval failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '680px', padding: '28px', position: 'relative', background: '#ffffff', maxHeight: '85vh', overflowY: 'auto' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ShieldCheck size={24} color="var(--primary-emerald)" />
                    <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>Admin Legal Verification Portal</h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading pending applications...</div>
                ) : pendingUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        ✓ All Seller & Broker legal verifications have been reviewed and approved!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {pendingUsers.map(user => (
                            <div key={user.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{user.name}</h4>
                                        <span className="badge badge-emerald">ID: {user.verification_id}</span>
                                        <span className="badge badge-gold">{user.role}</span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                        {user.email} • {user.phone}
                                    </div>

                                    {/* Legal Details */}
                                    <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                                        <div><strong>Govt ID ({user.govt_id_type}):</strong> {user.govt_id_number || 'N/A'}</div>
                                        {user.role === 'broker' && <div><strong>RERA Registration:</strong> {user.rera_number || 'N/A'}</div>}
                                        {user.role === 'seller' && <div><strong>Ownership Khata Ref:</strong> {user.ownership_proof_ref || 'N/A'}</div>}
                                    </div>
                                </div>

                                <button className="btn btn-primary" onClick={() => handleApprove(user.id)} style={{ fontSize: '0.85rem' }}>
                                    <CheckCircle size={14} /> Approve Verification
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVerificationModal;
