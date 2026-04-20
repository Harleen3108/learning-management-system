'use client';
import { useState, useEffect } from 'react';
import { 
  Star, 
  Users, 
  Clock, 
  Globe, 
  ChevronRight, 
  PlayCircle, 
  CheckCircle2, 
  ShieldCheck,
  Award,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import CourseEnrollButton from '@/components/CourseEnrollButton';
import api from '@/services/api';
import Link from 'next/link';

export default function CourseDetailsPage({ params }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${params.id}`);
        setCourse(res.data.data);
      } catch (err) {
        console.error('Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.id]);

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Loading Journey...</div>;
  if (!course) return <div className="p-20 text-center font-black text-slate-400">Course not found.</div>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <Link 
            href="/dashboard/explore" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all mb-4"
        >
            <ArrowLeft size={16} /> Back to Explore
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-10">
                <header className="space-y-4">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{course.category}</span>
                    <h1 className="text-5xl font-black text-slate-900 leading-[1.1]">{course.title}</h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">{course.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-8 pt-6">
                        <div className="flex items-center gap-2">
                            <Star className="text-amber-500 fill-amber-500" size={20} />
                            <span className="font-black text-slate-900">{course.averageRating || 'New'}</span>
                            <span className="text-slate-400 font-bold text-sm">(124 Ratings)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="text-slate-400" size={20} />
                            <span className="font-black text-slate-900">18.5k Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="text-slate-400" size={20} />
                            <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest">English</span>
                        </div>
                    </div>
                </header>

                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">What you'll learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Build professional-grade applications with modern tools',
                            'Master the principles of scalable system architecture',
                            'Implement secure authentication and data flows',
                            'Deploy and manage production-ready environments',
                            'Collaborate effectively using industry-standard workflows'
                        ].map((point, index) => (
                            <div key={index} className="flex gap-3">
                                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                                <p className="text-slate-600 font-semibold text-sm leading-snug">{point}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum Breakdown</h2>
                    <div className="space-y-4">
                        {course.modules?.map((mod, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden">
                                <div className="p-6 flex justify-between items-center cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>
                                        <h4 className="font-bold text-slate-900">{mod.title}</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mod.lessons?.length} Lessons</span>
                                </div>
                                <div className="px-10 pb-6 space-y-3">
                                    {mod.lessons?.map((lesson, lid) => (
                                        <div key={lid} className="flex items-center justify-between text-xs text-slate-500 font-bold">
                                            <div className="flex items-center gap-2">
                                                <PlayCircle size={14} className="text-slate-300" />
                                                <span>{lesson.title}</span>
                                            </div>
                                            <ShieldCheck size={14} className="text-slate-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sticky Enrollment Card */}
            <div className="lg:col-span-1">
                <Card className="sticky top-28 overflow-hidden border-none shadow-2xl shadow-slate-200">
                    <div className="aspect-video relative overflow-hidden">
                        <img src={course.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' : course.thumbnail} alt="Curriculum" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-sm group cursor-pointer">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/20 group-hover:scale-110 transition-transform">
                                <PlayCircle className="text-blue-600" size={32} />
                            </div>
                        </div>
                    </div>
                    <div className="p-10 space-y-8 text-center lg:text-left">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Lifetime Access</p>
                            <h3 className="text-5xl font-black text-slate-900">{course.price ? `₹${course.price}` : 'FREE'}</h3>
                        </div>

                        <div className="space-y-4">
                            <CourseEnrollButton course={course} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">30-Day Money Back Guarantee</p>
                        </div>

                        <div className="space-y-5 pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-4 text-xs font-black text-slate-900 uppercase tracking-tight">
                                <Clock className="text-blue-500" size={18} />
                                24 Hours on-demand video
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black text-slate-900 uppercase tracking-tight">
                                <Award className="text-blue-500" size={18} />
                                Certificate of completion
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black text-slate-900 uppercase tracking-tight">
                                <ShieldCheck className="text-blue-500" size={18} />
                                Full lifetime access
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
