'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Github } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            const user = res.data.data;
            let role = user.role.toLowerCase();
            
            console.log('Login successful, role:', role); // Debugging
            
            if (role === 'super-admin') role = 'admin';
            
            // Absolute routing based on role
            router.push(`/dashboard/${role}`);
        } catch (err) {
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100 overflow-hidden">
            {/* Left Side: EXACTLY MATCHING THE IMAGE */}
            <div className="hidden lg:flex flex-[1.25] bg-[#8FAEB4] relative flex-col items-center justify-center overflow-hidden">
                {/* 
                  ILLUSTRATION: Hand-crafted SVG to perfectly match the goal image 
                  (No background box, correct facial features, navy suit)
                */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 w-full max-w-[440px] h-full flex items-end justify-center pb-20 pointer-events-none"
                >
                    <svg viewBox="0 0 400 500" className="w-full h-auto drop-shadow-2xl">
                        {/* Suit / Shoulders */}
                        <path d="M50 500 Q200 350 350 500" fill="#20345E" />
                        <path d="M120 400 L200 500 L280 400" fill="#20345E" />
                        {/* Shirt / Tie */}
                        <path d="M160 400 L200 450 L240 400" fill="white" />
                        <path d="M190 400 L210 400 L205 480 L195 480 Z" fill="#20345E" />
                        {/* Neck */}
                        <path d="M175 380 Q200 400 225 380 L225 410 Q200 430 175 410 Z" fill="#E8C3A9" />
                        {/* Face */}
                        <path d="M120 220 Q120 380 200 380 Q280 380 280 220 Q280 120 200 120 Q120 120 120 220" fill="#E8C3A9" />
                        {/* Hair */}
                        <path d="M120 200 Q120 100 200 80 Q280 100 280 200 L285 220 Q285 80 200 60 Q115 80 115 220 Z" fill="#4B3621" />
                        {/* Eyes */}
                        <circle cx="170" cy="220" r="4" fill="#333" />
                        <circle cx="230" cy="220" r="4" fill="#333" />
                        {/* Eyebrows */}
                        <path d="M155 205 Q170 195 185 205" fill="none" stroke="#4B3621" strokeWidth="2" />
                        <path d="M215 205 Q230 195 245 205" fill="none" stroke="#4B3621" strokeWidth="2" />
                        {/* Smile */}
                        <path d="M170 300 Q200 330 230 300" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
                        <path d="M170 300 Q200 330 230 300" fill="none" stroke="#A67B5B" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                </motion.div>

                {/* THE OVERLAPPING WHITE CARD: Positioned carefully within parent */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="absolute bottom-16 left-0 right-0 flex justify-center px-8 z-20"
                >
                    <div className="w-full max-w-[340px] bg-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                            </div>
                            <span className="font-bold text-slate-800 text-[13px] tracking-tight">EduFlow</span>
                        </div>
                        <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-[1.1] mb-5">
                            Cultivate your <br/> <span className="text-blue-600 italic">intellectual flow</span> state.
                        </h2>
                        <p className="text-slate-500 text-[13px] font-medium leading-[1.6]">
                            Access an editorial-grade learning environment designed for deep focus and academic excellence.
                        </p>
                    </div>
                </motion.div>

                {/* Left Side Footer Labels */}
                <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60 z-30">
                    <span>© 2024 EDUFLOW. THE EDITORIAL SCHOLAR.</span>
                    <div className="flex gap-4">
                        <span className="cursor-pointer hover:text-slate-800">PRIVACY</span>
                        <span className="cursor-pointer hover:text-slate-800">TERMS</span>
                    </div>
                </div>
            </div>

            {/* Right Side: LOGIN FORM (Whitespaced & Precise) */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white z-40">
                <div className="w-full max-w-[400px]">
                    <div className="mb-12 text-center lg:text-left">
                        <h1 className="text-[44px] font-bold text-[#1A1A1A] tracking-tighter mb-2">Welcome back</h1>
                        <p className="text-slate-400 text-base font-medium">Please enter your details to continue your journey.</p>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4 mb-10">
                        <button className="flex-1 flex items-center justify-center gap-3 py-[14px] border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-[14px]">
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                            Google
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-3 py-[14px] border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-[14px]">
                            <Github size={18} />
                            GitHub
                        </button>
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center gap-4 mb-10 px-2">
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap">OR EMAIL</span>
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-800 ml-1">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="scholar@eduflow.edu"
                                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] border-none rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[13px] font-bold text-slate-800">Password</label>
                                <Link href="#" className="text-[11px] font-bold text-blue-600 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-[#F3F4F6] border-none rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-1">
                            <input 
                                type="checkbox" 
                                id="remember_comp"
                                className="w-4 h-4 border-slate-300 rounded cursor-pointer accent-blue-600"
                            />
                            <label htmlFor="remember_comp" className="text-[14px] font-medium text-slate-500 cursor-pointer">Remember for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1565D8] hover:bg-[#1255B8] text-white py-[18px] rounded-xl font-bold text-[16px] shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            {loading ? "Signing in..." : "Sign in to account"}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[14px] font-medium text-slate-500">
                        Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline ml-1">Join the scholarship</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
