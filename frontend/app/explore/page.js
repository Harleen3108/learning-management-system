'use client';
import { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    ChevronDown, 
    Star, 
    LayoutGrid, 
    List,
    SlidersHorizontal,
    X,
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    Users,
    Play,
    CheckCircle,
    ArrowRight,
    Plus,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import CourseCard from '@/components/CourseCard';
import { clsx } from 'clsx';
import HomeNavbar from '@/components/HomeNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ExplorePage() {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [activeTab, setActiveTab] = useState('Most popular');
    const [filters, setFilters] = useState({
        difficulty: '',
        rating: 0,
        priceRange: [0, 5000],
        sort: '-createdAt'
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    useEffect(() => {
        fetchCategories();
        
        // Handle URL parameters
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const catId = searchParams.get('category');
            const subId = searchParams.get('subcategory');
            if (catId) setSelectedCategory(catId);
            if (subId) setSelectedSubcategory(subId);
        }
        
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const cat = categories.find(c => c._id === selectedCategory);
            setCurrentCategory(cat);
        } else {
            setCurrentCategory(null);
        }
    }, [selectedCategory, categories]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCourses();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory, selectedSubcategory, filters]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.rating) params.append('rating', filters.rating);
            if (filters.sort) params.append('sort', filters.sort);
            
            const res = await api.get(`/courses?${params.toString()}`);
            setCourses(res.data.data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const parentCategories = categories.filter(c => !c.parentId && c.isVisibleOnHome);
    const subcategories = categories.filter(c => c.parentId === selectedCategory);

    return (
        <div className="min-h-screen bg-white">
            <HomeNavbar />

            {/* Hero Explore Section */}
            <section className={clsx(
                "py-16 px-6 transition-colors duration-500",
                currentCategory ? "bg-white border-b border-slate-100" : "bg-[#071739]"
            )}>
                <div className="max-w-[1600px] mx-auto">
                    {currentCategory ? (
                        <div className="space-y-8">
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
                            >
                                {currentCategory.name} Courses
                            </motion.h1>
                            <p className="max-w-4xl text-lg text-slate-600 font-medium leading-relaxed">
                                {currentCategory.description || `${currentCategory.name} courses teach machine simulation of human intelligence processes. Exploring ${currentCategory.name} is crucial for building smart systems and applications and is important for developers, researchers, and anyone interested in cutting-edge technology.`}
                            </p>
                            
                            {(() => {
                                // Compute real stats from the courses array
                                const rated = courses.filter(c => Number(c.averageRating) > 0);
                                const avg = rated.length
                                    ? rated.reduce((s, c) => s + Number(c.averageRating), 0) / rated.length
                                    : 0;
                                return (
                                    <div className="flex flex-wrap gap-8 items-center pt-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of courses</p>
                                            <p className="text-xl font-black text-slate-900">{courses.length.toLocaleString()}</p>
                                        </div>
                                        {avg > 0 && (
                                            <>
                                                <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average course rating</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-black text-slate-900">{avg.toFixed(1)}</p>
                                                        <Star size={18} fill="#F59E0B" className="text-orange-500" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex flex-wrap items-center gap-4 pt-6">
                                <span className="text-sm font-bold text-slate-400">Related:</span>
                                {subcategories.slice(0, 4).map(sub => (
                                    <button 
                                        key={sub._id}
                                        onClick={() => setSelectedSubcategory(sub._id)}
                                        className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-slate-900 transition-all"
                                    >
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-8">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-black text-white tracking-tight"
                            >
                                Explore the <span className="text-primary italic">Future</span> of Learning
                            </motion.h1>
                            <div className="max-w-2xl mx-auto relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
                                <input 
                                    type="text" 
                                    placeholder="Search for skills, software, or instructors..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/10 backdrop-blur-md border-2 border-white/10 rounded-[2.5rem] py-5 pl-16 pr-8 text-white font-bold placeholder:text-slate-400 focus:bg-white focus:text-[#071739] focus:border-white transition-all outline-none"
                                />
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-3 mt-8">
                                {parentCategories.map(cat => (
                                    <button 
                                        key={cat._id}
                                        onClick={() => {
                                            setSelectedCategory(cat._id);
                                            setSelectedSubcategory(null);
                                        }}
                                        className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <main className="max-w-[1600px] mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-72 space-y-10 shrink-0">
                        {/* Subcategories */}
                        {selectedCategory && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Specializations</h4>
                                <div className="space-y-1">
                                    {subcategories.map(sub => (
                                        <button 
                                            key={sub._id}
                                            onClick={() => setSelectedSubcategory(selectedSubcategory === sub._id ? null : sub._id)}
                                            className={clsx(
                                                "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group",
                                                selectedSubcategory === sub._id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            {sub.name}
                                            <ChevronDown size={14} className={clsx("-rotate-90 transition-opacity", selectedSubcategory === sub._id ? "opacity-100" : "opacity-0 group-hover:opacity-20")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Difficulty */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Difficulty</h4>
                            <div className="space-y-2">
                                {['beginner', 'intermediate', 'advanced'].map(level => (
                                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-[#071739] checked:border-[#071739] transition-all"
                                                checked={filters.difficulty === level}
                                                onChange={() => setFilters({ ...filters, difficulty: filters.difficulty === level ? '' : level })}
                                            />
                                            <X size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 capitalize">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Ratings */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Minimum Rating</h4>
                            <div className="space-y-2">
                                {[4.5, 4.0, 3.5, 3.0].map(star => (
                                    <button 
                                        key={star}
                                        onClick={() => setFilters({ ...filters, rating: filters.rating === star ? 0 : star })}
                                        className={clsx(
                                            "flex items-center gap-2 text-sm font-bold transition-all",
                                            filters.rating === star ? "text-orange-600" : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} size={14} fill={i <= star ? "currentColor" : "none"} className={i <= star ? "text-orange-500" : "text-slate-200"} />
                                            ))}
                                        </div>
                                        & Up
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-12">
                        {/* Featured Bundle Section (Image 2 style) */}
                        {currentCategory && courses.length >= 2 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-12"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                                            Looking to advance your skills in {currentCategory.name}? We've got you.
                                        </h3>
                                        <p className="text-slate-500 font-medium">Get everything you need to reach your goals in one convenient bundle.</p>
                                        <ul className="space-y-3">
                                            {['Top rated courses', 'Popular with learners just like you', 'Guidance from real-world experts'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                                    <CheckCircle size={18} className="text-emerald-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black text-slate-900">₹{(courses[0].price + courses[1].price).toLocaleString()}</span>
                                                <span className="text-lg text-slate-400 line-through">₹{((courses[0].price + courses[1].price) * 1.5).toLocaleString()}</span>
                                            </div>
                                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-emerald-900 transition-all">
                                                Add all to cart
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4">
                                        {courses.slice(0, 2).map((course, i) => (
                                            <div key={course._id} className={clsx("relative", i === 1 && "-ml-12 mt-12")}>
                                                <div className="w-48 lg:w-64 aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                                    <img src={course.thumbnail} className="w-full h-full object-cover" />
                                                </div>
                                                {i === 0 && (
                                                    <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400">
                                                        <Plus size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Courses to get you started (Tabs style) */}
                        {currentCategory && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900">Courses to get you started</h3>
                                    <p className="text-slate-500 font-medium">Explore courses from experienced, real-world experts.</p>
                                </div>
                                <div className="border-b border-slate-100 flex gap-8 overflow-x-auto min-w-max">
                                    {['Most popular', 'New', 'Beginner Favorites'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={clsx(
                                                "pb-4 text-sm font-black transition-all border-b-2",
                                                activeTab === tab ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {courses.slice(0, 3).map(course => (
                                        <CourseCard key={course._id} course={course} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Students also learn (Subcategories Grid style) */}
                        {currentCategory && subcategories.length > 0 && (
                            <div className="space-y-8">
                                <h3 className="text-2xl font-black text-slate-900">{currentCategory.name} students also learn</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {subcategories.map(sub => (
                                        <button 
                                            key={sub._id}
                                            onClick={() => setSelectedSubcategory(sub._id)}
                                            className="p-6 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-slate-900 hover:shadow-xl transition-all text-center flex flex-col items-center gap-3"
                                        >
                                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                                <TrendingUp size={20} />
                                            </div>
                                            <span className="text-sm">{sub.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Listings Section */}
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 p-4 rounded-[2rem] gap-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-black text-slate-900">All {currentCategory?.name || ''} courses</h3>
                                    <span className="text-sm font-bold text-slate-500">
                                        <span className="text-slate-900">{courses.length}</span> Results
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort By</label>
                                    <select 
                                        className="bg-white border-none rounded-xl py-2 pl-4 pr-10 text-xs font-bold text-slate-700 outline-none shadow-sm appearance-none"
                                        value={filters.sort}
                                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                    >
                                        <option value="-createdAt">Newest First</option>
                                        <option value="price">Price: Low to High</option>
                                        <option value="-price">Price: High to Low</option>
                                        <option value="-averageRating">Top Rated</option>
                                    </select>
                                </div>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-[#EBEEFF] p-6 rounded-2xl flex items-center gap-4 text-[#2D2F31] font-bold">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                    <Info size={20} className="text-[#5624D0]" />
                                </div>
                                <p className="text-sm leading-relaxed">Not sure? All courses have a 30-day money-back guarantee</p>
                            </div>

                            {/* Course Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-slate-50 aspect-[4/5] rounded-[2.5rem] animate-pulse"></div>
                                    ))}
                                </div>
                            ) : courses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {courses.map(course => (
                                        <CourseCard key={course._id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center space-y-6">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                        <Search size={40} className="text-slate-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">No courses found</h3>
                                        <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setFilters({ difficulty: '', rating: 0, sort: '-createdAt' });
                                            setSearchQuery('');
                                        }}
                                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        Reset Discovery
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
