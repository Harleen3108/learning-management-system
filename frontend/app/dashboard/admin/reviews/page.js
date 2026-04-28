'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Star, 
    MessageSquare, 
    ShieldAlert, 
    Trash2, 
    Flag, 
    CheckCircle2, 
    Filter, 
    Download, 
    MoreVertical, 
    AlertTriangle,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCheck,
    Cpu,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function ReviewModeration() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, flagged, deleted
    const [moderating, setModerating] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statusParam = activeTab === 'all' ? '' : activeTab;
            const [reviewsRes, statsRes] = await Promise.all([
                api.get('/reviews', { params: { status: statusParam } }),
                api.get('/admin/reviews/stats')
            ]);
            setReviews(reviewsRes.data.data);
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleModerate = async (id, status) => {
        setModerating(id);
        try {
            await api.put(`/reviews/${id}/moderate`, { status });
            fetchData();
        } catch (err) {
            alert('Moderation failed');
        } finally {
            setModerating(null);
        }
    };

    const getSentimentStyle = (label) => {
        switch (label) {
            case 'Positive': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Constructive': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Spam': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-10 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none mb-2">Review Moderation</h1>
                        <p className="text-slate-400 font-medium italic">Ensure a safe and high-quality learning environment by managing student feedback and platform sentiment.</p>
                    </div>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Avg Rating Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full">
                                <p className="text-[10px] font-bold text-[#071739] uppercase tracking-widest mb-6">Overall Platform Rating</p>
                                <div className="flex items-end gap-4 mb-4">
                                    <h2 className="text-6xl font-bold text-slate-800 leading-none tracking-tighter">{stats.average}</h2>
                                    <div className="flex flex-col gap-1 mb-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < Math.floor(stats.average) ? "#FACC15" : "none"} className={i < Math.floor(stats.average) ? "text-yellow-400" : "text-slate-200"} />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">From {stats.total} reviews</p>
                                    </div>
                                </div>
                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2">
                                    <span className="p-1 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <TrendingUp size={12} />
                                    </span>
                                    <p className="text-[11px] font-bold text-emerald-600 tracking-tight">+0.2% increase from last month</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Rating Distribution</p>
                            <div className="space-y-3">
                                {stats.distribution.map((d) => (
                                    <div key={d.star} className="flex items-center gap-4 group">
                                        <span className="text-[11px] font-black text-slate-400 w-4">{d.star}</span>
                                        <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${d.percentage}%` }}
                                                className="h-full bg-[#A68868] rounded-full"
                                            />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400 w-10 text-right">{d.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Moderation Card */}
                        <div className="bg-[#071739] p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldAlert size={120} className="text-white" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6">Pending Moderation</p>
                                <h3 className="text-6xl font-bold text-white leading-none tracking-tighter mb-4">{stats.pendingCount}</h3>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">Reviews flagged as potential spam or inappropriate content by AI.</p>
                                <button 
                                    onClick={() => setActiveTab('flagged')}
                                    className="mt-auto bg-white text-[#071739] px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:-translate-y-1 transition-all shadow-lg"
                                >
                                    Review Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter & Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                        {['all', 'flagged', 'deleted'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all relative",
                                    activeTab === tab ? "text-[#071739]" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab === 'all' ? 'All Reviews' : tab === 'flagged' ? 'Flagged' : 'Deleted'}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#071739]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input 
                                type="text" 
                                placeholder="Filter results..." 
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-800 outline-none w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                            <Filter size={14} /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Reviews Ledger */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="py-40 text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse"
                            >
                                Establishing Uplink with Sentiment Node...
                            </motion.div>
                        ) : reviews.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="py-40 text-center flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                    <CheckCircle2 size={32} />
                                </div>
                                <p className="text-sm font-bold text-slate-400 italic">Clear frequency. No reviews matching this filter.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6 pb-20">
                                {reviews.map((review) => (
                                    <motion.div 
                                        key={review._id} 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={clsx(
                                            "bg-white p-8 rounded-[2rem] border shadow-sm flex gap-8 group transition-all",
                                            review.status === 'flagged' ? "border-rose-100 bg-rose-50/10" : "border-slate-100"
                                        )}
                                    >
                                        {/* User Identity */}
                                        <div className="w-24 flex flex-col items-center text-center flex-shrink-0">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm p-1 mb-3 group-hover:scale-105 transition-all">
                                                <img src={`https://ui-avatars.com/api/?name=${review.student?.name}&background=random`} className="w-full h-full rounded-[14px]" alt="" />
                                            </div>
                                            <h4 className="text-[11px] font-bold text-slate-800 uppercase leading-tight tracking-tight mb-1">{review.student?.name}</h4>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level 4 Student</span>
                                        </div>

                                        {/* Review Content */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < review.rating ? "#A68868" : "none"} className={i < review.rating ? "text-[#A68868]" : "text-slate-200"} />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                        <span>Reviewed on {review.course?.title}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-3">{review.title || 'Absolutely transformed my career!'}</h3>
                                                <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-4xl">{review.comment}</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                 {review.isVerifiedPurchase && (
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                                {review.sentimentLabel && (
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                                                        getSentimentStyle(review.sentimentLabel)
                                                    )}>
                                                        {review.sentimentLabel} Feedback
                                                    </span>
                                                )}
                                                <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold italic tracking-tight">
                                                    Helpful ({review.helpfulCount || 0})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Administrative Directives */}
                                         <div className="w-48 flex flex-col justify-center gap-2">
                                            {review.status === 'flagged' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleModerate(review._id, 'deleted')}
                                                        className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:-translate-y-0.5 transition-all"
                                                    >
                                                        Remove Immediately
                                                    </button>
                                                    <button 
                                                        onClick={() => handleModerate(review._id, 'active')}
                                                        className="w-full py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                                                    >
                                                        Ignore Flag
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => handleModerate(review._id, 'flagged')}
                                                    className="w-full py-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                                >
                                                    Flag Content
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* High Density Pagination */}
                {!loading && reviews.length > 0 && (
                    <div className="flex items-center justify-between py-12 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 italic">Showing {Math.min(reviews.length, 10)} of {stats?.total || reviews.length} reviews</p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-800 transition-all"><ChevronLeft size={20} /></button>
                            {[1, 2, 3, '...', 415].map((page, i) => (
                                <button 
                                    key={i} 
                                    className={clsx(
                                        "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                                        page === 1 ? "bg-[#071739] text-white shadow-lg shadow-slate-900/10" : "text-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="p-2 text-slate-400 hover:text-slate-800 transition-all"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
