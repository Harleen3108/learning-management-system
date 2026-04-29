'use client';
import { useState, useEffect } from 'react';
import { 
    Infinity as InfinityIcon,
    ArrowRight,
    Play,
    Tag,
    Share2,
    Gift,
    X,
    Star,
    Users,
    Info,
    Globe,
    PlayCircle,
    FileText,
    Smartphone,
    Trophy,
    ChevronDown,
    ChevronUp,
    Check,
    Lock,
    Unlock,
    Baby,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CourseLandingPage({ courseId, isEnrolled, onStartLearning }) {
    const router = useRouter();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const [scrolled, setScrolled] = useState(false);
    const [purchaseMode, setPurchaseMode] = useState('subscription');

    // Coupon state — validated against /coupons/validate when "Apply" is pressed.
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountType, discountValue }
    const [couponBusy, setCouponBusy] = useState(false);
    const [couponError, setCouponError] = useState('');

    const [shareCopied, setShareCopied] = useState(false);

    const [relatedCourses, setInstructorCourses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const { user, isLoading: authLoading } = useAuthStore();
    const [showFullDescription, setShowFullDescription] = useState(false);
    const { items, addToCart } = useCartStore();
    const isInCart = items.some(item => item._id === courseId);
    const [enrollLoading, setEnrollLoading] = useState(false);

    // Use the discounted price when set & lower than the list price
    const list = Number(course?.price) || 0;
    const disc = Number(course?.discountPrice) || 0;
    const payable = disc > 0 && disc < list ? disc : list;

    const handleAddToCart = () => {
        if (!course) return;
        if (isInCart) {
            router.push('/dashboard/cart');
        } else {
            addToCart({ ...course, payable });
        }
    };

    const handleBuyNow = () => {
        if (!course) return;
        if (!isInCart) addToCart({ ...course, payable });
        router.push('/dashboard/cart');
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponBusy(true);
        setCouponError('');
        try {
            const res = await api.post('/coupons/validate', { code: couponCode.trim() });
            if (res.data?.success) {
                setAppliedCoupon(res.data.data);
                setCouponCode('');
            } else {
                setCouponError(res.data?.message || 'Invalid coupon');
            }
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Could not apply coupon');
        } finally {
            setCouponBusy(false);
        }
    };

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const title = course?.title || 'EduFlow course';
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 1800);
            }
        } catch (err) { /* user dismissed or no clipboard */ }
    };

    // Computed coupon discount applied to the displayed price
    const couponDiscount = appliedCoupon
        ? (appliedCoupon.discountType === 'percentage'
            ? Math.round((payable * appliedCoupon.discountValue) / 100)
            : Math.min(payable, Math.round(appliedCoupon.discountValue)))
        : 0;
    const finalPrice = Math.max(0, payable - couponDiscount);

    const handleFreeEnroll = async () => {
        setEnrollLoading(true);
        try {
            await api.post(`/enrollments/${course._id}`);
            window.location.reload();
        } catch (err) {
            console.error('Failed to enroll:', err);
            alert('Error enrolling in the free course. Please try again.');
        } finally {
            setEnrollLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const courseRes = await api.get(`/courses/${courseId}`);
                
                const courseData = courseRes.data.data;
                setCourse(courseData);
                
                if (courseData.price === 0) {
                    setPurchaseMode('individual');
                }
                
                // Fetch more courses in the same category (fall back to subcategory if available)
                const catId = courseData.category?._id || courseData.category;
                if (catId) {
                    try {
                        const relatedRes = await api.get(`/courses?category=${catId}&limit=6`);
                        // Drop the current course, then keep the top 6
                        const related = (relatedRes.data.data || [])
                            .filter(c => c._id !== courseId)
                            .slice(0, 6);
                        setInstructorCourses(related);
                    } catch (e) {
                        console.warn('Failed to fetch related courses');
                    }
                }

                // Fetch reviews
                const reviewsRes = await api.get(`/reviews/course/${courseId}`);
                setReviews(reviewsRes.data.data || []);

            } catch (err) {
                console.error('Failed to fetch course data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

        const handleScroll = () => {
            setScrolled(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [courseId]);

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <p className="font-medium text-slate-400 uppercase text-[10px] tracking-[0.2em]">Preparing Course Narrative...</p>
            </div>
        </div>
    );

    if (!course) return <div className="p-20 text-center font-medium text-slate-400">Course not found.</div>;

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    
    return (
        <div className="min-h-screen bg-white font-sans text-[#071739] relative">
            {/* Sticky Top Bar (appears on scroll) */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div
                        initial={{ y: -80 }}
                        animate={{ y: 0 }}
                        exit={{ y: -80 }}
                        className="fixed top-0 left-0 right-0 z-[100] bg-[#071739] text-white shadow-2xl border-b border-white/10"
                    >
                        <div className="max-w-[1340px] mx-auto px-6 lg:px-8 py-3 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-8">
                                <h3 className="text-white font-semibold text-sm truncate">{course.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    {course.averageRating >= 4.5 && reviews.length >= 10 && (
                                        <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold text-[8px] uppercase">Bestseller</div>
                                    )}
                                    {reviews.length > 0 && (
                                        <>
                                            <span className="text-[#f69c08] font-semibold text-xs">{Number(course.averageRating || 0).toFixed(1)} ★</span>
                                            <span className="text-white/50 text-xs font-medium">({reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'})</span>
                                        </>
                                    )}
                                    {course.enrolledCount > 0 && (
                                        <span className="text-white/50 text-xs font-medium">{course.enrolledCount.toLocaleString()} students</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dark Hero Section */}
            <header className="bg-[#071739] text-white py-12 lg:py-20 overflow-hidden relative">
                <div className="max-w-[1340px] mx-auto px-6 lg:px-8">
                    <div className="lg:max-w-[700px] space-y-6">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
                            <Link href="#" className="hover:underline">
                                {typeof course.category === 'object' ? course.category?.name : course.category}
                            </Link>
                            <span className="text-white/40">›</span>
                            <Link href="#" className="hover:underline">
                                {(typeof course.subcategory === 'object' ? course.subcategory?.name : course.subcategory) || 'General'}
                            </Link>
                            {course.topic && (
                                <>
                                    <span className="text-white/40">›</span>
                                    <Link href="#" className="hover:underline">{course.topic}</Link>
                                </>
                            )}
                        </div>

                        <h1 className="text-white text-3xl lg:text-[2.5rem] font-semibold tracking-tight leading-[1.15] max-w-3xl">
                            {course.title}
                        </h1>
                        
                        <p className="text-lg font-medium text-white/90 max-w-2xl leading-relaxed">
                            {course.subtitle || course.tagline || course.description?.slice(0, 150)}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {course.averageRating >= 4.5 && reviews.length >= 10 && (
                                <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2 py-1 rounded-sm font-semibold text-[10px] uppercase">Bestseller</div>
                            )}
                            {reviews.length > 0 ? (
                                <>
                                    <div className="flex items-center gap-1.5 text-[#f69c08] font-semibold">
                                        <span>{Number(course.averageRating || 0).toFixed(1)}</span>
                                        <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              size={12}
                                              fill={i < Math.round(course.averageRating || 0) ? 'currentColor' : 'none'}
                                              className={i < Math.round(course.averageRating || 0) ? 'text-[#f69c08]' : 'text-white/30'}
                                            />
                                          ))}
                                        </div>
                                    </div>
                                    <Link href="#reviews" className="text-blue-100 underline underline-offset-4 font-medium text-xs">
                                        ({reviews.length.toLocaleString()} {reviews.length === 1 ? 'rating' : 'ratings'})
                                    </Link>
                                </>
                            ) : (
                                <span className="text-white/60 text-xs font-medium italic">Be the first to review this course</span>
                            )}
                            {course.enrolledCount > 0 && (
                                <span className="font-medium text-white/70 text-xs">{course.enrolledCount.toLocaleString()} students</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/90">
                            <span>Created by <Link href={`/instructors/${course.instructor?._id}`} className="text-blue-100 underline underline-offset-4">{course.instructor?.name}</Link></span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-white/80">
                            <div className="flex items-center gap-2">
                                <Info size={14} className="text-white/50" /> 
                                Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-white/50" /> 
                                {course.language || 'English'}
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-white/50" /> 
                                English [Auto], Arabic [Auto], 23 more
                            </div>
                        </div>

                        {/* Mobile Price & CTAs (hidden on desktop) */}
                        <div className="lg:hidden space-y-4 pt-6 border-t border-white/10">
                            <div className="flex items-baseline gap-3">
                                {course.price === 0 ? (
                                    <>
                                        <span className="text-3xl font-semibold text-white">Free</span>
                                        <span className="text-lg text-white/50 line-through font-medium">₹3,089</span>
                                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest">Free Course</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-3xl font-semibold text-white">₹{course.discountPrice || course.price || '499'}</span>
                                        {course.discountPrice && <span className="text-lg text-white/50 line-through font-medium">₹{course.price || '3,089'}</span>}
                                        {course.discountPrice && (
                                            <span className="text-emerald-400 font-medium text-sm">
                                                {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {course.price === 0 ? (
                                <button 
                                    onClick={handleFreeEnroll}
                                    disabled={enrollLoading}
                                    className="w-full bg-blue-600 text-white py-4 font-semibold text-sm rounded-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {enrollLoading ? 'Enrolling...' : 'Enroll for Free'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className={clsx(
                                        "w-full py-4 font-semibold text-sm rounded-sm shadow-xl active:scale-95 transition-all",
                                        isInCart ? "bg-white text-slate-900 border border-slate-200" : "bg-blue-600 text-white"
                                    )}
                                >
                                    {isInCart ? 'Go to cart' : 'Add to cart'}
                                </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="w-full py-3 border border-white/20 text-white font-semibold text-xs uppercase rounded-sm hover:bg-white/5 transition-all"
                            >
                                {shareCopied ? 'Link copied!' : 'Share course'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content & Sticky Sidebar Container */}
            <div className="max-w-[1340px] mx-auto px-6 lg:px-8 relative flex flex-row-reverse gap-10">
                
                {/* Sticky Sidebar (Desktop) - Udemy style */}
                <aside className="hidden lg:block sticky top-24 z-50 w-[340px] h-fit -mt-[320px]">
                    <div className="bg-white shadow-2xl border border-slate-200 rounded-sm overflow-hidden">
                {/* Preview Image/Video */}
                <div className="aspect-video relative group cursor-pointer border-b border-slate-200">
                    <img src={course.thumbnail} alt="Course Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl group-hover:scale-110 transition-transform">
                            <Play size={24} fill="currentColor" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white font-semibold text-sm drop-shadow-md">
                        Preview this course
                    </div>
                </div>

                <div className="p-0">
                    <div className="flex flex-col">
                        {isEnrolled ? (
                            <div className="p-6 space-y-4">
                                <button 
                                    onClick={onStartLearning}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 font-semibold text-sm transition-all rounded-sm shadow-lg flex items-center justify-center gap-2"
                                >
                                    Go to Course
                                </button>
                                <p className="text-center text-[10px] font-medium text-slate-500 uppercase tracking-widest">You are enrolled in this course</p>
                            </div>
                        ) : (
                            <>
                                {/* Subscription Option */}
                                {course.price > 0 && (
                                    <div 
                                        onClick={() => setPurchaseMode('subscription')}
                                        className={clsx(
                                            "p-6 cursor-pointer transition-all border-b border-slate-100",
                                            purchaseMode === 'subscription' ? "bg-slate-50" : "hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={clsx(
                                                "w-5 h-5 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center",
                                                purchaseMode === 'subscription' ? "border-slate-900" : "border-slate-300"
                                            )}>
                                                {purchaseMode === 'subscription' && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 leading-tight">Subscribe and save</h4>
                                                <p className="text-xl font-semibold tracking-tight mt-1">
                                                    From ₹375.00 <span className="text-slate-400 font-medium text-sm line-through">₹500.00</span> <span className="text-slate-500 font-medium text-sm">/month</span>
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1">Access to 28,000+ top-rated courses</p>
                                                
                                                {purchaseMode === 'subscription' && (
                                                    <div className="space-y-4 mt-6">
                                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 font-semibold text-sm transition-all rounded-sm shadow-lg">
                                                            Start subscription
                                                        </button>
                                                        <p className="text-[10px] text-center text-slate-500">Cancel anytime</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Individual Purchase Option */}
                                <div 
                                    onClick={() => setPurchaseMode('individual')}
                                    className={clsx(
                                        "p-6 cursor-pointer transition-all",
                                        purchaseMode === 'individual' ? "bg-slate-50" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={clsx(
                                            "w-5 h-5 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center",
                                            purchaseMode === 'individual' ? "border-slate-900" : "border-slate-300"
                                        )}>
                                            {purchaseMode === 'individual' && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 leading-tight">
                                                {course.price === 0 ? 'Free Course' : 'Buy individual course'}
                                            </h4>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                {course.price === 0 ? (
                                                    <>
                                                        <span className="text-xl font-semibold tracking-tight text-emerald-600">Free</span>
                                                        <span className="text-slate-400 line-through font-medium text-sm">₹3,089</span>
                                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest ml-1">Free Course</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-xl font-semibold tracking-tight">₹{course.discountPrice || course.price || '499'}</span>
                                                        {course.discountPrice && <span className="text-slate-400 line-through font-medium text-sm">₹{course.price || '3,089'}</span>}
                                                        {course.discountPrice && (
                                                            <span className="text-slate-900 font-medium text-sm">
                                                                {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {purchaseMode === 'individual' && (
                                                <div className="space-y-3 mt-6">
                                                    {course.price === 0 ? (
                                                        <button 
                                                            onClick={handleFreeEnroll}
                                                            disabled={enrollLoading}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 font-semibold text-sm transition-all rounded-sm shadow-lg disabled:opacity-50"
                                                        >
                                                            {enrollLoading ? 'Enrolling...' : 'Enroll for Free'}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={handleAddToCart}
                                                                className={clsx(
                                                                    "w-full py-4 font-semibold text-sm transition-all rounded-sm",
                                                                    isInCart ? "bg-white text-slate-900 border border-slate-900" : "border border-slate-900 text-slate-900 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {isInCart ? 'Go to cart' : 'Add to cart'}
                                                            </button>
                                                            <button
                                                                onClick={handleBuyNow}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 font-semibold text-sm transition-all rounded-sm shadow-lg shadow-blue-600/20"
                                                            >
                                                                Buy now
                                                            </button>
                                                            {appliedCoupon && (
                                                                <p className="text-[11px] font-medium text-emerald-600 text-center">
                                                                    Coupon {appliedCoupon.code} will apply at checkout — final ₹{finalPrice}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                    {/* Share button — Wishlist removed per spec */}
                    <div className="p-6 border-t border-slate-100">
                        <button
                            onClick={handleShare}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-900 font-semibold text-xs hover:bg-slate-50 transition-all"
                        >
                            <Share2 size={16} /> {shareCopied ? 'Link copied!' : 'Share'}
                        </button>
                    </div>

                        <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm text-slate-900">Apply Coupon</span>
                                <Gift size={16} className="text-slate-400" />
                            </div>

                            {appliedCoupon ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-emerald-900">{appliedCoupon.code} applied</p>
                                        <p className="text-[10px] font-medium text-emerald-600">
                                            {appliedCoupon.discountType === 'percentage'
                                                ? `${appliedCoupon.discountValue}% off`
                                                : `₹${appliedCoupon.discountValue} off`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setAppliedCoupon(null); setCouponError(''); }}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"
                                        aria-label="Remove coupon"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Coupon"
                                            className="flex-1 border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-slate-900 transition-colors uppercase tracking-wider"
                                            value={couponCode}
                                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode.trim() || couponBusy}
                                            className="px-6 py-3 bg-blue-600 text-white font-semibold text-xs uppercase hover:bg-blue-700 transition-all disabled:opacity-50"
                                        >
                                            {couponBusy ? '…' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-[11px] font-medium text-rose-500">{couponError}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </aside>

                <div className="flex-1 py-12 space-y-12">
                    
                    {/* 1. What you'll learn */}
                    <section id="what-you-will-learn" className="border border-slate-200 p-8 lg:p-10 rounded-sm bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold mb-8 tracking-tight">What you'll learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn.map((point, i) => (
                                <div key={i} className="flex gap-4 text-sm font-medium text-slate-600 leading-relaxed">
                                    <Check className="shrink-0 text-slate-400" size={18} />
                                    <span>{point}</span>
                                </div>
                            )) : (
                                <div className="flex gap-4 text-sm font-medium text-slate-600 leading-relaxed">
                                    <Check className="shrink-0 text-slate-400" size={18} />
                                    <span>Master the core concepts of this subject.</span>
                                </div>
                            )}
                        </div>
                        <button className="text-blue-600 font-semibold text-xs uppercase tracking-widest mt-8 flex items-center gap-2">
                            Show more <ChevronDown size={14} />
                        </button>
                    </section>

                    {/* 2. This course includes */}
                    <section id="course-includes" className="space-y-6">
                        <h2 className="text-2xl font-semibold tracking-tight">This course includes:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                <PlayCircle size={18} className="text-slate-400" />
                                <span>14.5 hours on-demand video</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                <FileText size={18} className="text-slate-400" />
                                <span>25 downloadable resources</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                <InfinityIcon size={18} className="text-slate-400" />
                                <span>Full lifetime access</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                <Smartphone size={18} className="text-slate-400" />
                                <span>Access on mobile and TV</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                <Trophy size={18} className="text-slate-400" />
                                <span>Certificate of completion</span>
                            </div>
                        </div>
                    </section>

                    {/* 3. Course Content */}
                    <section id="curriculum">
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Course content</h2>
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                                <span>{course.modules.length} sections</span>
                                <span className="text-slate-300">•</span>
                                <span>{totalLessons} lectures</span>
                                <span className="text-slate-300">•</span>
                                <span>3h 25m total length</span>
                            </div>
                            <button 
                                onClick={() => {
                                    const allExp = {};
                                    course.modules.forEach(m => allExp[m._id] = true);
                                    setExpandedModules(allExp);
                                }}
                                className="text-blue-600 font-semibold hover:text-blue-700 transition-all"
                            >
                                Expand all sections
                            </button>
                        </div>

                        <div className="border border-slate-200 divide-y divide-slate-200">
                            {course.modules.map((module) => (
                                <div key={module._id}>
                                    <button 
                                        onClick={() => toggleModule(module._id)}
                                        className="w-full flex items-center justify-between p-4 lg:p-6 bg-[#f7f9fa] hover:bg-slate-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            {expandedModules[module._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            <span className="font-semibold text-left">{module.title}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
                                            {module.lessons.length} lectures • 15min
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedModules[module._id] && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-white"
                                            >
                                                <div className="divide-y divide-slate-100">
                                                    {module.lessons.map((lesson) => (
                                                        <div key={lesson._id} className="flex items-center justify-between p-4 pl-12 text-sm">
                                                            <div className="flex items-center gap-4 text-slate-600">
                                                                <PlayCircle size={16} className="text-slate-400" />
                                                                <span className={clsx(
                                                                    "font-medium",
                                                                    lesson.isFree ? "text-blue-600 underline cursor-pointer" : ""
                                                                )}>{lesson.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-6 text-slate-400 font-medium">
                                                                {lesson.isFree ? (
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-blue-600 underline cursor-pointer">Preview</span>
                                                                        <Unlock size={14} className="text-emerald-500" />
                                                                    </div>
                                                                ) : (
                                                                    <Lock size={14} className="text-slate-300" />
                                                                )}
                                                                <span>02:45</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. Requirements */}
                    <section id="requirements">
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Requirements</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm font-medium text-slate-600 leading-relaxed">
                            {course.requirements?.length > 0 ? course.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                            )) : (
                                <li>No specific requirements listed.</li>
                            )}
                        </ul>
                    </section>

                    {/* 5. Description */}
                    <section id="description" className="space-y-6">
                        <h2 className="text-2xl font-semibold tracking-tight">Description</h2>
                        <div className={clsx(
                            "text-sm font-medium text-slate-600 leading-[1.8] space-y-4 relative overflow-hidden transition-all duration-500",
                            !showFullDescription && "max-h-[250px]"
                        )}>
                            <div dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, '<br />') }} />
                            {!showFullDescription && (
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                            )}
                        </div>
                        <button 
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-blue-600 font-semibold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-blue-700"
                        >
                            {showFullDescription ? 'Show less' : 'Show more'} 
                            {showFullDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </section>

                    {/* Parent-Only Benefits Section */}
                    {user?.role === 'parent' && (
                        <section className="bg-blue-50/50 p-10 rounded-[2rem] border border-blue-100 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                                    <Baby size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Parental Insights</h2>
                                    <p className="text-sm font-medium text-blue-600 uppercase tracking-widest">Why this course is good for your child</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-500" /> Skill Outcomes
                                    </h4>
                                    <ul className="space-y-2 text-sm font-medium text-slate-600">
                                        <li className="flex items-start gap-2"><Check size={14} className="mt-1 shrink-0" /> Critical problem-solving skills</li>
                                        <li className="flex items-start gap-2"><Check size={14} className="mt-1 shrink-0" /> Career relevance in consulting</li>
                                        <li className="flex items-start gap-2"><Check size={14} className="mt-1 shrink-0" /> Financial literacy foundation</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <Activity size={18} className="text-blue-500" /> Progress Visibility
                                    </h4>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                        As a parent, you will have 100% visibility into your child's completion rate, quiz results, and time spent on each module.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-blue-100 flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-white rounded-xl border border-blue-100 text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Clock size={14} /> Est. 12 Hours
                                </div>
                                <div className="px-4 py-2 bg-white rounded-xl border border-blue-100 text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Award size={14} /> Certified Outcome
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 6. Frequently Bought Together */}
                    <section className="bg-slate-50/50 p-8 rounded-sm border border-slate-100">
                        <h2 className="text-2xl font-semibold mb-8 tracking-tight">Frequently Bought Together</h2>
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-40 aspect-video rounded border border-slate-200 overflow-hidden shrink-0">
                                        <img src={course.thumbnail} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-2xl font-semibold text-slate-300">+</div>
                                    <div className="w-40 aspect-video rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-200 animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-600">Total price: <span className="text-xl font-semibold text-slate-900">₹{course.price + 499}</span></p>
                                    <button className="bg-blue-600 text-white px-8 py-3.5 font-semibold text-sm mt-4 hover:bg-blue-700 transition-all rounded-sm">
                                        Add both to cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. Instructor Details */}
                    <section id="instructor">
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Instructor</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Link href={`/instructors/${course.instructor?._id}`}>
                                    <h3 className="text-xl font-semibold text-blue-600 underline underline-offset-4 decoration-2 hover:text-blue-700 transition-colors">
                                        {course.instructor?.name}
                                    </h3>
                                </Link>
                                <p className="text-md font-medium text-slate-500">{course.instructor?.instructorSpecialty || 'Expert Consultant & Performance Optimizer'}</p>
                            </div>
                            
                            <div className="flex items-start gap-8">
                                <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-slate-50 shadow-sm">
                                    <img
                                        src={course.instructor?.profilePhoto === 'no-photo.jpg' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.name}` : course.instructor?.profilePhoto}
                                        alt="Instructor"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-3 text-sm font-semibold text-slate-700">
                                    {course.instructor?.averageRating > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg"><Star size={18} fill="currentColor" className="text-slate-900" /></div>
                                            <span>{Number(course.instructor.averageRating).toFixed(1)} Instructor Rating</span>
                                        </div>
                                    )}
                                    {course.instructor?.totalReviews > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg"><Trophy size={18} className="text-slate-900" /></div>
                                            <span>{course.instructor.totalReviews.toLocaleString()} {course.instructor.totalReviews === 1 ? 'Review' : 'Reviews'}</span>
                                        </div>
                                    )}
                                    {course.instructor?.totalStudents > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg"><Users size={18} className="text-slate-900" /></div>
                                            <span>{course.instructor.totalStudents.toLocaleString()} {course.instructor.totalStudents === 1 ? 'Student' : 'Students'}</span>
                                        </div>
                                    )}
                                    {course.instructor?.totalCourses > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg"><Play size={18} className="text-slate-900" /></div>
                                            <span>{course.instructor.totalCourses} {course.instructor.totalCourses === 1 ? 'Course' : 'Courses'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-4 max-w-3xl">
                                <p>{course.instructor?.instructorBio || "Expert in performance improvement, scaling businesses, and turning-around companies with significant experience both in management as well as in supervision of medium size companies and startups."}</p>
                                <p>I have trained in person over 100 consultants, business analysts, and managers who now are Investment Directors, CEO, Partners in PE and VC funds, Sales and Marketing Directors, Operational Directors, COO, Directors in Consulting Companies, Supply Chain Directors, Board Members, etc.</p>
                            </div>
                        </div>
                    </section>

                    {/* 8. Ratings & Reviews */}
                    <section id="reviews">
                        {reviews.length === 0 ? (
                            <div className="flex items-center gap-3 mb-8">
                                <Star size={24} className="text-slate-300" />
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-500">No ratings yet</h2>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mb-8">
                                <Star size={24} fill="currentColor" className="text-amber-500" />
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {Number(course.averageRating || 0).toFixed(1)} course rating · {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}
                                </h2>
                            </div>
                        )}

                        {reviews.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
                            {/* Real rating distribution bars */}
                            <div className="md:col-span-4 space-y-3">
                                {(() => {
                                    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                                    reviews.forEach(r => { const k = Math.round(r.rating || 0); if (buckets[k] != null) buckets[k]++; });
                                    return [5, 4, 3, 2, 1].map(stars => {
                                        const pct = reviews.length > 0 ? Math.round((buckets[stars] / reviews.length) * 100) : 0;
                                        return (
                                            <div key={stars} className="flex items-center gap-4 group cursor-default">
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        className="h-full bg-slate-600 group-hover:bg-slate-900 transition-colors"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 min-w-[80px]">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < stars ? "currentColor" : "none"} className="text-amber-500" />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">{pct}%</span>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {reviews.map((review, i) => (
                                    <div key={i} className="space-y-4 py-8 border-t border-slate-100 first:border-t-0 md:first:border-t-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                                                {review.user?.name?.charAt(0) || review.student?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">{review.user?.name || review.student?.name || 'Anonymous'}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex text-amber-500">
                                                        {[...Array(5)].map((_, j) => <Star key={j} size={10} fill={j < review.rating ? "currentColor" : "none"} />)}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                                            {review.comment || review.review}
                                        </p>
                                    </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </section>

                    {/* 9. More Courses in this category */}
                    {relatedCourses.length > 0 && (() => {
                        const catId = course.category?._id || course.category;
                        const catName = course.category?.name || (typeof course.category === 'string' ? '' : '');
                        return (
                            <section className="pt-12 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        More Courses {catName ? <>in <span className="text-blue-600">{catName}</span></> : 'you might like'}
                                    </h2>
                                    {catId && (
                                        <Link
                                            href={`/dashboard/explore?category=${catId}`}
                                            className="text-blue-600 font-semibold text-sm hover:underline"
                                        >
                                            View all
                                        </Link>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {relatedCourses.map(c => {
                                        const list = Number(c.price) || 0;
                                        const disc = Number(c.discountPrice) || 0;
                                        const payable = disc > 0 && disc < list ? disc : list;
                                        return (
                                            <Link key={c._id} href={`/dashboard/courses/${c._id}`} className="group space-y-3">
                                                <div className="aspect-video rounded overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
                                                    {c.thumbnail && c.thumbnail !== 'no-photo.jpg' && (
                                                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-all line-clamp-2 min-h-[2.5rem]">{c.title}</h4>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                                    {c.instructor?.name || 'EduFlow Mentor'}
                                                </p>
                                                {c.averageRating > 0 && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <span>{Number(c.averageRating).toFixed(1)}</span>
                                                        <div className="flex text-amber-500">
                                                            <Star size={10} fill="currentColor" />
                                                        </div>
                                                        {c.totalRatings > 0 && <span>({c.totalRatings.toLocaleString()})</span>}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {payable === 0 ? (
                                                        <span className="font-semibold text-emerald-600">Free</span>
                                                    ) : (
                                                        <>
                                                            <span className="font-semibold text-slate-900">₹{payable}</span>
                                                            {disc > 0 && disc < list && (
                                                                <span className="text-[11px] text-slate-400 font-medium line-through">₹{list}</span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })()}

                </div>
            </div>
        </div>
    );
}
