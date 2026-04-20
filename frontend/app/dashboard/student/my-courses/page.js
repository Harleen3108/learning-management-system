'use client';
import { useState, useEffect } from 'react';
import { 
  Play, 
  BarChart3, 
  BookOpen, 
  Clock, 
  GraduationCap, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import Link from 'next/link';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await api.get('/student/my-courses');
        setCourses(res.data.data);
      } catch (err) {
        console.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <GraduationCap size={16} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Learning</h1>
          </div>
          <p className="text-slate-500 font-medium">Pick up right where you left off and master new skills.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-100 rounded-[2.5rem] h-80 animate-pulse"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <Card key={course._id} className="group overflow-hidden flex flex-col">
                <div className="h-48 relative overflow-hidden">
                  <img src={course.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' : course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors"></div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{course.category}</span>
                  </div>
                  <Link 
                    href={`/dashboard/courses/${course._id}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl text-blue-600">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </Link>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl text-slate-900 line-clamp-1 leading-tight">{course.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} /> {course.totalLessons} Lessons
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} /> {course.duration || 'Flexible'}
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum Progress</span>
                      <span className="text-sm font-black text-blue-600">{course.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    
                    <Link 
                      href={`/dashboard/courses/${course._id}`}
                      className="w-full mt-4 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10"
                    >
                      Continue Course <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={40} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900 mb-2">No active enrollments</h3>
              <p className="text-slate-500 font-medium">You haven't enrolled in any courses yet. Explore our catalog to start your learning journey.</p>
            </div>
            <Link 
              href="/dashboard/explore"
              className="inline-flex py-4 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
