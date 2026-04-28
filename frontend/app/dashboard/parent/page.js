'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
    Users, 
    TrendingUp, 
    Calendar, 
    CreditCard, 
    Award, 
    ChevronRight, 
    Link as LinkIcon, 
    Clock, 
    CheckCircle2, 
    Search,
    UserPlus,
    X,
    Activity,
    Mail,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function ParentDashboard() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [monitoringData, setMonitoringData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkForm, setLinkForm] = useState({ studentEmail: '', studentCode: '' });
    const [linkError, setLinkError] = useState('');
    const router = useRouter();

    const fetchStudents = useCallback(async () => {
        try {
            const res = await api.get('/parent/students');
            setStudents(res.data.data);
            if (res.data.data.length > 0 && !selectedStudent) {
                setSelectedStudent(res.data.data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedStudent]);

    const fetchMonitoringData = useCallback(async (studentId) => {
        if (!studentId) return;
        setDataLoading(true);
        try {
            const res = await api.get(`/parent/students/${studentId}/progress`);
            setMonitoringData(res.data.data);
        } catch (err) {
            console.error('Failed to fetch monitoring data:', err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchMonitoringData(selectedStudent._id);
        }
    }, [selectedStudent, fetchMonitoringData]);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        setLinkError('');
        try {
            await api.post('/parent/link', linkForm);
            setIsLinkModalOpen(false);
            setLinkForm({ studentEmail: '', studentCode: '' });
            fetchStudents();
        } catch (err) {
            setLinkError(err.response?.data?.message || 'Link failed');
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Parent Portal...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Parental Oversight</h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Empowering student success through collaborative monitoring.</p>
                    </div>
                    <button 
                        onClick={() => setIsLinkModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-100 group active:scale-95"
                    >
                        <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                        Link New Student
                    </button>
                </div>

                {students.length === 0 ? (
                    <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center">
                            <Users size={48} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-800">No linked students found</h3>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">Link your child's account using their email or unique student code to start monitoring their academic progress.</p>
                        </div>
                        <button 
                            onClick={() => setIsLinkModalOpen(true)}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Students Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="flex items-center gap-2 px-2 text-slate-400 mb-4">
                                <Users size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">My Children ({students.length})</span>
                            </div>
                            {students.map(student => (
                                <motion.div 
                                    key={student._id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedStudent(student)}
                                    className={clsx(
                                        "p-6 rounded-[2rem] border-2 transition-all cursor-pointer group relative overflow-hidden",
                                        selectedStudent?._id === student._id 
                                            ? "bg-white border-blue-600 shadow-xl shadow-blue-100/50" 
                                            : "bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-800 truncate leading-tight tracking-tight">{student.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">{student.role}</p>
                                        </div>
                                        {selectedStudent?._id === student._id && (
                                            <div className="ml-auto text-blue-600">
                                                <ChevronRight size={20} />
                                            </div>
                                        )}
                                    </div>
                                    {selectedStudent?._id === student._id && (
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-50 rounded-full blur-2xl opacity-50" />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Monitoring Content */}
                        <div className="lg:col-span-3 space-y-8">
                            {dataLoading ? (
                                <div className="bg-white rounded-[3rem] border border-slate-100 p-20 flex flex-col items-center justify-center gap-6 min-h-[500px]">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Academic Data...</p>
                                </div>
                            ) : monitoringData && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Enrollments</p>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-4xl font-black text-slate-800">{monitoringData.enrollments.length}</span>
                                                    <span className="text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-tight flex items-center">
                                                        <ArrowUpRight size={12} />
                                                        Courses
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="absolute top-6 right-8 p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Activity size={24} />
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quiz Success Rate</p>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-4xl font-black text-slate-800">
                                                        {monitoringData.results.length > 0 
                                                            ? Math.round((monitoringData.results.filter(r => r.percentage >= 60).length / monitoringData.results.length) * 100) 
                                                            : 0}%
                                                    </span>
                                                    <span className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-tight">Target 80%</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-6 right-8 p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Award size={24} />
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Attendance</p>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-4xl font-black text-slate-800">
                                                        {monitoringData.attendance.length}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-rose-500 mb-2 uppercase tracking-tight">Live Sessions</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-6 right-8 p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                <Calendar size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Monitoring Sections */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                        {/* Course Progress */}
                                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 h-fit">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20} /></div>
                                                    <h3 className="text-lg font-black text-slate-800">Course Progress</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                {monitoringData.enrollments.map(enroll => {
                                                    const courseProg = monitoringData.progress.find(p => p.course === enroll.course._id);
                                                    const percent = courseProg?.completionPercentage || 0;
                                                    return (
                                                        <div key={enroll._id} className="group cursor-pointer">
                                                            <div className="flex justify-between items-end mb-3">
                                                                <div>
                                                                    <p className="font-black text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{enroll.course.title}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Enrolled: {new Date(enroll.enrolledAt).toLocaleDateString()}</p>
                                                                </div>
                                                                <span className="text-xs font-black text-slate-600">{percent}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percent}%` }}
                                                                    className={clsx(
                                                                        "h-full rounded-full transition-all duration-1000",
                                                                        percent === 100 ? "bg-emerald-500" : "bg-blue-600"
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {monitoringData.enrollments.length === 0 && (
                                                    <p className="text-center py-10 text-slate-400 text-xs font-medium italic">No courses currently being studied.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quiz & Results History */}
                                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 h-fit">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Award size={20} /></div>
                                                    <h3 className="text-lg font-black text-slate-800">Quiz History</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {monitoringData.results.map(result => (
                                                    <div key={result._id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all group">
                                                        <div className={clsx(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                            result.percentage >= 60 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                                                        )}>
                                                            {result.percentage >= 60 ? <CheckCircle2 size={24} /> : <Activity size={24} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-slate-800 truncate">{result.quiz.title}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">Attempted: {new Date(result.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={clsx(
                                                                "font-black text-lg",
                                                                result.percentage >= 60 ? "text-emerald-600" : "text-rose-600"
                                                            )}>{result.percentage}%</p>
                                                            <p className="text-[9px] font-black text-slate-300 uppercase">Score</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {monitoringData.results.length === 0 && (
                                                    <p className="text-center py-10 text-slate-400 text-xs font-medium italic">No quizzes attempted yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Tracking */}
                                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 xl:col-span-2">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={20} /></div>
                                                    <h3 className="text-lg font-black text-slate-800">Fee & Course Payments</h3>
                                                </div>
                                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Download Statements</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-slate-50">
                                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {monitoringData.enrollments.map(enroll => (
                                                            <tr key={enroll._id} className="group">
                                                                <td className="py-5 pr-4">
                                                                    <p className="text-sm font-black text-slate-700">{enroll.course.title}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {enroll.paymentId || enroll._id.slice(-8)}</p>
                                                                </td>
                                                                <td className="py-5 pr-4">
                                                                    <span className="text-xs font-bold text-slate-600">{new Date(enroll.enrolledAt).toLocaleDateString()}</span>
                                                                </td>
                                                                <td className="py-5 pr-4">
                                                                    <span className="text-sm font-black text-slate-800">₹{enroll.course.price}</span>
                                                                </td>
                                                                <td className="py-5 text-right">
                                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">Paid</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Link Student Modal */}
            <AnimatePresence>
                {isLinkModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Link Student Profile</h2>
                                        <p className="text-slate-400 text-sm mt-1">Connect your child's account for active monitoring.</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsLinkModalOpen(false)}
                                        className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleLinkStudent} className="space-y-6">
                                    {linkError && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                                            <Activity size={16} />
                                            {linkError}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input 
                                                type="email"
                                                required
                                                placeholder="student@example.com"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800"
                                                value={linkForm.studentEmail}
                                                onChange={(e) => setLinkForm({ ...linkForm, studentEmail: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 my-8">
                                        <div className="h-[1px] flex-1 bg-slate-100" />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or use code</span>
                                        <div className="h-[1px] flex-1 bg-slate-100" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Unique Code</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input 
                                                type="text"
                                                placeholder="ST-XXXX-XXXX"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800"
                                                value={linkForm.studentCode}
                                                onChange={(e) => setLinkForm({ ...linkForm, studentCode: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 mt-4"
                                    >
                                        Initialize Link
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
