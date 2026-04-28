'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Star, 
  Plus, 
  MoreVertical,
  ChevronRight,
  Download,
  Loader2,
  BookOpen,
  Trash2,
  User,
  Globe
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import Link from 'next/link';

export default function InstructorDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/analytics/instructor'),
          api.get('/courses') // Need to ensure this filters for instructor
        ]);
        setStats(statsRes.data.data);
        // Filter courses for the instructor if the backend doesn't do it automatically for this route
        const instructorCourses = coursesRes.data.data.filter(c => c.instructor?._id === user?._id || c.instructor === user?._id);
        setCourses(instructorCourses);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await api.delete(`/courses/${id}`);
        setCourses(courses.filter(c => c._id !== id));
      } catch (err) {
        console.error('Failed to delete course:', err);
        alert('Failed to delete course');
      }
    }
  };

  if (loading) {
     return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString() || '0'}`, icon: TrendingUp, change: '+12%', color: 'text-[#071739]', bg: 'bg-[#071739]/5' },
    { label: 'Total Students', value: stats?.totalStudents || '0', icon: Users, change: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Courses', value: stats?.totalCourses || '0', icon: BookOpen, change: 'Active', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">Instructor Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Welcome back, <span className="text-[#071739] font-semibold">{user?.name || 'Instructor'}</span>!</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/instructors/${user?._id}`}>
             <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all">
               <Globe size={18} />
               View Public Profile
             </button>
          </Link>
          <Link href="/dashboard/instructor/edit-profile">
             <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all">
               <User size={18} />
               Edit Profile
             </button>
          </Link>
          <Link href="/dashboard/instructor/analytics">
             <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all">
               <TrendingUp size={18} />
               View Analytics
             </button>
          </Link>
          <Link href="/dashboard/instructor/create">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#071739] text-white rounded-2xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-slate-900/10">
              <Plus size={18} />
              Create Course
            </button>
          </Link>
        </div>
      </div>

      {/* Profile Completeness Alert */}
      {!user?.instructorBio && (
        <Card className="p-6 bg-[#071739]/5 border-[#071739]/10 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#071739] shadow-sm">
                 <User size={24} />
              </div>
              <div>
                 <h4 className="font-semibold text-slate-900">Your profile is incomplete</h4>
                 <p className="text-xs text-slate-500 font-medium">Add a bio and social links to build trust with your students.</p>
              </div>
           </div>
            <Link href="/dashboard/instructor/edit-profile">
               <button className="px-6 py-2.5 bg-[#071739] text-white rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-900/10">Complete Now</button>
            </Link>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-8 relative group overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-4 rounded-[2rem] ${stat.bg} ${stat.color}`}>
                <stat.icon size={26} />
              </div>
              <span className={`text-xs font-semibold ${stat.color} px-3 py-1 bg-white rounded-full border border-slate-50 shadow-sm`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-semibold text-slate-900 mt-2">{stat.value}</p>
            </div>
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity`}></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Insights Shell */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-semibold text-slate-900 text-xl">Quick Links</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Manage your teaching environment</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[
                  { title: 'Manage Students', desc: 'Track progress and grades', icon: Users, link: '/dashboard/instructor/students', color: 'bg-emerald-50 text-emerald-600' },
                  { title: 'Quiz Builder', desc: 'Create new assessments', icon: Star, link: '/dashboard/instructor/quizzes', color: 'bg-orange-50 text-orange-600' },
                  { title: 'Performance', desc: 'View revenue and growth', icon: TrendingUp, link: '/dashboard/instructor/analytics', color: 'bg-slate-50 text-slate-600' },
                  { title: 'New Course', desc: 'Start building content', icon: Plus, link: '/dashboard/instructor/create', color: 'bg-slate-50 text-slate-900' },
                ].map((item, i) => (
                  <Link key={i} href={item.link}>
                     <div className="p-6 rounded-[2rem] border border-slate-50 hover:border-[#071739]/10 hover:bg-slate-50/50 transition-all group">
                       <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <item.icon size={20} />
                       </div>
                       <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                       <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">{item.desc}</p>
                    </div>
                 </Link>
               ))}
            </div>
          </Card>
        </div>

        {/* Live Classes Shell */}
        <div>
          <Card className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-semibold text-slate-900 text-xl">Live Classes</h3>
              <button className="text-slate-400 hover:text-slate-900"><ChevronRight size={18} /></button>
            </div>
            <div className="space-y-6">
               <p className="text-xs text-slate-400 font-medium">No classes scheduled for today.</p>
               <button className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-semibold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Schedule Session
               </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Course List */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-semibold text-slate-900">My Courses</h3>
          <Link href="/dashboard/instructor/create" className="text-[#071739] font-semibold text-sm hover:underline">Create New</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <motion.div 
              key={i} 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex flex-col bg-white rounded-[2rem] border shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group h-full",
                course.status === 'rejected' ? "bg-rose-50/30 border-rose-100" : "bg-white border-slate-50"
              )}
            >
              <div className="aspect-[16/9] overflow-hidden relative shrink-0">
                <img 
                  src={course.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1541462608141-ad511a7ee5f2?auto=format&fit=crop&q=80&w=600' : course.thumbnail} 
                  alt="Course" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <span className={clsx(
                    "px-3 py-1 rounded-lg text-[8px] font-semibold uppercase tracking-widest border backdrop-blur-md shadow-sm",
                    course.status === 'pending' ? "bg-orange-500 text-white border-orange-400" :
                    course.status === 'published' ? "bg-emerald-500 text-white border-emerald-400" :
                    course.status === 'rejected' ? "bg-rose-500 text-white border-rose-400" : "bg-slate-500 text-white border-slate-400"
                  )}>
                    {course.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1 space-y-4">
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-800 text-sm line-clamp-2 h-10 group-hover:text-[#071739] transition-colors leading-snug">{course.title}</h5>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-tight line-clamp-1">{course.category || 'Professional Course'}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-600">4.8</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-semibold text-slate-900">₹{course.discountPrice || course.price || 'Free'}</span>
                    {course.discountPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{course.price}</span>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50 mt-auto">
                   <Link href={`/dashboard/instructor/edit/${course._id}`}>
                      <button className="w-full py-3 bg-slate-50 text-slate-900 text-[9px] font-semibold rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest">Edit</button>
                   </Link>
                    <Link href={`/dashboard/courses/${course._id}`}>
                       <button className="w-full py-3 border border-[#071739]/5 text-[#071739] text-[9px] font-semibold rounded-xl hover:bg-[#071739] hover:text-white transition-all uppercase tracking-widest text-center">Stats</button>
                    </Link>
                   <button 
                     onClick={() => handleDelete(course._id)}
                     className="w-full py-3 bg-rose-50 text-rose-600 text-[9px] font-semibold rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center"
                   >
                     <Trash2 size={12} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
               <p className="text-slate-400 font-semibold">You haven't created any courses yet.</p>
               <Link href="/dashboard/instructor/create">
                  <button className="mt-4 text-[#071739] font-semibold uppercase text-xs tracking-widest">Start building now &rarr;</button>
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

