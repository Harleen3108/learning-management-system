'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Users as UsersIcon, 
    Mail, 
    Lock, 
    Check, 
    ArrowRight, 
    Calendar, 
    Phone, 
    Heart, 
    ArrowLeft,
    ShieldCheck,
    GraduationCap,
    Chrome
} from 'lucide-react';
import { clsx } from 'clsx';
import HomeNavbar from '@/components/HomeNavbar';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';

export default function Register() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        dob: '',
        phone: '',
        parentName: '',
        parentEmail: '',
        parentPhone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const nextStep = () => {
        setError('');
        if (step === 1 && !formData.role) {
            setError('Please select your role first.');
            return;
        }
        if (step === 2) {
            if (!formData.email || !formData.password) {
                setError('Email and Password are required.');
                return;
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters.');
                return;
            }
        }
        if (step === 3) {
            if (!formData.name || !formData.phone || !formData.dob) {
                setError('All profile details are required.');
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleGoogleSuccess = async (tokenResponse) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/google', { 
                access_token: tokenResponse.access_token,
                role: formData.role 
            });
            const { token, data: user } = res.data;
            let role = user.role.toLowerCase();
            
            if (token) {
                localStorage.setItem('token', token);
                useAuthStore.getState().setUser(user);
            }
            
            if (role === 'super-admin') role = 'admin';
            
            const redirect = role === 'admin' ? '/dashboard/admin/analytics' : `/dashboard/${role}`;
            router.push(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Google Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google Signup Failed')
    });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.role === 'student') {
            if (!formData.parentName) {
                setError('Parent Name is required.');
                setLoading(false);
                return;
            }
            if (!formData.parentEmail && !formData.parentPhone) {
                setError('At least one Parent contact (Email or Phone) is required.');
                setLoading(false);
                return;
            }
        }

        try {
            await api.post('/auth/register', formData);
            router.push('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center gap-2 mb-10 justify-center lg:justify-start">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                    <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500",
                        step === i ? "bg-[#071739] text-white ring-4 ring-slate-100 shadow-lg" : 
                        step > i ? "bg-[#A68868] text-white" : "bg-slate-100 text-slate-400"
                    )}>
                        {step > i ? <Check size={14} /> : i}
                    </div>
                    {i < 4 && <div className={clsx("w-8 h-[2px] mx-1", step > i ? "bg-[#A68868]" : "bg-slate-100")} />}
                </div>
            ))}
        </div>
    );

    return (
        <>
            <HomeNavbar />
            <div className="min-h-screen flex bg-white font-sans selection:bg-slate-100 pt-20">
                {/* Left Side: Illustration & Branding */}
                <div className="hidden lg:flex flex-1 bg-slate-50 relative flex-col items-center justify-center p-12 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#E3C39D]/20 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center"
                    >
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-white rounded-full shadow-2xl border-8 border-slate-100 overflow-hidden flex items-center justify-center">
                                <svg viewBox="0 0 400 400" className="w-full h-full p-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="200" cy="200" r="160" fill="#f8fafc" />
                                    <motion.path 
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                        d="M100 200 C 100 100, 300 100, 300 200 S 100 300, 100 200" 
                                        stroke="#071739" strokeWidth="2" strokeDasharray="10 10" opacity="0.2"
                                    />
                                    <g transform="translate(140, 140)">
                                        <rect width="120" height="120" rx="20" fill="white" stroke="#071739" strokeWidth="4" />
                                        <rect x="20" y="30" width="80" height="6" rx="3" fill="#071739" opacity="0.1" />
                                        <rect x="20" y="50" width="60" height="6" rx="3" fill="#071739" opacity="0.05" />
                                        <circle cx="90" cy="90" r="15" fill="#A68868" />
                                        <path d="M85 90L88 93L95 86" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
                        <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
                            Unlock your <span className="text-[#071739]">Full Potential</span> <br/> with EduFlow.
                        </h2>
                        <p className="text-slate-500 font-normal max-w-sm mx-auto">
                            Join a global community of learners and experts dedicated to mastery and growth.
                        </p>
                    </motion.div>
                </div>

                {/* Right Side: Step-Based Form */}
                <div className="flex-[1.2] flex flex-col items-center justify-center p-8 bg-white z-40 overflow-y-auto min-h-screen">
                    <div className="w-full max-w-[500px]">
                        <div className="mb-10 text-center lg:text-left">
                            {renderStepIndicator()}
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                                {step === 1 ? 'Choose your path' : 
                                 step === 2 ? 'Security first' :
                                 step === 3 ? 'Personal details' : 'Almost there'}
                            </h1>
                            <p className="text-slate-500 font-normal">
                                {step === 1 ? 'Select the role that fits your goals.' : 
                                 step === 2 ? 'Create your secure account credentials.' :
                                 step === 3 ? 'Tell us a bit about yourself.' : 
                                 'Final steps to complete your registration.'}
                            </p>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3"
                                >
                                    <ShieldCheck size={18} className="shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setFormData({...formData, role: 'student'})}
                                                className={clsx(
                                                    "p-6 rounded-3xl border-2 transition-all cursor-pointer group relative",
                                                    formData.role === 'student' ? "bg-slate-50 border-[#071739] shadow-xl shadow-slate-200" : "bg-white border-slate-100 hover:border-slate-200"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                                    formData.role === 'student' ? "bg-[#071739] text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    <GraduationCap size={24} />
                                                </div>
                                                <h3 className="font-bold text-slate-900">Student</h3>
                                                <p className="text-xs text-slate-500 mt-1">Learn & Grow</p>
                                                {formData.role === 'student' && <div className="absolute top-4 right-4 text-[#071739]"><Check size={20} strokeWidth={3} /></div>}
                                            </div>

                                            <div
                                                onClick={() => setFormData({...formData, role: 'instructor'})}
                                                className={clsx(
                                                    "p-6 rounded-3xl border-2 transition-all cursor-pointer group relative",
                                                    formData.role === 'instructor' ? "bg-slate-50 border-[#071739] shadow-xl shadow-slate-200" : "bg-white border-slate-100 hover:border-slate-200"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                                    formData.role === 'instructor' ? "bg-[#071739] text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    <UsersIcon size={24} />
                                                </div>
                                                <h3 className="font-bold text-slate-900">Instructor</h3>
                                                <p className="text-xs text-slate-500 mt-1">Teach & Inspire</p>
                                                {formData.role === 'instructor' && <div className="absolute top-4 right-4 text-[#071739]"><Check size={20} strokeWidth={3} /></div>}
                                            </div>
                                        </div>

                                        {/* Quick signup with Google — visible right after picking a role.
                                            For students/instructors the OAuth flow is one-click; parents still
                                            need the multi-step form because we collect child info, so we hide
                                            the button if/when the parent role becomes selectable. */}
                                        <div className="pt-2">
                                            <div className="relative mb-5">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-slate-100"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span className="bg-white px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                                        Or sign up in one click
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => googleLogin()}
                                                disabled={loading}
                                                className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                                <span>Continue with Google as {formData.role === 'instructor' ? 'an instructor' : 'a student'}</span>
                                            </button>
                                            <p className="text-[10px] text-slate-400 font-medium text-center mt-3">
                                                Fastest way in. We'll grab your name & email from Google — you can fill the rest later.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div 
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#071739]" size={18} />
                                                <input 
                                                    type="email" 
                                                    autoComplete="email"
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#071739]" size={18} />
                                                <input 
                                                    type="password" 
                                                    autoComplete="new-password"
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-2">
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-slate-100"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                                    <span className="bg-white px-4 text-slate-400">Or sign up with</span>
                                                </div>
                                            </div>

                                            <button type="button" onClick={() => googleLogin()} className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]">
                                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                                <span>Continue with Google</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div 
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    autoComplete="name"
                                                    required
                                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Phone</label>
                                                <input 
                                                    type="tel" 
                                                    autoComplete="tel"
                                                    required
                                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Date of Birth</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="date" 
                                                    required
                                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                    value={formData.dob}
                                                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div 
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        {formData.role === 'student' ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-[#A68868] mb-2">
                                                    <Heart size={20} fill="currentColor" />
                                                    <h4 className="text-xs font-bold uppercase tracking-widest">Parental Verification Required</h4>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Parent Name</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                        value={formData.parentName}
                                                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Parent Email</label>
                                                        <input 
                                                            type="email" 
                                                            className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                            value={formData.parentEmail}
                                                            onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Parent Phone</label>
                                                        <input 
                                                            type="tel" 
                                                            className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#071739]/20 transition-all font-normal text-slate-800"
                                                            value={formData.parentPhone}
                                                            onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center space-y-4">
                                                <div className="w-20 h-20 bg-slate-50 text-[#A68868] rounded-full flex items-center justify-center mx-auto">
                                                    <Check size={40} strokeWidth={3} />
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900">Ready to start!</h3>
                                                <p className="text-slate-500 font-normal">Your instructor profile is ready for creation.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4 pt-6">
                                {step > 1 && (
                                    <button 
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                )}
                                {step < 4 ? (
                                    <button 
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-[2] bg-[#071739] text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                                    >
                                        Continue
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] bg-[#071739] text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Creating Account...' : 'Complete Registration'}
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-sm font-normal text-slate-500">
                                Already have an account? <Link href="/login" className="text-[#071739] font-bold hover:underline ml-1">Sign in here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
