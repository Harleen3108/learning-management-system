'use client';
import { 
    Users, 
    BookOpen, 
    Star, 
    Globe, 
    Linkedin, 
    Twitter, 
    Youtube,
    CheckCircle2,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';

export default function InstructorProfile({ data }) {
    const { profile, stats, courses } = data;

    const socialIcons = {
        website: Globe,
        linkedin: Linkedin,
        twitter: Twitter,
        youtube: Youtube
    };

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white rounded-[3rem] p-8 lg:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-20 -mt-20" />
                
                <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                    <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] border-8 border-white/10 shadow-2xl overflow-hidden shrink-0">
                        <img 
                            src={profile.profilePhoto === 'no-photo.jpg' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}` : profile.profilePhoto} 
                            alt={profile.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tight">{profile.name}</h1>
                            <p className="text-xl lg:text-2xl font-bold text-primary italic">{profile.instructorSpecialty || 'Expert Instructor'}</p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            {Object.entries(profile.socialLinks || {}).map(([platform, url]) => {
                                if (!url) return null;
                                const Icon = socialIcons[platform] || Globe;
                                return (
                                    <a 
                                        key={platform} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-white/10 hover:bg-primary transition-all rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-xl"
                                    >
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats Strip */}
                <div className="mt-12 lg:mt-20 pt-10 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-1">
                        <p className="text-3xl lg:text-5xl font-black text-primary">{stats.totalStudents.toLocaleString()}+</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Students</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl lg:text-5xl font-black text-white">{stats.totalCourses}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Courses</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl lg:text-5xl font-black text-amber-500">{stats.averageRating}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Instructor Rating</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl lg:text-5xl font-black text-white">{stats.totalReviews.toLocaleString()}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Reviews</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-16">
                    {/* Bio Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary">
                                <Users size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">About Instructor</h2>
                        </div>
                        <div className="text-lg text-slate-600 font-medium leading-relaxed space-y-4">
                            {profile.instructorBio ? (
                                <p>{profile.instructorBio}</p>
                            ) : (
                                <p className="italic opacity-60">No bio provided by the instructor.</p>
                            )}
                        </div>
                    </section>

                    {/* Courses Section */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary">
                                    <BookOpen size={24} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Courses</h2>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <CourseCard key={course._id} course={course} />
                                ))
                            ) : (
                                <p className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">
                                    No courses published yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Quick Stats / Highlights */}
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8 border border-slate-100">
                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Highlights</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Verified Instructor</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Identity and credentials verified by EduFlow.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Joined</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                        
                        <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                            Message Instructor <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Trust Badge */}
                    <div className="p-8 border-2 border-emerald-100 rounded-[2.5rem] bg-emerald-50/30">
                        <h4 className="font-black text-slate-900 text-sm mb-2">Student Trust</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Courses from this instructor are backed by the EduFlow Quality Guarantee. 
                            If you're not satisfied, we offer a 30-day money-back guarantee.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
