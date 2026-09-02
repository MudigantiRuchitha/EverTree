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
            setPendingUsers(res.data || []);
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-8 shadow-2xl relative max-h-[88vh] overflow-y-auto">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Admin Legal Verification Portal</h2>
                        <p className="text-xs sm:text-sm text-slate-500">Review Seller & Broker government documents & RERA credentials</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500 text-sm">Loading pending applications...</div>
                ) : pendingUsers.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                        ✓ All Seller & Broker legal verifications have been reviewed and approved!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingUsers.map(u => (
                            <div key={u.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-base font-bold text-slate-900">{u.name}</h4>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            ID: {u.verification_id}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                            {u.role}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {u.email} &bull; {u.phone}
                                    </div>

                                    {/* Legal Details Box */}
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                                        <div><strong>Govt ID ({u.govt_id_type}):</strong> {u.govt_id_number || 'N/A'}</div>
                                        {u.role === 'broker' && <div><strong>RERA Registration:</strong> {u.rera_number || 'N/A'}</div>}
                                        {u.role === 'seller' && <div><strong>Ownership Deed Ref:</strong> {u.ownership_proof_ref || 'N/A'}</div>}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleApprove(u.id)} 
                                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all hover:scale-105 cursor-pointer shrink-0"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve Verification
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
