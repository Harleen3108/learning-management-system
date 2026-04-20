'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Award, 
    Search, 
    Filter, 
    RefreshCcw, 
    ShieldCheck, 
    ShieldOff, 
    ExternalLink,
    Clock,
    User,
    BookOpen,
    Archive,
    Trash2,
    CheckCircle2,
    XCircle,
    Copy,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function CertificateManagement() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/certificates');
            setCertificates(res.data.data);
        } catch (err) {
            console.error('Failed to fetch certificates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleRevoke = async (id, certId) => {
        if (!confirm(`Are you sure you want to REVOKE certificate ${certId}? This action will be logged and the student will lose their credential access.`)) return;
        try {
            await api.put(`/admin/certificates/${id}/revoke`);
            fetchCertificates();
        } catch (err) {
            alert('Failed to revoke certificate');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredCerts = certificates.filter(cert => 
        cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cert.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cert.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Credential Ledger</h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Monitor issued certificates, verify authenticity, and manage revocations.</p>
                    </div>
                    <button 
                        onClick={fetchCertificates}
                        className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Ledger
                    </button>
                </div>

                {/* Ledger Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Award size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Issued Today</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                                {certificates.filter(c => new Date(c.issueDate).toDateString() === new Date().toDateString()).length}
                            </h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Active</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{certificates.filter(c => c.status === 'active').length}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                            <ShieldOff size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Revoked</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{certificates.filter(c => c.status === 'revoked').length}</h4>
                        </div>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by Certificate ID, Student, or Course..." 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Certificate ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Holder / Course</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Issue Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing credential ledger...</td></tr>
                                ) : filteredCerts.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic tracking-tight">No credentials found matching your query.</td></tr>
                                ) : (
                                    filteredCerts.map((cert) => (
                                        <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <button 
                                                    onClick={() => copyToClipboard(cert.certificateId)}
                                                    className="flex items-center gap-2 group/btn"
                                                >
                                                    <span className="text-xs font-black text-slate-800 font-mono tracking-tighter uppercase">{cert.certificateId}</span>
                                                    {copiedId === cert.certificateId ? (
                                                        <Check size={12} className="text-emerald-500" />
                                                    ) : (
                                                        <Copy size={12} className="text-slate-300 opacity-0 group-hover/btn:opacity-100 transition-all" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{cert.student?.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                        <BookOpen size={10} /> {cert.course?.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    cert.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {cert.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-800 tracking-tight leading-none mb-1">{new Date(cert.issueDate).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{new Date(cert.issueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {cert.url && (
                                                        <a 
                                                            href={cert.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-3 bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                                            title="View Certificate"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    )}
                                                    {cert.status !== 'revoked' && (
                                                        <button 
                                                            onClick={() => handleRevoke(cert._id, cert.certificateId)}
                                                            className="p-3 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                                                            title="Revoke Certificate"
                                                        >
                                                            <ShieldOff size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
