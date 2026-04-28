'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Calendar, ShieldCheck, ArrowRight, Chrome } from 'lucide-react';
import { clsx } from 'clsx';
import HomeNavbar from '@/components/HomeNavbar';

export default function Login() {
    const [loginMethod, setLoginMethod] = useState('standard'); // 'standard' or 'advanced'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        parentName: '',
        studentName: '',
        studentDob: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', formData);
            const { token, data: user } = res.data;
            let role = user.role.toLowerCase();
            
            if (token) localStorage.setItem('token', token);
            
            if (role === 'super-admin') role = 'admin';
            
            const redirect = role === 'admin' ? '/dashboard/admin/analytics' : `/dashboard/${role}`;
            router.push(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HomeNavbar />
            <div className="min-h-screen flex bg-white font-sans selection:bg-emerald-100 overflow-hidden pt-20">
            {/* Left Side: Illustration & Branding */}
            <div className="hidden lg:flex flex-1 bg-slate-50 relative flex-col items-center justify-center p-12 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--accent-light)]/20 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center"
                >
                    {/* Main Illustration Container */}
                    <div className="relative w-full h-full">
                        {/* Circular Background like Udemy */}
                        <div className="absolute inset-0 bg-white rounded-full shadow-2xl border-8 border-slate-100 overflow-hidden">
                            {/* Embedded Premium SVG Illustration */}
                            <svg viewBox="0 0 400 400" className="w-full h-full p-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="200" cy="200" r="160" fill="#f8fafc" />
                                <rect x="120" y="140" width="160" height="120" rx="12" fill="white" stroke="#071739" strokeWidth="4" />
                                <path d="M120 180H280" stroke="#071739" strokeWidth="4" />
                                <circle cx="200" cy="160" r="15" fill="#A68868" />
                                <rect x="140" y="200" width="60" height="8" rx="4" fill="#071739" fillOpacity="0.2" />
                                <rect x="140" y="220" width="120" height="8" rx="4" fill="#071739" fillOpacity="0.1" />
                                <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                    d="M300 100 Q350 150 300 200 T300 300" 
                                    stroke="#071739" strokeWidth="4" strokeLinecap="round" opacity="0.3" 
                                />
                                <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                                    d="M100 100 Q50 150 100 200 T100 300" 
                                    stroke="#A68868" strokeWidth="4" strokeLinecap="round" opacity="0.5" 
                                />
                                {/* Characters */}
                                <g transform="translate(80, 240)">
                                    <circle cx="20" cy="20" r="20" fill="#E8C3A9" />
                                    <rect x="0" y="40" width="40" height="60" rx="10" fill="#071739" />
                                </g>
                                <g transform="translate(280, 100)">
                                    <circle cx="20" cy="20" r="20" fill="#4B3621" />
                                    <rect x="0" y="40" width="40" height="60" rx="10" fill="#A68868" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center relative z-10"
                >
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Join 50k+ Scholars</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
                        Master your <span className="text-[#071739]">Digital Craft</span> <br/> with EduFlow.
                    </h2>
                    <p className="text-slate-500 font-normal max-w-sm mx-auto">
                        Personalized learning paths designed to accelerate your career growth and intellectual mastery.
                    </p>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white z-40 overflow-y-auto">
                <div className="w-full max-w-[420px]">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Log in to continue your learning journey</h1>
                        <p className="text-slate-500 font-normal">Welcome back! Please enter your details.</p>
                    </div>

                    {/* Method Tabs */}
                    <div className="flex p-1 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
                        <button 
                            onClick={() => setLoginMethod('standard')}
                            className={clsx(
                                "flex-1 py-3 text-[11px] font-medium uppercase tracking-widest rounded-xl transition-all duration-300",
                                loginMethod === 'standard' ? "bg-white text-[#071739] shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Standard
                        </button>
                        <button 
                            onClick={() => setLoginMethod('advanced')}
                            className={clsx(
                                "flex-1 py-3 text-[11px] font-medium uppercase tracking-widest rounded-xl transition-all duration-300",
                                loginMethod === 'advanced' ? "bg-white text-[#071739] shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Parent Advanced
                        </button>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-semibold flex items-center gap-3"
                        >
                            <ShieldCheck size={18} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {loginMethod === 'standard' ? (
                                <motion.div 
                                    key="standard"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Email or Phone</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#071739] transition-colors" size={18} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter your email"
                                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 focus:ring-4 focus:ring-[#071739]/5 transition-all font-normal text-slate-800 placeholder:text-slate-300 placeholder:font-light"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                                            <Link href="#" className="text-xs font-medium text-[#071739] hover:underline">Forgot password?</Link>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#071739] transition-colors" size={18} />
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 focus:ring-4 focus:ring-[#071739]/5 transition-all font-normal text-slate-800 placeholder:text-slate-300 placeholder:font-light"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="advanced"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Parent's Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#071739] transition-colors" size={18} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Guardian Name"
                                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 focus:ring-4 focus:ring-[#071739]/5 transition-all font-normal text-slate-800 placeholder:text-slate-300 placeholder:font-light"
                                                value={formData.parentName}
                                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Student's Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Child Name"
                                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 focus:ring-4 focus:ring-[#071739]/5 transition-all font-normal text-slate-800 placeholder:text-slate-300 placeholder:font-light"
                                                value={formData.studentName}
                                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Student's DOB</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 focus:ring-4 focus:ring-[#071739]/5 transition-all font-normal text-slate-800"
                                                value={formData.studentDob}
                                                onChange={(e) => setFormData({ ...formData, studentDob: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#071739] transition-colors" size={18} />
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 focus:ring-4 focus:ring-[#071739]/5 transition-all font-normal text-slate-800 placeholder:text-slate-300 placeholder:font-light"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#071739] hover:bg-[#020a1a] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <>
                                    Log In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Other login options */}
                    <div className="mt-8">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                                <span className="bg-white px-4 text-slate-400 font-light">Other log in options</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]">
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-4">
                        <p className="text-sm font-normal text-slate-500">
                            Don't have an account? <Link href="/register" className="text-[#071739] font-semibold hover:underline ml-1">Sign up</Link>
                        </p>
                        <button className="text-xs font-semibold text-[#071739] uppercase tracking-widest hover:underline">
                            Log in with your organization
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}
