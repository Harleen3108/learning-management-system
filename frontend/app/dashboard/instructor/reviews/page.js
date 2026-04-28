'use client';
import { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Filter, 
  Search, 
  MoreVertical, 
  Quote, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ThumbsUp,
  Smile,
  Megaphone
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/instructor/me');
      setReviews(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r => {
    const matchesSentiment = selectedSentiment === 'all' || r.sentimentLabel === selectedSentiment;
    const matchesSearch = r.course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSentiment && matchesSearch;
  });

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Analyzing Feedback...</div>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reviews & Ratings</h1>
          <p className="text-slate-500 font-medium mt-1">Direct feedback from your students across all courses.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 border-slate-100 shadow-sm flex items-center gap-6">
             <div className="w-20 h-20 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 relative">
                <Star size={36} fill="currentColor" />
                <span className="absolute -top-1 -right-1 bg-white px-2 py-0.5 rounded-full border border-amber-100 text-[10px] font-black">{stats?.averageRating}</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Rating</p>
                <p className="text-3xl font-black text-slate-900">{stats?.totalReviews} Reviews</p>
             </div>
          </Card>

          {['Positive', 'Constructive'].map((sentiment, i) => (
            <Card key={i} className="p-8 border-slate-100 shadow-sm flex items-center gap-6">
               <div className={clsx(
                 "w-16 h-16 rounded-3xl flex items-center justify-center",
                 sentiment === 'Positive' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-[#071739]"
               )}>
                  {sentiment === 'Positive' ? <Smile size={28} /> : <TrendingUp size={28} />}
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{sentiment} Feedback</p>
                  <p className="text-3xl font-black text-slate-900">{stats?.sentimentDistribution[sentiment] || 0}</p>
               </div>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
           <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search reviews or courses..." 
                className="w-full bg-white border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              {['all', 'Positive', 'Constructive', 'Neutral'].map(s => (
                <button 
                  key={s}
                  onClick={() => setSelectedSentiment(s)}
                  className={clsx(
                    "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                    selectedSentiment === s ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                  )}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        {/* Review List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card key={review._id} className="p-8 border-slate-100 shadow-sm hover:border-blue-100 transition-all relative group">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Star Rating & Student */}
                  <div className="md:w-64 flex-shrink-0 space-y-4">
                     <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={star <= review.rating ? "text-amber-400 fill-current" : "text-slate-200"} 
                          />
                        ))}
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                           {review.student.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{review.student.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className={clsx(
                       "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                       review.sentimentLabel === 'Positive' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                       review.sentimentLabel === 'Constructive' ? "bg-slate-50 text-[#071739] border-slate-100" :
                       "bg-slate-50 text-slate-400 border-slate-100"
                     )}>
                        {review.sentimentLabel === 'Positive' ? <Smile size={12} /> : 
                         review.sentimentLabel === 'Constructive' ? <TrendingUp size={12} /> : <AlertCircle size={12} />}
                        {review.sentimentLabel}
                     </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 space-y-4 relative">
                     <Quote className="absolute -top-4 -left-4 text-slate-50" size={48} />
                     <div className="relative z-10">
                        <p className="text-[10px] font-black text-[#071739] uppercase tracking-widest mb-2 flex items-center gap-2">
                           <BookOpen size={12} /> {review.course.title}
                        </p>
                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{review.title}</h4>
                        <p className="text-slate-500 font-medium leading-relaxed italic">"{review.comment}"</p>
                     </div>
                     
                     <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-6">
                           <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors">
                              <ThumbsUp size={14} /> {review.helpfulCount} Helpful
                           </button>
                           <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors">
                              <Megaphone size={14} /> Report
                           </button>
                        </div>
                        <button className="text-[10px] font-black text-[#071739] uppercase tracking-widest hover:underline">Reply to Student</button>
                     </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="p-32 text-center bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
               <MessageSquare className="mx-auto text-slate-200 mb-6" size={60} />
               <p className="text-slate-400 font-bold italic">No feedback found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
