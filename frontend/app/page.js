'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Code,
  Briefcase,
  Paintbrush,
  Database,
  Quote
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          const allCourses = res.data.data;
          setCourses(allCourses);
          
          // Extract unique categories
          const uniqueCats = ['All', ...new Set(allCourses.map(c => c.category))];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = activeCategory === 'All' 
    ? courses.slice(0, 8) 
    : courses.filter(c => c.category === activeCategory);

  const partners = ['FORBES', 'STANFORD', 'MICROSOFT', 'MIT', 'VOGUE'];
  
  const benefits = [
    {
      title: 'Expert Mentors',
      desc: 'Learn from Fortune 500 leaders and industry pioneers who bring real-world experience into every lesson.',
      icon: <Code size={24} className="text-blue-600" />,
      bg: 'bg-blue-50'
    },
    {
      title: 'Industry Certification',
      desc: 'Gain globally recognized credentials that unlock doors at top-tier organizations worldwide.',
      icon: <ShieldCheck size={24} className="text-emerald-600" />,
      bg: 'bg-emerald-50'
    },
    {
      title: 'Lifetime Access',
      desc: 'Your education doesn’t expire. Enjoy unlimited access to course materials and future updates forever.',
      icon: <Clock size={24} className="text-purple-600" />,
      bg: 'bg-purple-50'
    }
  ];

  const disciplines = [
    { name: 'Technology', count: '42 Active Courses', icon: <Code size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Business', count: '18 Active Courses', icon: <Briefcase size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Liberal Arts', count: '24 Active Courses', icon: <Paintbrush size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Data Science', count: '31 Active Courses', icon: <Database size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="bg-white selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-slate-100">
                    ENROLLING FOR FALL 2024
                </div>
                <h1 className="text-6xl lg:text-[105px] font-black text-slate-800 tracking-tighter leading-[0.85] mb-10">
                    Master Your <br/>
                    <span className="text-blue-600 italic">Future</span> with <br/>
                    Expert-Led <br/>
                    Courses.
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
                    Join an elite community of scholars and creatives. Our curriculum is designed by industry pioneers to bridge the gap between academic theory and high-impact practice.
                </p>
                
                <div className="flex flex-wrap gap-6">
                    <Link href="/register" className="btn-primary min-w-[200px]">
                        Start Learning
                    </Link>
                    <Link href="/courses" className="btn-secondary min-w-[200px]">
                        Explore Catalog
                    </Link>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative"
            >
                <div className="aspect-square lg:aspect-[4/5] bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                      alt="Student" 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
                </div>
                
                {/* Stats Card Overlay */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="absolute -bottom-10 -left-10 lg:-left-20 glass-card p-8 rounded-[2rem] max-w-[280px]"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Top 1% Global Mentors</p>
                            <p className="text-sm font-bold text-white leading-tight">Learn from CEO-level practitioners daily.</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Partners Strip */}
      <section className="py-20 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-12">Strategic Partners & Affiliates</p>
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24">
                {partners.map(p => (
                    <span key={p} className="text-2xl font-black text-slate-200 tracking-tighter hover:text-slate-400 transition-colors cursor-default">{p}</span>
                ))}
            </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="admissions" className="py-32 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
                {benefits.map((benefit, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="group"
                    >
                        <div className={`w-14 h-14 ${benefit.bg} rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:-translate-y-2 duration-300`}>
                            {benefit.icon}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">{benefit.title}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            {benefit.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Integrated Course Filter Section */}
      <section id="curriculum" className="py-32 px-6 bg-slate-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-4">
                  Skills to transform your career and life
                </h2>
                <p className="text-lg text-slate-500 font-medium">
                  From industry-vetted technical tracks to creative mastery, EduFlow supports your professional evolution.
                </p>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-8 mb-12 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-sm font-black whitespace-nowrap tracking-widest uppercase transition-all pb-2 border-b-2 ${
                            activeCategory === cat 
                            ? 'text-blue-600 border-blue-600' 
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode='wait'>
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-slate-100 rounded-xl aspect-[16/20] animate-pulse" />
                        ))
                    ) : filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No courses found in this category.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="mt-16 text-center">
                <Link href="/courses" className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-800 font-black rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                    View All Programs <ArrowRight size={18} />
                </Link>
            </div>
        </div>
      </section>

      {/* Testimonial */}
      <section id="testimonials" className="py-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
            <div className="flex justify-center mb-12">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10">
                    <img src="https://i.pravatar.cc/150?u=james" alt="James Carter" className="w-full h-full object-cover" />
                </div>
            </div>
            
            <div className="relative">
                <Quote size={120} className="absolute -top-10 -left-10 text-slate-50 -z-0" />
                <p className="text-3xl lg:text-5xl font-black text-slate-800 tracking-tighter leading-tight mb-12 relative z-10 italic">
                   "EduFlow didn't just teach me new skills; it completely rewired how I approach problem-solving in the tech landscape. The mentorship is truly peerless."
                </p>
                <div className="relative z-10">
                    <p className="text-lg font-bold text-slate-800 mb-1">James Carter</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Product Director at Google</p>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto bg-[#0047AB] rounded-[4rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none grid grid-cols-12">
                {[...Array(24)].map((_, i) => (
                    <div key={i} className="border-r border-white/20 h-full" />
                ))}
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight mb-8">Ready to start your journey?</h2>
                <p className="text-blue-100 text-lg font-medium mb-12">
                    Join over 50,000 students worldwide who are accelerating their careers with the most rigorous curriculum online.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/register" className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl">
                        Get Started Today
                    </Link>
                    <button className="bg-transparent border border-white/30 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">
                        Speak with Admissions
                    </button>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
