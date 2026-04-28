'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Ticket, 
    Plus, 
    Trash2, 
    Calendar, 
    Tag, 
    Users, 
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiresAt: '',
        maxUses: 100
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/coupons');
            setCoupons(res.data.data);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/coupons', formData);
            setShowCreateModal(false);
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                expiresAt: '',
                maxUses: 100
            });
            fetchCoupons();
        } catch (err) {
            alert('Failed to create coupon: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (err) {
            alert('Failed to delete coupon');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Coupon Management</h1>
                        <p className="text-slate-400 mt-1">Create and manage discount codes to drive platform growth.</p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-900/10 transition-all"
                    >
                        <Plus size={18} />
                        Create New Coupon
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-slate-400 font-medium">Fetching active promotions...</div>
                    ) : coupons.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm">
                            <Tag className="mx-auto mb-4 text-slate-200" size={48} />
                            <h3 className="text-xl font-bold text-slate-800">No coupons found</h3>
                            <p className="text-slate-400 mt-1">Start by creating your first promotional offer.</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => {
                            const isExpired = new Date(coupon.expiresAt) < new Date();
                            return (
                                <motion.div 
                                    layout
                                    key={coupon._id}
                                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all border-l-8 border-l-[#A68868]"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-[#A68868]/10 text-[#A68868] px-4 py-1 rounded-xl text-lg font-bold tracking-widest font-mono">
                                            {coupon.code}
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(coupon._id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-baseline gap-1">
                                            <h4 className="text-4xl font-bold text-slate-800 tracking-tighter">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                            </h4>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OFF</span>
                                        </div>

                                         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Users size={12} /> Usage
                                                </p>
                                                <p className="text-sm font-bold text-slate-700">{coupon.usedCount} / {coupon.maxUses}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={12} /> Expiry
                                                </p>
                                                <p className={clsx("text-sm font-bold", isExpired ? "text-rose-500" : "text-slate-700")}>
                                                    {new Date(coupon.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                         <div className={clsx(
                                            "mt-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center",
                                            isExpired ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {isExpired ? 'Expired Promotion' : 'Live & Active'}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">Create Coupon</h2>
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
                                    <input 
                                        required 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold tracking-widest uppercase focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all"
                                        placeholder="EX: SUMMER50"
                                        value={formData.code}
                                        onChange={e => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all"
                                            value={formData.discountType}
                                            onChange={e => setFormData({...formData, discountType: e.target.value})}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Value</label>
                                        <input 
                                            required 
                                            type="number" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all"
                                            value={formData.discountValue}
                                            onChange={e => setFormData({...formData, discountValue: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Uses</label>
                                        <input 
                                            required 
                                            type="number" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all"
                                            value={formData.maxUses}
                                            onChange={e => setFormData({...formData, maxUses: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <input 
                                            required 
                                            type="date" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all"
                                            value={formData.expiresAt}
                                            onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                                        />
                                    </div>
                                </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-[2] bg-[#071739] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-[#020a1a] transition-all hover:scale-[1.02]"
                                    >
                                        Generate Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
