'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { translations } from '@/utils/translations';
import HomeNavbar from '@/components/HomeNavbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import TrustBadges from '@/components/TrustBadges';
import VideoCallGrid from '@/components/VideoCallGrid';
import TestimonialSection from '@/components/TestimonialSection';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  Monitor,
  Users,
  CheckCircle,
  MessageCircle,
  Zap,
  Globe,
  Star,
  Play,
  TrendingUp,
  ChevronDown,
  Facebook,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import clsx from 'clsx';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language] || translations.English;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success) {
                const parents = res.data.data.filter(c => !c.parentId);
                setCategories(parents);
                if (parents.length > 0) setActiveTab(parents[0]._id);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };
    const fetchTrending = async () => {
        try {
            const res = await api.get('/courses/trending');
            if (res.data.success) {
                setTrendingCourses(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching trending courses:', err);
        }
    };
    fetchCourses();
    fetchCategories();
    fetchTrending();
  }, []);

    const getCategoryIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('business')) return <Monitor size={18} />;
        if (n.includes('ai') || n.includes('intelligence')) return <Zap size={18} />;
        if (n.includes('data')) return <TrendingUp size={18} />;
        if (n.includes('computer') || n.includes('dev')) return <LayoutGrid size={18} />;
        if (n.includes('tech')) return <Monitor size={18} />;
        if (n.includes('personal') || n.includes('design')) return <Zap size={18} />;
        if (n.includes('health')) return <CheckCircle size={18} />;
        if (n.includes('language')) return <Globe size={18} />;
        if (n.includes('social')) return <Users size={18} />;
        if (n.includes('art')) return <LayoutGrid size={18} />;
        if (n.includes('science')) return <Zap size={18} />;
        return <LayoutGrid size={18} />;
    };

    return (
    <div className="bg-white selection:bg-primary/10 selection:text-primary scroll-smooth">
      <HomeNavbar />

      {/* Hero Section - Solid Theme Blue */}
      <section className="relative min-h-[400px] lg:h-[450px] flex items-center overflow-hidden bg-[#071739]">
        <div className="max-w-[1600px] mx-auto px-6 w-full relative z-10 py-12 flex items-center justify-start">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-lg bg-white p-6 lg:p-8 shadow-2xl rounded-none border-l-4 border-[#A68868] z-20 text-left"
            >
                <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    {t.hero.title}
                </h2>
                <p className="text-base text-slate-600 mb-8 font-normal leading-relaxed">
                    {t.hero.subtitle}
                </p>
                <Link href="/explore" className="inline-block bg-[#071739] hover:bg-[#020a1a] text-white px-8 py-3 font-bold text-sm transition-all shadow-xl shadow-slate-900/20">
                    {t.hero.button}
                </Link>
            </motion.div>
        </div>

      </section>

      {/* Features Bar */}
      <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { title: t.features.schedule, icon: <Monitor className="text-primary" />, desc: t.features.desc },
                { title: t.features.advantage, icon: <Users className="text-primary" />, desc: t.features.desc },
                { title: t.features.satisfaction, icon: <CheckCircle className="text-primary" />, desc: t.features.desc },
            ].map((feature, i) => (
                <div key={i} className="flex gap-6 items-start group">
                    <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        {feature.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 tracking-tight">{feature.title}</h3>
                        <p className="text-sm text-slate-500 font-normal leading-relaxed">{feature.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>



      {/* Live Online Classes Section */}
      <section className="py-24 px-6 bg-[#f9fafb]">
        <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                        {t.live.title}
                    </h2>
                </div>
                <Link href="/explore" className="text-sm font-bold text-slate-600 hover:text-primary flex items-center gap-2 mb-4 group transition-colors">
                    {t.live.viewAll}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'For The Kids', img: 'https://cdn-icons-png.flaticon.com/512/3468/3468213.png', link: 'Kids Class Online' },
                    { title: 'For Summertime', img: 'https://cdn-icons-png.flaticon.com/512/2855/2855219.png', link: 'Summer Camps Online' },
                    { title: 'For Adult Person', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png', link: 'Adult Class Online' },
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="bg-white p-10 rounded-[2.5rem] text-center border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                    >
                        <img src={item.img} alt={item.title} className="w-32 h-32 mx-auto mb-8 object-contain" />
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-8">Edoo provides engaging instructor led content for people everywhere and of all ages, without.</p>
                        <Link href="/explore" className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2 group">
                            {item.link}
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1600px] mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Explore categories</h2>
            <div className="flex flex-wrap gap-3 items-center">
                {categories.slice(0, 12).map((cat) => (
                    <Link 
                        key={cat._id} 
                        href={`/explore?category=${cat._id}`}
                        className="flex items-center gap-3 px-6 py-3.5 bg-[#f0f4f9] hover:bg-[#e1e9f1] rounded-full text-[14px] font-bold text-slate-700 transition-all border border-transparent hover:border-slate-200"
                    >
                        <span className="text-slate-500">{getCategoryIcon(cat.name)}</span>
                        {cat.name}
                    </Link>
                ))}
                {categories.length > 12 && (
                    <Link href="/explore" className="flex items-center gap-2 text-primary font-bold hover:underline ml-4 text-[14px]">
                        explore more categories <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </div>
      </section>

      {/* Coursera-style Trending Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1600px] mx-auto bg-[#F0F2FF] rounded-[3rem] p-8 lg:p-16 relative overflow-hidden">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 relative z-10">
                <div className="max-w-3xl">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">Trending Courses Collection</h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                        Master high-demand skills and transform your career with our most popular courses. <Link href="/explore" className="text-primary font-bold hover:underline ml-1">Explore all paths</Link>
                    </p>
                </div>
                <Link href="/explore" className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                    Explore all trending
                </Link>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {trendingCourses.length > 0 ? (
                    trendingCourses.map((course) => (
                        <div key={course._id} className="bg-white rounded-[2rem] p-2 shadow-sm hover:shadow-xl transition-all">
                             <CourseCard course={course} />
                        </div>
                    ))
                ) : (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-sm rounded-[2rem] aspect-[16/22] animate-pulse" />
                    ))
                )}
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Interactive Experience Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
                <VideoCallGrid />
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 hidden md:block">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                            <Star size={20} fill="white" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-900 leading-none">4.9/5</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Average Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    {t.experience.title}
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    {t.experience.desc}
                </p>

                <div className="space-y-6 pt-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                            <MessageCircle className="text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Instant Help!</h4>
                            <p className="text-sm text-slate-500 font-medium">Edoo provides engaging instructor content people everywhere and of all ages without having to leave house.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                            <Zap className="text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Unlimited Learning</h4>
                            <p className="text-sm text-slate-500 font-medium">Edoo provides engaging instructor content people everywhere and of all ages without having to leave house.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-10 flex gap-12">
                    <div className="space-y-1">
                        <h4 className="text-3xl font-bold text-primary">13 Million+</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hours of 1-on-1 instruction</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-3xl font-bold text-primary">3000+</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Our subject to explore</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Udemy-style Course Discovery Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1600px] mx-auto">
            <div className="mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                    Skills to transform your career and life
                </h2>
                <p className="text-lg text-slate-500 font-medium max-w-2xl">
                    From critical skills to technical topics, EduFlow supports your professional development.
                </p>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                <div className="flex gap-8 min-w-max">
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveTab(cat._id)}
                            className={clsx(
                                "pb-4 text-sm font-bold transition-all border-b-2",
                                activeTab === cat._id 
                                    ? "border-slate-900 text-slate-900" 
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content: Top 4 Courses for Active Category */}
            <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-slate-200 rounded-3xl aspect-[16/20] animate-pulse" />
                        ))
                    ) : (
                        courses
                            .filter(course => course.category?._id === activeTab || course.category === activeTab)
                            .slice(0, 4)
                            .map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))
                    )}
                </div>

                {/* Direct to Explore Link */}
                <div className="pt-4">
                    <Link 
                        href={`/explore?category=${activeTab}`}
                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline group"
                    >
                        Show all {categories.find(c => c._id === activeTab)?.name} courses
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-16">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-4">Support Center</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
                {[
                    { q: "How do I enroll in a course?", a: "Simply browse our extensive catalog, click on a course that interests you, and click 'Enroll Now'. You can then proceed to checkout or start learning immediately if the course is free." },
                    { q: "Can I access my courses on mobile devices?", a: "Yes! EduFlow is fully responsive. You can access your lessons, take quizzes, and track your progress on any smartphone, tablet, or desktop with an internet connection." },
                    { q: "Will I receive a certificate upon completion?", a: "Absolutely. Once you successfully complete all the modules and mandatory quizzes in a course, a professional digital certificate will be generated in your dashboard." },
                    { q: "How can I contact my instructor if I have questions?", a: "Each course features a dedicated Q&A section where you can post questions. You can also message your instructor directly through your student dashboard for more personalized help." },
                    { q: "Do you offer a refund if I'm not satisfied?", a: "We want you to be 100% happy. We offer a 30-day money-back guarantee for all paid courses if you feel the content didn't meet your expectations." }
                ].map((item, i) => (
                    <details key={i} className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:shadow-xl transition-all duration-300">
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">{item.q}</h4>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-open:rotate-180 transition-transform duration-300">
                                <ChevronDown size={20} />
                            </div>
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed">
                            {item.a}
                        </div>
                    </details>
                ))}
            </div>
        </div>
      </section>

      <TestimonialSection />

      <Footer />
    </div>
  );
}
