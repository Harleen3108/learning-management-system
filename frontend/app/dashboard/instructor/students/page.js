'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const fetchStudents = async () => {
    try {
      const res = await api.get('/courses/instructor-students');
      setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const uniqueCourses = ['all', ...new Set(students.map(s => s.course.title))];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || s.course.title === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const stats = [
    { label: 'Total Enrolled', value: students.length, icon: Users, color: 'blue' },
    { label: 'Avg. Progress', value: `${Math.round(students.reduce((acc, s) => acc + s.progress.percentage, 0) / (students.length || 1))}%`, icon: TrendingUp, color: 'emerald' },
    { label: 'Certifications', value: students.filter(s => s.progress.percentage === 100).length, icon: Award, color: 'amber' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor enrollment, track progress, and analyze quiz performance.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="p-8 border-slate-100 shadow-sm flex items-center gap-6">
               <div className={`w-16 h-16 rounded-3xl bg-${stat.color === 'blue' ? '[#071739]/10' : stat.color + '-50'} text-${stat.color === 'blue' ? '[#071739]' : stat.color + '-600'} flex items-center justify-center`}>
                  <stat.icon size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-[#071739] uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
               </div>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or email..."
              className="w-full bg-white border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64 relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <select 
               className="w-full bg-white border border-slate-100 p-4 pl-12 rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer"
               value={selectedCourse}
               onChange={(e) => setSelectedCourse(e.target.value)}
             >
                {uniqueCourses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Courses' : c}</option>)}
             </select>
          </div>
        </div>

        {/* Students Table */}
        <Card className="overflow-hidden border-slate-100 shadow-sm p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled In</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Progress</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Quiz</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="p-8 h-12 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#071739] flex items-center justify-center font-black text-xs">
                             {item.student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-[#071739] transition-colors">{item.student.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{item.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight line-clamp-1">{item.course.title}</p>
                      </td>
                      <td className="p-6 w-64">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className={item.progress.percentage === 100 ? 'text-emerald-600' : 'text-slate-400'}>
                                {item.progress.percentage}% Complete
                              </span>
                              <span className="text-slate-300">{item.progress.completed}/{item.progress.total} Lessons</span>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={clsx(
                                  "h-full rounded-full transition-all duration-1000",
                                  item.progress.percentage === 100 ? "bg-emerald-500" : "bg-[#071739]"
                                )}
                                style={{ width: `${item.progress.percentage}%` }}
                              ></div>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                        {item.latestQuiz ? (
                          <div className="flex items-center gap-2">
                             <div className={clsx(
                               "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                               item.latestQuiz.passed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                             )}>
                               {item.latestQuiz.score}/{item.latestQuiz.maxScore}
                             </div>
                             <span className="text-[10px] text-slate-400 font-bold truncate max-w-[100px]">{item.latestQuiz.title}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase italic">No Attempts</span>
                        )}
                      </td>
                      <td className="p-6 capitalize">
                        <p className="text-xs font-bold text-slate-500">
                          {new Date(item.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 font-bold italic">
                       No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
