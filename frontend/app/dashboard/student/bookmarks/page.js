'use client';
import { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Play, 
  Trash2, 
  Clock, 
  ChevronRight,
  Loader2,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import Link from 'next/link';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/student/bookmarks');
      setBookmarks(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const removeBookmark = async (courseId, lessonId) => {
    try {
        await api.post('/student/bookmarks', { courseId, lessonId });
        setBookmarks(bookmarks.filter(b => b.lesson._id !== lessonId));
    } catch (err) {
        alert('Failed to remove bookmark');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <header>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Bookmark size={16} fill="currentColor" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Lessons</h1>
            </div>
            <p className="text-slate-500 font-medium">Quickly access the bits you found most valuable.</p>
        </header>

        <section className="space-y-6">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-slate-50 rounded-[2rem] h-40 animate-pulse"></div>
                    ))}
                </div>
            ) : bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {bookmarks.map((b) => (
                        <Card key={b._id} className="p-8 group hover:border-blue-200 transition-all border-slate-100 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 rounded-lg">
                                        {b.course?.title}
                                    </span>
                                    <button 
                                        onClick={() => removeBookmark(b.course?._id, b.lesson?._id)}
                                        className="text-slate-200 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2">
                                    {b.lesson?.title}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={14} /> {b.lesson?.duration || 0} mins
                                </div>
                                <Link 
                                    href={`/dashboard/courses/${b.course?._id}`}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/10"
                                >
                                    Jump In <Play size={12} fill="currentColor" />
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                        <Bookmark size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No bookmarks saved</h3>
                        <p className="text-slate-500 font-medium">While learning, click the bookmark icon to save key lessons for later.</p>
                    </div>
                </div>
            )}
        </section>
      </div>
    </DashboardLayout>
  );
}
