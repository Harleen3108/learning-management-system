'use client';
import { useState, useEffect, useRef } from 'react';
import {
  PlayCircle,
  ArrowRight,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Calendar,
  Activity,
  Sparkles
} from 'lucide-react';
import api from '@/services/api';
import Link from 'next/link';
import { clsx } from 'clsx';
import CourseHoverPreview from '@/components/CoursePreviewPopup';

// Color tokens — EduFlow palette
//   Primary navy : #071739
//   Warm accent  : #A68868
//   Action blue  : blue-600
//
// Typography is matched to the admin pages:
//   • Headings  → font-semibold, slate-800/900
//   • Labels    → text-[10px]/[11px] font-semibold uppercase tracking-widest
//   • Body      → font-medium, slate-500/600
//   • Card vals → font-semibold

const fallbackThumb = (seed) =>
  `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800&seed=${seed || ''}`;

export default function StudentDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const recoScrollRef = useRef(null);
  const continueScrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, coursesRes, catsRes] = await Promise.all([
          api.get('/student/dashboard'),
          api.get('/courses').catch(() => ({ data: { data: [] } })),
          api.get('/categories').catch(() => ({ data: { data: [] } }))
        ]);
        setData(dashRes.data.data);
        setRecommended((coursesRes.data.data || []).slice(0, 12));
        setCategories((catsRes.data.data || []).filter(c => !c.parentId).slice(0, 10));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="bg-slate-100 rounded-3xl h-32 w-full" />
        <div className="bg-slate-100 rounded-3xl h-72 w-full" />
        <div className="bg-slate-100 rounded-3xl h-72 w-full" />
      </div>
    );
  }

  const { enrolledCourses = [], upcomingLive = [], recentActivity = [], stats = {} } = data || {};

  const continueCourse = [...enrolledCourses].sort((a, b) => {
    const dateA = a.lastLesson?.updatedAt ? new Date(a.lastLesson.updatedAt) : new Date(0);
    const dateB = b.lastLesson?.updatedAt ? new Date(b.lastLesson.updatedAt) : new Date(0);
    return dateB - dateA;
  })[0];

  const inProgress = enrolledCourses.filter(c => c.progress.percentage > 0 && c.progress.percentage < 100);
  const completed = enrolledCourses.filter(c => c.progress.percentage === 100);

  const tabbedCourses = (() => {
    if (activeTab === 'progress') return inProgress;
    if (activeTab === 'completed') return completed;
    return enrolledCourses;
  })();

  const scroll = (ref, dir) => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir * w * 0.85, behavior: 'smooth' });
  };

  const initials = (user?.name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-12">
      {/* ───────── Welcome header (Udemy-style) ───────── */}
      <section className="flex items-center gap-5">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#071739] text-white flex items-center justify-center text-xl font-semibold shrink-0 ring-4 ring-white shadow-lg shadow-slate-200/60">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
          </h1>
          <Link
            href="/dashboard/settings"
            className="inline-block text-sm font-semibold text-[#071739] hover:text-[#A68868] underline underline-offset-4 mt-1 transition-colors"
          >
            Add occupation and interests
          </Link>
        </div>

        {/* Stat tiles inline — admin-style typography */}
        <div className="hidden lg:flex ml-auto gap-3">
          <MiniStat label="Enrolled"  value={stats.enrolledCount || 0} icon={<BookOpen size={14} />} />
          <MiniStat label="Completed" value={stats.completedCourses || 0} icon={<CheckCircle2 size={14} />} />
          <MiniStat label="Lessons"   value={stats.totalLessonsCompleted || 0} icon={<Award size={14} />} />
        </div>
      </section>

      {/* ───────── Continue Learning row ───────── */}
      {enrolledCourses.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Continue learning</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Pick up where you left off.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/student/my-courses" className="text-xs font-semibold uppercase tracking-widest text-[#071739] hover:underline">
                View all
              </Link>
              {enrolledCourses.length > 2 && (
                <div className="hidden md:flex gap-2">
                  <button
                    onClick={() => scroll(continueScrollRef, -1)}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#071739] hover:text-[#071739] transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scroll(continueScrollRef, 1)}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#071739] hover:text-[#071739] transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            ref={continueScrollRef}
            className="flex gap-5 overflow-x-auto pb-3 -mx-2 px-2 scroll-smooth no-scrollbar snap-x"
            style={{ scrollbarWidth: 'none' }}
          >
            {[continueCourse, ...enrolledCourses.filter(c => c._id !== continueCourse?._id)].filter(Boolean).map(course => (
              <ContinueCard key={course._id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── What to learn next ───────── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">What to learn next</h2>
        </div>

        {/* Categories pill row */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <Link
                key={c._id}
                href={`/dashboard/explore?category=${c._id}`}
                className="px-5 py-2 bg-white border border-slate-200 hover:border-[#071739] hover:bg-[#071739] hover:text-white rounded-full text-xs font-semibold tracking-wide text-slate-600 transition-all"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/dashboard/explore"
              className="px-5 py-2 bg-[#A68868] text-white rounded-full text-xs font-semibold tracking-wide hover:bg-[#8a7152] transition-all flex items-center gap-1.5"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Recommended row */}
        {recommended.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-[#A68868]" />
                Recommended for you
              </h3>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scroll(recoScrollRef, -1)}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#071739] hover:text-[#071739] transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll(recoScrollRef, 1)}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#071739] hover:text-[#071739] transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={recoScrollRef}
              className="flex gap-5 overflow-x-auto pb-3 -mx-2 px-2 scroll-smooth no-scrollbar snap-x"
              style={{ scrollbarWidth: 'none' }}
            >
              {recommended.map(course => (
                <RecommendedCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ───────── My Learning + Sidebar ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">My learning</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Everything you've enrolled in.</p>
          </div>

          <div className="flex gap-1 border-b border-slate-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All', count: enrolledCourses.length },
              { id: 'progress', label: 'In progress', count: inProgress.length },
              { id: 'completed', label: 'Completed', count: completed.length }
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

          {tabbedCourses.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No courses in this section yet.</p>
              <Link
                href="/dashboard/explore"
                className="inline-block mt-4 text-xs uppercase tracking-widest text-[#071739] font-semibold hover:underline"
              >
                Start exploring →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {tabbedCourses.map(course => (
                <EnrolledCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {/* Upcoming Live */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Upcoming live</h3>
            </div>
            {upcomingLive.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">No live sessions scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingLive.slice(0, 4).map((item, i) => (
                  <a
                    key={i}
                    href={item.meetingUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <div className="w-12 h-14 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-semibold">
                        {new Date(item.scheduledAt).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-base text-slate-900 font-semibold leading-none mt-1">
                        {new Date(item.scheduledAt).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-blue-600 uppercase tracking-widest font-semibold mb-0.5">Live</p>
                      <p className="text-sm text-slate-800 font-semibold truncate group-hover:text-[#071739] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Momentum */}
          <div className="bg-gradient-to-br from-[#071739] to-[#0f2447] text-white rounded-3xl p-6 space-y-3 overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A68868]/30 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-[#A68868]" />
                <h3 className="text-xs uppercase tracking-widest text-white/70 font-semibold">Your momentum</h3>
              </div>
              <p className="text-3xl font-semibold mt-2">
                {stats.totalLessonsCompleted || 0}
                <span className="text-sm text-white/60 font-medium ml-2">lessons watched</span>
              </p>
              <p className="text-xs text-white/60 font-medium mt-1">
                Keep going — every lesson counts toward your certificate.
              </p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#A68868]" />
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Recent activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">No recent activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A68868] mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-medium leading-relaxed truncate">{a.details}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {new Date(a.createdAt || a.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-[#071739]/5 text-[#071739] flex items-center justify-center">
        {icon}
      </div>
      <div className="leading-tight">
        <p className="text-xl font-semibold text-slate-900">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function ContinueCard({ course }) {
  return (
    <CourseHoverPreview course={course} enrolled>
    <Link
      href={`/dashboard/courses/${course._id}?view=learn`}
      className="snap-start shrink-0 w-[300px] sm:w-[340px] bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all overflow-hidden group"
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        <img
          src={course.thumbnail && course.thumbnail !== 'no-photo.jpg' ? course.thumbnail : fallbackThumb(course._id)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/95 text-[#071739] flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            <PlayCircle size={24} />
          </div>
        </div>
        {course.progress.percentage === 100 && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} /> Done
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-[#A68868] font-semibold truncate">
          {course.lastLesson ? `Next: ${course.lastLesson.title}` : 'Start learning'}
        </p>
        <h4 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#071739] transition-colors">
          {course.title}
        </h4>
        <div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
            <span>{course.progress.completed} / {course.progress.total} lessons</span>
            <span className="text-slate-900">{course.progress.percentage}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-700',
                course.progress.percentage === 100 ? 'bg-emerald-500' : 'bg-[#071739]'
              )}
              style={{ width: `${course.progress.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
    </CourseHoverPreview>
  );
}

function EnrolledCard({ course }) {
  return (
    <CourseHoverPreview course={course} enrolled>
    <Link href={`/dashboard/courses/${course._id}?view=learn`}>
      <div className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all overflow-hidden cursor-pointer">
        <div className="aspect-[16/9] overflow-hidden relative">
          <img
            src={course.thumbnail && course.thumbnail !== 'no-photo.jpg' ? course.thumbnail : fallbackThumb(course._id)}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[9px] uppercase tracking-widest text-[#071739] font-semibold px-2.5 py-1 rounded-full">
            {course.category?.name ?? course.category ?? 'Course'}
          </div>
          {course.progress.percentage === 100 && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={10} /> Done
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#071739] transition-colors">
            {course.title}
          </h4>
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
              <span>{course.progress.completed} / {course.progress.total} lessons</span>
              <span className="text-slate-900">{course.progress.percentage}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-700',
                  course.progress.percentage === 100 ? 'bg-emerald-500' : 'bg-[#071739]'
                )}
                style={{ width: `${course.progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
    </CourseHoverPreview>
  );
}

function RecommendedCard({ course }) {
  const list = Number(course.price) || 0;
  const disc = Number(course.discountPrice) || 0;
  const payable = disc > 0 && disc < list ? disc : list;
  return (
    <CourseHoverPreview course={course} enrolled={false}>
    <Link
      href={`/dashboard/courses/${course._id}`}
      className="snap-start shrink-0 w-[260px] bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all overflow-hidden group"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={course.thumbnail && course.thumbnail !== 'no-photo.jpg' ? course.thumbnail : fallbackThumb(course._id)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {payable === 0 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full">
            Free
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#071739] transition-colors">
          {course.title}
        </h4>
        <p className="text-[11px] text-slate-400 font-medium truncate">
          {course.instructor?.name || 'EduFlow Mentor'}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-[#A68868] fill-[#A68868]" />
            <span className="text-xs text-slate-700 font-semibold">
              {course.averageRating?.toFixed(1) || '4.8'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {payable === 0 ? (
              <span className="text-sm text-emerald-600 font-semibold">Free</span>
            ) : (
              <>
                <span className="text-sm text-slate-900 font-semibold">₹{payable}</span>
                {disc > 0 && disc < list && (
                  <span className="text-[10px] text-slate-400 font-medium line-through">₹{list}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
    </CourseHoverPreview>
  );
}
