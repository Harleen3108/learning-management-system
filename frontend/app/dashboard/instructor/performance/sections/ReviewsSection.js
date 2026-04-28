'use client';
import { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  MoreVertical,
  Loader2,
  PieChart,
  User
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function ReviewsSection({ selectedCourse }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/performance/reviews?courseId=${selectedCourse}`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch review stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [selectedCourse]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>;

    const avgRating = data?.reviews.length > 0 
        ? (data.reviews.reduce((acc, r) => acc + r.rating, 0) / data.reviews.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-10">
            {/* Header Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="p-8 border-slate-50 flex flex-col items-center justify-center text-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Instructor Rating</h4>
                    <div className="text-6xl font-semibold text-[#071739] mb-4">{avgRating}</div>
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={20} fill={i <= Math.round(avgRating) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Based on {data?.reviews.length} total reviews</p>
                </Card>

                <Card className="p-8 border-slate-50 lg:col-span-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Rating Distribution</h4>
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = data?.ratingDistribution.find(d => d._id === star)?.count || 0;
                            const percentage = data?.reviews.length > 0 ? (count / data.reviews.length) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-slate-500 w-12">{star} Stars</span>
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className="h-full bg-amber-400 rounded-full"
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 w-12 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Recent Reviews List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-xl font-semibold text-slate-900">Recent Student Feedback</h3>
                    <button className="text-[10px] font-black text-[#071739] uppercase tracking-widest hover:underline">View All Reviews</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.reviews.map((review, i) => (
                        <Card key={i} className="p-8 border-slate-50 hover:border-[#071739]/10 transition-all group shadow-sm hover:shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-sm border-2 border-white">
                                        <img src={review.student.profilePhoto || `https://ui-avatars.com/api/?name=${review.student.name}&background=071739&color=fff`} alt="" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-900">{review.student.name}</h5>
                                        <div className="flex items-center gap-1 text-amber-500 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 group-hover:bg-white group-hover:border-[#071739]/5 transition-all">
                                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{review.review}"</p>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">Course: {review.course.title}</p>
                                <button className="p-2 text-slate-300 hover:text-[#071739] transition-colors"><MoreVertical size={16} /></button>
                            </div>
                        </Card>
                    ))}
                    {data?.reviews.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                             <MessageSquare size={40} className="text-slate-200 mx-auto mb-4" />
                             <p className="text-slate-400 font-medium">No reviews received yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
