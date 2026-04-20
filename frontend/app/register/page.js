'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Users as UsersIcon, Mail, Lock, School, Check, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' // default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData);
            router.push('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100">
            {/* Left Side - Info & Testimonial (Hidden on Mobile) */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-1 bg-blue-600 relative items-center justify-center p-12 overflow-hidden"
            >
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat shadow-inner" />
                
                <div className="relative z-10 w-full max-w-lg">
                    <Link href="/" className="inline-flex items-center gap-2 mb-20 group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">E</div>
                        <span className="text-2xl font-black text-white tracking-tight">EduFlow</span>
                    </Link>

                    <h2 className="text-6xl font-black text-white tracking-tight leading-[0.9] mb-8">
                        Your journey to <br/> academic excellence <br/> <span className="text-blue-200 italic">starts here.</span>
                    </h2>
                    <p className="text-blue-100 text-lg font-medium leading-relaxed mb-16 max-w-md">
                        Join over 50,000 students and parents who use EduFlow to streamline learning, track progress, and achieve more together.
                    </p>

                    {/* Testimonial Glass Card */}
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 text-white shadow-2xl">
                        <div className="flex text-yellow-400 mb-4 gap-1">
                            {[1,2,3,4,5].map(i => <Check key={i} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-lg font-medium leading-relaxed italic mb-6">
                            "The Editorial Scholar design makes learning feel like a prestige experience. My daughter's grades improved by 30% in just one semester."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden border-2 border-white/20 shadow-sm">
                                <img src="https://i.pravatar.cc/150?u=sarah" alt="" />
                            </div>
                            <div>
                                <p className="font-bold">Sarah Jenkins</p>
                                <p className="text-[10px] uppercase font-black text-blue-200 tracking-widest leading-none mt-1">Parent of 10th Grader</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Side Footer */}
                <div className="absolute bottom-8 left-12 flex gap-8 text-[10px] font-black text-blue-200/50 uppercase tracking-widest">
                    <span>© 2024 EDUFLOW</span>
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <div className="flex-[1.2] flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-y-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2 mb-12 justify-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">E</div>
                        <span className="font-black text-slate-800 tracking-tight text-2xl">EduFlow</span>
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Create your account</h1>
                        <p className="text-slate-400 font-medium tracking-tight">Step 1: Choose your profile type to get personalized tools.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Selection Blocks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div 
                                onClick={() => setFormData({...formData, role: 'student'})}
                                className={clsx(
                                    "p-6 rounded-3xl border-2 transition-all cursor-pointer group relative",
                                    formData.role === 'student' ? "bg-blue-50/50 border-blue-600 shadow-xl shadow-blue-100/50" : "bg-white border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                    formData.role === 'student' ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:scale-110"
                                )}>
                                    <User size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800">I'm a Student</h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">Access courses, track grades, and connect with mentors.</p>
                                {formData.role === 'student' && (
                                    <div className="absolute top-4 right-4 text-blue-600">
                                        <Check size={20} className="font-black" />
                                    </div>
                                )}
                            </div>

                            <div 
                                onClick={() => setFormData({...formData, role: 'parent'})}
                                className={clsx(
                                    "p-6 rounded-3xl border-2 transition-all cursor-pointer group relative",
                                    formData.role === 'parent' ? "bg-blue-50/50 border-blue-600 shadow-xl shadow-blue-100/50" : "bg-white border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                    formData.role === 'parent' ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:scale-110"
                                )}>
                                    <UsersIcon size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800">I'm a Parent</h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">Monitor progress, manage payments, and support growth.</p>
                                {formData.role === 'parent' && (
                                    <div className="absolute top-4 right-4 text-blue-600">
                                        <Check size={20} className="font-black" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
                                {error}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="jane@example.com"
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Set Password</label>
                             <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                             </div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Must be at least 8 characters with one number</p>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Your School / Institution</label>
                             <div className="relative">
                                <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search for school..."
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800"
                                />
                             </div>
                        </div>

                        <div className="flex items-start gap-3 px-1">
                            <input type="checkbox" required className="w-5 h-5 mt-0.5 border-2 border-slate-200 rounded-lg appearance-none checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                I agree to the <Link href="#" className="font-bold text-blue-600 hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-blue-600 hover:underline">Privacy Policy</Link>. I understand EduFlow will process my data to provide educational services.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {loading ? "Creating account..." : (
                                <>
                                    Create Account
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Auth */}
                    <div className="mt-12">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or join with</span>
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-3 py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600">
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                                Google
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-3 py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600">
                                <img src="https://appleid.cdn-apple.com/appleid/static/bin/cb12223847/images/favicon.ico" className="w-4 h-4" alt="" />
                                Apple
                            </button>
                        </div>
                    </div>

                    <p className="mt-12 text-center text-sm font-medium text-slate-400">
                        Already have an account? <Link href="/login" className="text-blue-600 font-black hover:underline ml-1">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
