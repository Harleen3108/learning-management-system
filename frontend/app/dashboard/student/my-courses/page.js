'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  BookOpen,
  Clock,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Search
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import Link from 'next/link';
import { clsx } from 'clsx';

// EduFlow palette: navy #071739, tan #A68868
// Typography: font-semibold for headings/values, font-medium for body — matches admin pages.

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await api.get('/student/my-courses');
        setCourses(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const buckets = useMemo(() => {
    const inProgress = courses.filter(c => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100);
    const completed = courses.filter(c => (c.progress ?? 0) === 100);
    const notStarted = courses.filter(c => (c.progress ?? 0) === 0);
    return { all: courses, inProgress, completed, notStarted };
  }, [courses]);

  const visibleCourses = useMemo(() => {
    let list = activeTab === 'progress'
      ? buckets.inProgress
      : activeTab === 'completed'
        ? buckets.completed
        : activeTab === 'notStarted'
          ? buckets.notStarted
          : buckets.all;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title?.toLowerCase().includes(q));
    }
    return list;
  }, [buckets, activeTab, search]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        {/* ───────── Header ───────── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-[#071739] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#071739]/15">
                <GraduationCap size={18} />
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">My Learning</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">Pick up right where you left off and master new skills.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your courses..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all"
            />
          </div>
        </header>

        {/* ───────── Tabs ───────── */}
        <div className="flex gap-1 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: buckets.all.length },
            { id: 'progress', label: 'In progress', count: buckets.inProgress.length },
            { id: 'completed', label: 'Completed', count: buckets.completed.length },
            { id: 'notStarted', label: 'Not started', count: buckets.notStarted.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'pb-3 px-4 text-xs uppercase tracking-widest font-semibold transition-all relative whitespace-nowrap',
                activeTab === tab.id ? 'text-[#071739]' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {tab.label}
              <span className="ml-2 text-[10px] text-slate-400">({tab.count})</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#071739] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ───────── Courses Grid ───────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-100 rounded-3xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : visibleCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCourses.map(course => {
              const progress = course.progress ?? 0;
              const isDone = progress === 100;
              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={course.thumbnail === 'no-photo.jpg'
                        ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'
                        : course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-white/95 backdrop-blur-md text-[#071739] text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                        {course.category?.name ?? course.category ?? 'Course'}
                      </span>
                      {isDone && (
                        <span className="bg-emerald-500 text-white text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={10} /> Done
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/courses/${course._id}?view=learn`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl text-[#071739]">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </Link>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#071739] transition-colors">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={13} /> {course.totalLessons || course.progress?.total || 0} lessons
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} /> {course.duration || 'Flexible'}
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                          <span>Progress</span>
                          <span className="text-slate-900">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all duration-1000",
                              isDone ? "bg-emerald-500" : "bg-[#071739]"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/courses/${course._id}?view=learn`}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15"
                      >
                        {isDone ? 'Review course' : progress > 0 ? 'Continue' : 'Start course'} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-5">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={36} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                {courses.length === 0 ? 'No active enrollments' : 'No courses match your filter'}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {courses.length === 0
                  ? "You haven't enrolled in any courses yet. Explore our catalog to start your learning journey."
                  : 'Try a different tab or clear your search.'}
              </p>
            </div>
            {courses.length === 0 && (
              <Link
                href="/dashboard/explore"
                className="inline-flex py-3 px-8 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15"
              >
                Browse Catalog
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
