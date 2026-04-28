'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, 
    ChevronLeft, 
    Upload, 
    CheckCircle2, 
    Globe, 
    Linkedin, 
    Mail, 
    Phone, 
    User, 
    Briefcase,
    BookOpen,
    Star,
    Award,
    FileText,
    ArrowRight,
    Loader2
} from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import Footer from '@/components/Footer';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx } from 'clsx';

export default function TeachOnEduFlow() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const [step, setStep] = useState(0); // 0-2: Questions, 3: Full Form, 4: Success
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Qualification
        qualification: {
            describeSelf: '',
            teachingTopic: '',
            hasTaughtBefore: ''
        },
        // Step 2: Full Form
        fullName: '',
        email: '',
        phone: '',
        profilePhoto: '',
        professionalHeadline: '',
        bio: '',
        expertise: '',
        skills: [],
        teachingExperience: '',
        links: {
            website: '',
            linkedin: '',
            portfolio: ''
        },
        resumeUrl: '',
        supportingDocs: [],
        sampleCourseIdea: '',
        preferredPayoutMethod: 'Bank Transfer'
    });

    useEffect(() => {
        const saved = localStorage.getItem('teach_onboarding_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, qualification: parsed }));
            } catch (e) { console.error('Failed to parse saved data'); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('teach_onboarding_data', JSON.stringify(formData.qualification));
    }, [formData.qualification]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.instructorBio || '',
                expertise: user.instructorSpecialty || ''
            }));

            // Check if already applied
            const checkStatus = async () => {
                try {
                    const res = await api.get('/instructor-applications/my-status');
                    if (res.data.data) {
                        setStatus(res.data.data);
                        if (res.data.data.status === 'approved') {
                            router.push('/dashboard/instructor');
                        }
                    }
                } catch (err) {
                    console.error('Failed to check application status');
                }
            };
            checkStatus();
        }
    }, [authLoading, isAuthenticated, user]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic guard – we need at least name + email so the backend can provision/find the account.
        if (!formData.fullName?.trim() || !formData.email?.trim()) {
            alert('Please provide your full name and email.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/instructor-applications', formData);
            setStep(4);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    if (status && (status.status === 'pending' || status.status === 'changes_requested') && step < 4) {
        return (
            <div className="min-h-screen bg-white">
                <HomeNavbar />
                <div className="max-w-2xl mx-auto px-6 py-32 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Clock className="text-blue-600" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Approval sent successfully</h1>
                    <p className="text-slate-500 mb-8">
                        {status.status === 'pending' 
                            ? "We've received your application and our team is currently reviewing it. We'll get back to you via email within 3-5 business days."
                            : "We've requested some changes to your application. Please check your email for details."}
                    </p>
                    <Link href="/" className="inline-block bg-[#071739] text-white px-8 py-3 rounded-xl font-semibold">
                        Back to Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const renderQualification = () => {
        const questions = [
            {
                id: 'describeSelf',
                q: "What best describes you?",
                options: ['Industry Professional', 'Teacher / Trainer', 'Freelancer / Creator', 'Business Owner', 'Other'],
                field: 'describeSelf'
            },
            {
                id: 'teachingTopic',
                q: "What do you want to teach on EduFlow?",
                type: 'textarea',
                placeholder: "e.g. Masterclass in Management Consulting, React for Beginners...",
                field: 'teachingTopic'
            },
            {
                id: 'hasTaughtBefore',
                q: "Have you taught before?",
                options: ['Yes, professionally', 'Yes, informally', 'No, but I have expertise'],
                field: 'hasTaughtBefore'
            }
        ];

        const currentQ = questions[step];

        return (
            <motion.div 
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                <div className="space-y-4">
                    <span className="text-blue-600 font-semibold uppercase text-[10px] tracking-widest">Question {step + 1} of 3</span>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{currentQ.q}</h2>
                </div>

                <div className="space-y-3">
                    {currentQ.type === 'textarea' ? (
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#071739] focus:bg-white rounded-none p-4 outline-none transition-all text-sm font-medium min-h-[120px]"
                            placeholder={currentQ.placeholder}
                            value={formData.qualification[currentQ.field]}
                            onChange={(e) => setFormData({
                                ...formData,
                                qualification: { ...formData.qualification, [currentQ.field]: e.target.value }
                            })}
                        />
                    ) : (
                        currentQ.options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        qualification: { ...formData.qualification, [currentQ.field]: opt }
                                    });
                                }}
                                className={clsx(
                                    "w-full text-left p-4 rounded-none border transition-all flex items-center justify-between group",
                                    formData.qualification[currentQ.field] === opt 
                                        ? "border-[#071739] bg-slate-50 text-slate-900" 
                                        : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 text-slate-600"
                                )}
                            >
                                <span className="font-medium text-sm">{opt}</span>
                                <div className={clsx(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    formData.qualification[currentQ.field] === opt ? "border-blue-600 bg-blue-600" : "border-slate-300 group-hover:border-slate-400"
                                )}>
                                    {formData.qualification[currentQ.field] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="flex gap-4 pt-8">
                    {step > 0 && (
                        <button onClick={handleBack} className="flex-1 py-4 px-6 border-2 border-slate-100 rounded-2xl font-semibold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                            <ChevronLeft size={20} /> Back
                        </button>
                    )}
                    <button 
                        onClick={handleNext}
                        disabled={!formData.qualification[currentQ.field]}
                        className="flex-[2] py-3 px-6 bg-[#071739] text-white rounded-none font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                    >
                        Continue <ChevronRight size={18} />
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderFullForm = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="space-y-4">
                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Complete Your Application</h2>
                    <p className="text-slate-500 font-medium text-lg">Great! You're qualified. Now tell us more about yourself and your expertise.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl p-4 outline-none transition-all font-semibold"
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl p-4 outline-none transition-all font-semibold"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input 
                                type="tel" 
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl p-4 outline-none transition-all font-semibold"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Professional Headline</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Senior Software Engineer at Google"
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl p-4 outline-none transition-all font-semibold"
                                value={formData.professionalHeadline}
                                onChange={(e) => setFormData({...formData, professionalHeadline: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Bio & Expertise */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Bio / About You</label>
                            <textarea 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl p-6 outline-none transition-all font-medium min-h-[150px]"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Area of Expertise</label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Full Stack Web Development, Financial Modeling"
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl p-4 outline-none transition-all font-semibold"
                                value={formData.expertise}
                                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Sample Course Idea</label>
                            <textarea 
                                placeholder="Describe a course you'd like to create in detail..."
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl p-6 outline-none transition-all font-medium min-h-[120px]"
                                value={formData.sampleCourseIdea}
                                onChange={(e) => setFormData({...formData, sampleCourseIdea: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Links */}
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
                        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <Globe className="text-blue-600" size={24} /> Professional Links
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-1">Website / Portfolio</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-600 transition-all text-sm font-semibold"
                                    value={formData.links.website}
                                    onChange={(e) => setFormData({...formData, links: {...formData.links, website: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-1">LinkedIn Profile</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-600 transition-all text-sm font-semibold"
                                    value={formData.links.linkedin}
                                    onChange={(e) => setFormData({...formData, links: {...formData.links, linkedin: e.target.value}})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payout Method */}
                    <div className="space-y-4">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Preferred Payout Method</label>
                        <div className="flex flex-wrap gap-4">
                            {['Bank Transfer', 'PayPal', 'Stripe'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData({...formData, preferredPayoutMethod: method})}
                                    className={clsx(
                                        "px-8 py-4 rounded-2xl font-semibold transition-all border-2",
                                        formData.preferredPayoutMethod === method 
                                            ? "border-blue-600 bg-blue-50 text-blue-900" 
                                            : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                                    )}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-between">
                        <button type="button" onClick={handleBack} className="text-slate-400 font-semibold hover:text-slate-900 transition-all">Back to Qualification</button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-[#071739] text-white px-12 py-5 rounded-[2rem] font-semibold text-lg flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-900/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    };

    const renderSuccess = () => {
        const rawFirst = (formData.fullName || '').trim().split(/\s+/)[0] || 'instructor';
        const firstName = rawFirst.toLowerCase().replace(/[^a-z0-9]/g, '') || 'instructor';
        const samplePassword = `${firstName}123`;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-20"
            >
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-xl shadow-emerald-100/50">
                    <CheckCircle2 size={56} />
                </div>
                <div className="space-y-4 max-w-lg mx-auto">
                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Approval sent successfully</h2>
                    <p className="text-lg text-slate-500 font-medium">
                        Your application has been submitted and is now awaiting admin approval.
                    </p>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-6 text-left">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Once an admin approves your profile, you will be able to log in with your email and a default password generated from your first name:
                        </p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-sm text-slate-800 font-semibold mt-1 truncate">{formData.email || 'your@email.com'}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Password</p>
                                <p className="text-sm text-blue-600 font-bold mt-1">{samplePassword}</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-3">
                            Format: your first name in lowercase + <span className="font-semibold">123</span>. You can change it after logging in.
                        </p>
                    </div>
                </div>
                <div className="pt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#071739] text-white px-10 py-4 rounded-2xl font-semibold hover:bg-black transition-all shadow-xl"
                    >
                        Return to Homepage
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            <HomeNavbar />
            
            <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-40 grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Left: Branding & Steps */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-6">

                        <h1 className="text-5xl font-semibold text-slate-900 tracking-tight leading-[1.1] pt-12">
                            Share your <br/> knowledge <br/> with the world.
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            Join thousands of experts teaching on EduFlow and reach millions of students globally.
                        </p>
                    </div>

                    <div className="space-y-6 pt-10">
                        {[
                            { step: 1, title: 'Quick Qualification', active: step < 3 },
                            { step: 2, title: 'Full Application', active: step === 3 },
                            { step: 3, title: 'Review & Approval', active: step === 4 }
                        ].map((s) => (
                            <div key={s.step} className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all",
                                    s.active ? "bg-[#071739] text-white shadow-lg" : "bg-slate-100 text-slate-400"
                                )}>
                                    {s.step}
                                </div>
                                <span className={clsx(
                                    "font-semibold transition-all",
                                    s.active ? "text-slate-900" : "text-slate-400"
                                )}>{s.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-12 grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-3xl font-semibold text-slate-900">10k+</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Active Instructors</p>
                        </div>
                        <div>
                            <p className="text-3xl font-semibold text-slate-900">5M+</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Global Students</p>
                        </div>
                    </div>
                </div>

                {/* Right: Content Area */}
                <div className="lg:col-span-8 bg-white border border-slate-100 shadow-xl rounded-none p-10 lg:p-16 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step < 3 ? renderQualification() : step === 3 ? renderFullForm() : renderSuccess()}
                    </AnimatePresence>

                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                </div>
            </main>

            <Footer />
        </div>
    );
}

const Clock = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
