'use client';
import { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  ArrowRight, 
  Clock, 
  Flame, 
  Video,
  FileText,
  Star,
  Users
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import Link from 'next/link';

export default function StudentDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
        <div className="bg-slate-200 rounded-[2rem] h-96 w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-100 h-64 rounded-3xl"></div>
                <div className="bg-slate-100 h-96 rounded-3xl"></div>
            </div>
            <div className="bg-slate-100 h-[600px] rounded-3xl"></div>
        </div>
    </div>
  );

  const { enrolledCourses = [], upcomingLive = [], recentActivity = [], stats = {} } = data || {};
  const continueCourse = enrolledCourses.sort((a, b) => {
    const dateA = a.lastLesson?.updatedAt ? new Date(a.lastLesson.updatedAt) : new Date(0);
    const dateB = b.lastLesson?.updatedAt ? new Date(b.lastLesson.updatedAt) : new Date(0);
    return dateB - dateA;
  })[0];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-slate-900 rounded-[2rem] p-12 text-white relative overflow-hidden h-auto min-h-[400px] flex flex-col justify-center">
        <div className="relative z-10 max-w-2xl">
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">Learning Journey</p>
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
            You've completed {stats.totalLessonsCompleted || 0} lessons so far. Keep pushing towards your goals!
          </p>
          <div className="flex flex-wrap gap-4">
            {continueCourse ? (
              <Link href={`/dashboard/courses/${continueCourse._id}`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  Resume: {continueCourse.title}
                  <PlayCircle size={20} />
                </button>
              </Link>
            ) : (
                <Link href="/dashboard/explore">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    Browse Courses
                    <ArrowRight size={20} />
                    </button>
                </Link>
            )}
            <Link href="/dashboard/explore">
                <button className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all backdrop-blur-sm">
                Explore Library
                </button>
            </Link>
          </div>
        </div>
        {/* Abstract shapes for background */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute top-40 right-40 w-64 h-64 bg-slate-500 rounded-full blur-[80px]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          {continueCourse && (
            <div>
                <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Continue Learning</h3>
                <Link href="/dashboard/my-courses">
                    <button className="text-blue-600 font-bold text-sm hover:underline">View All My Courses</button>
                </Link>
                </div>
                <Link href={`/dashboard/courses/${continueCourse._id}`}>
                    <Card className="group cursor-pointer">
                    <div className="flex flex-col md:flex-row p-6 gap-8">
                        <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden relative">
                        <img src={continueCourse.thumbnail && continueCourse.thumbnail !== 'no-photo.jpg' ? continueCourse.thumbnail : "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80"} alt="Course" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="bg-white p-3 rounded-full text-blue-600 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                            <PlayCircle size={32} />
                            </div>
                        </div>
                        </div>
                        <div className="flex flex-col justify-between py-1 flex-1">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                {continueCourse.lastLesson ? `Next: ${continueCourse.lastLesson.title}` : 'Start Learning'}
                            </span>
                            </div>
                            <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{continueCourse.title}</h4>
                            <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-2">{continueCourse.category} pathway designed for your growth.</p>
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-400">Course Progress</span>
                            <span className="text-slate-900">{continueCourse.progress.percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${continueCourse.progress.percentage}%` }}></div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </Card>
                </Link>
            </div>
          )}

          {/* Enrolled Courses */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-2xl font-bold text-slate-900">My Courses</h3>
            </div>
            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {enrolledCourses.filter(c => c._id !== continueCourse?._id).slice(0, 4).map(course => (
                    <Link key={course._id} href={`/dashboard/courses/${course._id}`}>
                        <Card className="group">
                        <div className="h-40 overflow-hidden relative">
                            <img src={course.thumbnail && course.thumbnail !== 'no-photo.jpg' ? course.thumbnail : `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=800`} alt="Course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute top-4 left-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md">{course.category}</div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                <Clock size={12} />
                                {course.progress.percentage}% Done
                            </div>
                            </div>
                            <h5 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h5>
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-4">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress.percentage}%` }}></div>
                            </div>
                        </div>
                        </Card>
                    </Link>
                ))}
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                    <p className="text-slate-400 font-bold mb-4">You haven't enrolled in any courses yet.</p>
                    <Link href="/dashboard/explore">
                        <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Start Exploring</button>
                    </Link>
                </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-8">
          {/* Learning Activity */}
          <Card className="p-8 bg-blue-50/50 border-blue-100/50">
            <h3 className="font-bold text-slate-900 mb-8">Learning Activity</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl flex items-center justify-between border border-blue-100/50">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-600 rounded-[2rem] text-white">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lessons Finished</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalLessonsCompleted || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl flex items-center justify-between border border-blue-100/50">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 rounded-[2rem] text-emerald-600">
                    <Flame size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courses Completed</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.completedCourses || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Live */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Upcoming Live Sessions</h3>
            </div>
            <div className="space-y-4">
              {upcomingLive.length > 0 ? upcomingLive.map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-blue-100 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase">
                        {new Date(item.scheduledAt).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                        {new Date(item.scheduledAt).getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-blue-600 mb-0.5">LIVE SESSION</p>
                    <h5 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 font-medium">No sessions scheduled.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{activity.details}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                  <p className="text-[10px] text-slate-400">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

