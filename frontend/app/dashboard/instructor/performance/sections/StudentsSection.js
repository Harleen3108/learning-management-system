'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function StudentsSection({ selectedCourse }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/performance/students?courseId=${selectedCourse}`);
                setStudents(res.data.data);
            } catch (err) {
                console.error('Failed to fetch student stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedCourse]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>;

    const filteredStudents = students.filter(s => 
        s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const needingAttention = students.filter(s => s.completedCount === 0);

    return (
        <div className="space-y-10">
            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 border-slate-50 flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center">
                        <Users size={30} />
                    </div>
                    <div>
                        <h4 className="text-3xl font-semibold text-slate-900">{students.length}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Active Students</p>
                    </div>
                </Card>

                <Card className="p-8 border-rose-100 bg-rose-50/30 flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle size={30} />
                    </div>
                    <div>
                        <h4 className="text-3xl font-semibold text-rose-600">{needingAttention.length}</h4>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Students Needing Attention</p>
                    </div>
                </Card>
            </div>

            <Card className="border-slate-50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Student Progress Tracking</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Monitor learning behavior and completion rates.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by student or course..."
                            className="w-full bg-white border border-slate-100 py-3 pl-12 pr-4 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((s, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shadow-sm">
                                                <img src={s.student.profilePhoto || `https://ui-avatars.com/api/?name=${s.student.name}&background=071739&color=fff`} alt="" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{s.student.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{s.student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{s.course.title}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                                <div 
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        s.completedCount > 0 ? "bg-[#071739]" : "bg-rose-400"
                                                    )}
                                                    style={{ width: `${Math.min((s.completedCount / 10) * 100, 100)}%` }} // Simplified percentage
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{s.completedCount} Lessons</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-slate-400 group-hover:text-[#071739] transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium italic">No students found for the current filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
