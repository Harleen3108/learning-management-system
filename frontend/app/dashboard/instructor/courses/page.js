'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/instructor/me');
      setCourses(res.data.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses(); // Refresh list
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-semibold uppercase tracking-widest">
            <CheckCircle size={12} /> Published
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-semibold uppercase tracking-widest">
            <Clock size={12} /> Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-semibold uppercase tracking-widest">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-semibold uppercase tracking-widest">
            <AlertCircle size={12} /> Draft
          </span>
        );
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-slate-500 font-medium mt-1">Manage, edit, and track the status of your curriculum.</p>
          </div>
          <Link 
            href="/dashboard/instructor/create"
            className="flex items-center gap-2 bg-[#071739] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={18} />
            Create New Course
          </Link>
        </header>

        {/* Filters/Search */}
        <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-12 pr-4 bg-transparent outline-none text-sm font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Course List Wrapper */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             [1, 2, 3].map(i => (
               <Card key={i} className="p-8 border-slate-100 shadow-sm relative overflow-hidden group hover:border-[#071739]/20 transition-all"></Card>
             ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <div 
                key={course._id}
                className="group bg-white border border-slate-100 rounded-3xl p-5 hover:border-[#071739]/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row items-center gap-6"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                  <img 
                    src={course.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' : course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {getStatusBadge(course.status)}
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{course.category?.name ?? course.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 truncate group-hover:text-[#071739] transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-6 text-slate-400 font-semibold text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-slate-300" />
                      {course.modules?.length || 0} Modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-300" />
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pr-2">
                  <Link 
                    href={`/dashboard/instructor/create?id=${course._id}`}
                    className="p-3 text-slate-600 hover:bg-slate-50 hover:text-[#071739] rounded-xl transition-all font-semibold flex items-center gap-2"
                  >
                    <Edit3 size={18} />
                    <span className="text-xs uppercase tracking-widest md:hidden lg:inline-block">Edit</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(course._id, course.title)}
                    className="p-3 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all font-semibold flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    <span className="text-xs uppercase tracking-widest md:hidden lg:inline-block">Delete</span>
                  </button>
                  <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>
                  <Link 
                    href={`/dashboard/courses/${course._id}`}
                    className={clsx(
                      "p-3 rounded-xl transition-all font-semibold flex items-center gap-2 bg-slate-50 text-slate-400 hover:bg-[#071739] hover:text-white"
                    )}
                  >
                    <Eye size={18} />
                    <span className="text-xs uppercase tracking-widest md:hidden lg:inline-block">View</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-[#071739] transition-all mx-auto mb-6">
                  <BookOpen size={30} className="text-slate-200" />
               </div>
               <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
               <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">You haven't added any courses yet. Start your journey by creating your first curriculum.</p>
               <Link 
                href="/dashboard/instructor/create"
                className="inline-flex items-center gap-2 bg-[#071739] text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
               >
                 Get Started <ArrowRight size={18} />
               </Link>
            </div>
          )}
        </div>
      </div>


    </DashboardLayout>
  );
}
