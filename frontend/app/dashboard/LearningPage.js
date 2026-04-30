'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  FileText,
  MessageSquare,
  Info,
  ArrowRight,
  Download,
  Share2,
  Clock,
  Users,
  ExternalLink,
  HelpCircle,
  Star,
  Bookmark,
  Linkedin,
  Twitter,
  Youtube,
  Video,
  ChevronLeft,
  Send,
  ThumbsUp,
  PlayCircle,
  ListVideo
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import QuizTaker from '@/components/QuizTaker';
import AssignmentRunner from '@/components/AssignmentRunner';
import { BookOpen, ClipboardList, Check } from 'lucide-react';
import api from '@/services/api';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function LearningPage({ params, onBack }) {
  const videoRef = useRef(null);
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const userRole = authUser?.role?.toLowerCase() || 'student';
  const isStudent = userRole === 'student';
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // { type: 'video'|'quiz', data: object }
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [liveSessions, setLiveSessions] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [videoProvider, setVideoProvider] = useState('direct');
  const [videoError, setVideoError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // Student Progress, Notes & Bookmarks
  const [userProgress, setUserProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Comments / reviews
  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [postingComment, setPostingComment] = useState(false);

  // Mobile-only: hide curriculum sidebar by default to give the video full width
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
        ...prev,
        [moduleId]: !prev[moduleId]
    }));
  };

  const fetchCourse = async () => {
    setLoading(true);
    setIsLocked(false);
    try {
      const res = await api.get(`/courses/${params.id}`);
      const courseData = res.data.data;
      setCourse(courseData);
      setIsEnrolled(res.data.isEnrolled);
      
      // Fetch Instructor Profile Stats
      if (courseData.instructor?._id) {
          api.get(`/instructors/${courseData.instructor._id}/profile`)
            .then(iRes => {
                setStats(iRes.data.data.stats);
                // Merge full instructor data into course
                setCourse(prev => ({
                    ...prev,
                    instructor: { ...prev.instructor, ...iRes.data.data.profile }
                }));
            })
            .catch(e => console.warn('Instructor profile fetch failed'));
      }
      
      // Fetch Progress if enrolled
      if (res.data.isEnrolled) {
        const progressRes = await api.get(`/student/progress/${params.id}`);
        setUserProgress(progressRes.data.data);

        // Fetch Notes
        const notesRes = await api.get(`/student/notes/${params.id}`);
        setNotes(notesRes.data.data);

        // Fetch Bookmarks for this course
        const bookmarkRes = await api.get('/student/bookmarks');
        setAllBookmarks(bookmarkRes.data.data);

        // Resume Logic: Find last updated lesson or first lesson
        const lastUpdated = progressRes.data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        
        if (lastUpdated) {
            // Find the lesson in course data to get its module title
            let found = false;
            for (const mod of courseData.modules) {
                const lesson = mod.lessons.find(l => l._id === lastUpdated.lesson);
                if (lesson) {
                    setActiveItem({
                        type: lesson.type || 'video',
                        data: lesson,
                        moduleTitle: mod.title,
                        startTime: lastUpdated.lastWatchedTime
                    });
                    found = true;
                    break;
                }
            }
            if (!found && courseData.modules?.[0]?.lessons?.[0]) {
                const first = courseData.modules[0].lessons[0];
                setActiveItem({ type: first.type || 'video', data: first, moduleTitle: courseData.modules[0].title });
            }
        } else if (courseData.modules?.[0]?.lessons?.[0]) {
            const first = courseData.modules[0].lessons[0];
            setActiveItem({ type: first.type || 'video', data: first, moduleTitle: courseData.modules[0].title });
        }
      } else if (courseData.modules?.[0]?.lessons?.[0]) {
        const first = courseData.modules[0].lessons[0];
        setActiveItem({ type: first.type || 'video', data: first, moduleTitle: courseData.modules[0].title });
      }

      // Default expand the first module
      if (courseData.modules?.[0]) {
          setExpandedModules({ [courseData.modules[0]._id]: true });
      }

      // Fetch Live Sessions
      try {
          const liveRes = await api.get(`/live-classes/course/${params.id}`);
          setLiveSessions(liveRes.data.data);
      } catch (e) {
          console.warn('Could not fetch live classes');
      }
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setIsLocked(true);
      }
      console.error('Fetch course failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonVideo = async (lessonId) => {
    setVideoError(null);
    if (!isEnrolled) {
      setCurrentVideoUrl(null);
      setVideoProvider('direct');
      return;
    }
    try {
      const res = await api.get(`/courses/${params.id}/lessons/${lessonId}/video`);
      setCurrentVideoUrl(res.data.videoUrl);
      setVideoProvider(res.data.provider || 'direct');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load this lesson video.';
      console.error('Failed to fetch lesson video:', msg);
      setCurrentVideoUrl(null);
      setVideoError(msg);
    }
  };

  // Convert a YouTube/Vimeo watch URL into its embeddable form.
  const toEmbedUrl = (url, provider) => {
    if (!url) return '';
    if (provider === 'youtube') {
      // youtu.be/<id>   or   youtube.com/watch?v=<id>   or   youtube.com/embed/<id>
      const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
      const watchMatch = url.match(/[?&]v=([\w-]+)/);
      const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
      const id = shortMatch?.[1] || watchMatch?.[1] || embedMatch?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (provider === 'vimeo') {
      const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : url;
    }
    return url;
  };

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  useEffect(() => {
    if (activeItem?.type === 'video' && activeItem?.data?._id) {
      fetchLessonVideo(activeItem.data._id);
      // Check if current lesson is bookmarked
      setIsBookmarked(allBookmarks.some(b => b.lesson?._id === activeItem.data._id));
    }
  }, [activeItem, isEnrolled, allBookmarks]);

  const handleEnrollFromPlayer = async () => {
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${params.id}`);
      fetchCourse(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  // Progress Tracking Logic
  const lastSyncTime = useRef(0);
  const handleTimeUpdate = () => {
    if (!videoRef.current || !isEnrolled) return;
    
    const currentTime = Math.floor(videoRef.current.currentTime);
    // Sync every 10 seconds
    if (currentTime % 10 === 0 && currentTime !== lastSyncTime.current) {
        lastSyncTime.current = currentTime;
        api.post('/student/progress', {
            courseId: params.id,
            lessonId: activeItem.data._id,
            lastWatchedTime: currentTime
        }).catch(err => console.error('Failed to sync progress'));
    }
  };

  const handleMarkAsComplete = async (lessonId, opts = {}) => {
    if (!isEnrolled) return;
    const targetId = lessonId || activeItem?.data?._id;
    if (!targetId) return;
    try {
        // For reading lessons we use the dedicated endpoint so the server flips markedAsRead too
        if (opts.kind === 'reading') {
            await api.post(`/student/progress/${targetId}/mark-read`);
        } else {
            await api.post('/student/progress', {
                courseId: params.id,
                lessonId: targetId,
                isCompleted: true
            });
        }
        // Update local state
        setUserProgress(prev => {
            const existing = prev.find(p => p.lesson === targetId);
            if (existing) {
                return prev.map(p => p.lesson === targetId ? { ...p, isCompleted: true } : p);
            }
            return [...prev, { lesson: targetId, isCompleted: true }];
        });
        // Auto-advance unless caller opts out (e.g. on video natural-end we prefer not to jump)
        if (opts.autoAdvance) {
            setTimeout(() => goToNext(), 300);
        }
    } catch (err) {
        console.error('Failed to mark as complete', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isEnrolled || activeItem?.type !== 'video') return;
    try {
        const res = await api.post('/student/bookmarks', {
            courseId: params.id,
            lessonId: activeItem.data._id
        });
        setIsBookmarked(res.data.isBookmarked);
        // Update local list
        if (res.data.isBookmarked) {
            setAllBookmarks([...allBookmarks, { lesson: { _id: activeItem.data._id } }]);
        } else {
            setAllBookmarks(allBookmarks.filter(b => b.lesson?._id !== activeItem.data._id));
        }
    } catch (err) {
        console.error('Failed to toggle bookmark');
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !isEnrolled) return;
    setIsSavingNote(true);
    try {
        const timestamp = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
        const res = await api.post('/student/notes', {
            courseId: params.id,
            lessonId: activeItem.data._id,
            content: noteContent,
            timestamp
        });
        setNotes([res.data.data, ...notes]);
        setNoteContent('');
        setActiveTab('notes');
    } catch (err) {
        alert('Failed to save note');
    } finally {
        setIsSavingNote(false);
    }
  };

  const fetchReviews = async () => {
    try {
        const res = await api.get(`/reviews/course/${params.id}`);
        setReviews(res.data.data || []);
    } catch (err) {
        console.warn('Failed to load reviews');
    }
  };

  useEffect(() => { fetchReviews(); }, [params.id]);

  const handlePostComment = async () => {
    if (!commentText.trim() || !isEnrolled) return;
    setPostingComment(true);
    try {
        await api.post('/reviews', {
            course: params.id,
            rating: commentRating,
            comment: commentText.trim()
        });
        setCommentText('');
        setCommentRating(5);
        fetchReviews();
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to post your comment');
    } finally {
        setPostingComment(false);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return userProgress.find(p => p.lesson === lessonId)?.isCompleted;
  };

  const calculateTotalProgress = () => {
    if (!course) return 0;
    let totalLessons = 0;
    course.modules.forEach(m => totalLessons += m.lessons.length);
    const completedCount = userProgress.filter(p => p.isCompleted).length;
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  };

  if (loading) return <div className="p-20 text-center font-semibold text-slate-400 animate-pulse">Initializing Flow...</div>;

  if (!course) return <div className="p-20 text-center font-semibold text-slate-400">Course not found.</div>;

  // Flatten the curriculum into a sequential array for next/prev navigation.
  // Each lesson's type drives how the player renders it: 'video' | 'reading' | 'assignment'.
  const flatCurriculum = (() => {
    const out = [];
    course.modules.forEach(m => {
      (m.attachments || []).forEach(a => out.push({ type: 'pdf', data: a, moduleTitle: m.title, _key: `mod-${m._id}-att-${a.url}` }));
      (m.lessons || []).forEach(l => {
        out.push({ type: l.type || 'video', data: l, moduleTitle: m.title, _key: `lesson-${l._id}` });
        (l.attachments || []).forEach(a => out.push({ type: 'pdf', data: a, moduleTitle: m.title, _key: `lesson-${l._id}-att-${a.url}` }));
      });
      (m.quizzes || []).forEach(q => out.push({ type: 'quiz', data: q, moduleTitle: m.title, _key: `quiz-${q._id}` }));
    });
    return out;
  })();

  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedLessons = userProgress.filter(p => p.isCompleted).length;
  const moduleTitle = activeItem?.moduleTitle || '';

  const goToNext = () => {
    if (!activeItem?.data?._id && !activeItem?.data?.url) return;
    const idx = flatCurriculum.findIndex(i =>
      (i.data._id && i.data._id === activeItem.data._id) ||
      (i.data.url && i.data.url === activeItem.data?.url)
    );
    if (idx >= 0 && idx < flatCurriculum.length - 1) {
      setActiveItem(flatCurriculum[idx + 1]);
      setActiveTab('overview');
    }
  };

  const goToPrev = () => {
    if (!activeItem?.data?._id && !activeItem?.data?.url) return;
    const idx = flatCurriculum.findIndex(i =>
      (i.data._id && i.data._id === activeItem.data._id) ||
      (i.data.url && i.data.url === activeItem.data?.url)
    );
    if (idx > 0) {
      setActiveItem(flatCurriculum[idx - 1]);
      setActiveTab('overview');
    }
  };

  // ────────────────────────────────────────────────────────────────────
  // Player block — shared between desktop and mobile renderings
  // ────────────────────────────────────────────────────────────────────
  // Reading and assignment lessons use a different container — they're document-like content,
  // not a video aspect ratio. Build a flexible wrapper that switches between aspects.
  const isMediaLesson = activeItem?.type === 'video' || activeItem?.type === 'pdf' || activeItem?.type === 'quiz';

  const playerBlock = (
    <div className={clsx(
      'w-full bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-900/20 relative',
      isMediaLesson ? 'aspect-video bg-black' : 'min-h-[60vh]'
    )}>
      {activeItem?.type === 'video' ? (
        isEnrolled && currentVideoUrl ? (
          (videoProvider === 'youtube' || videoProvider === 'vimeo') ? (
            <iframe
              key={currentVideoUrl}
              src={toEmbedUrl(currentVideoUrl, videoProvider)}
              title={activeItem?.data?.title || 'Lesson video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              ref={videoRef}
              key={currentVideoUrl}
              src={currentVideoUrl}
              controls
              controlsList="nodownload"
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => handleMarkAsComplete(activeItem.data._id, { autoAdvance: true })}
              onError={() => setVideoError('This video failed to load. The link may have expired or the format is unsupported.')}
              onLoadedMetadata={() => {
                if (activeItem.startTime && videoRef.current) {
                  videoRef.current.currentTime = activeItem.startTime;
                }
              }}
              className="w-full h-full object-contain bg-black"
              poster={course.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 space-y-4 px-6">
            <div className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
              isEnrolled ? "bg-amber-500/20 text-amber-400" : "bg-blue-600/20 text-blue-400"
            )}>
              {isEnrolled ? <Info size={24} /> : <Lock size={24} />}
            </div>
            <div className="text-center max-w-md">
              <p className="text-white font-semibold uppercase text-xs tracking-widest mb-1">
                {isEnrolled ? 'Video Unavailable' : 'Content Locked'}
              </p>
              <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                {isEnrolled
                  ? (videoError || 'This lesson does not have a video uploaded yet.')
                  : 'Enroll in the course to unlock this lesson'}
              </p>
            </div>
            {!isEnrolled && (
              <button
                onClick={handleEnrollFromPlayer}
                disabled={enrolling}
                className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                {enrolling ? 'Processing...' : 'Enroll Now'}
              </button>
            )}
          </div>
        )
      ) : activeItem?.type === 'pdf' ? (
        <div className="w-full h-full bg-white flex flex-col">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{moduleTitle}</p>
              <h2 className="text-lg font-semibold text-slate-900 truncate">{activeItem.data.name}</h2>
            </div>
            <a
              href={activeItem.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shrink-0"
            >
              <Download size={14} /> Download
            </a>
          </div>
          <div className="flex-1 bg-slate-800">
            <iframe src={`${activeItem.data.url}#toolbar=0`} className="w-full h-full border-none" title={activeItem.data.name} />
          </div>
        </div>
      ) : activeItem?.type === 'quiz' ? (
        <div className="bg-white w-full h-full overflow-y-auto">
          <QuizTaker quiz={activeItem?.data} onComplete={() => setActiveTab('overview')} />
        </div>
      ) : activeItem?.type === 'reading' ? (
        <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
          <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto w-full">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-2">{moduleTitle} • Reading</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight leading-tight">{activeItem.data.title}</h2>
            <p className="text-xs text-slate-400 font-medium mt-2">{activeItem.data.readingMinutes || 4} min read</p>
            {/* Body — supports markdown-ish rendering via plain prose */}
            <article className="prose prose-slate max-w-none mt-8 text-[15px] leading-relaxed font-medium text-slate-700 whitespace-pre-wrap">
              {activeItem.data.readingContent || 'No reading content yet.'}
            </article>
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={goToPrev}
                className="px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl"
              >
                Previous
              </button>
              {isLessonCompleted(activeItem.data._id) ? (
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-semibold text-xs uppercase tracking-widest">
                  <CheckCircle2 size={13} /> Completed
                </span>
              ) : (
                <button
                  onClick={() => isEnrolled && handleMarkAsComplete(activeItem.data._id, { kind: 'reading', autoAdvance: true })}
                  disabled={!isEnrolled}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  <Check size={13} /> Mark as completed
                </button>
              )}
            </div>
          </div>
        </div>
      ) : activeItem?.type === 'assignment' ? (
        <div className="w-full h-full bg-white overflow-y-auto">
          {isEnrolled ? (
            <AssignmentRunner
              key={activeItem.data._id}
              lesson={activeItem.data}
              onComplete={({ passed }) => {
                // Reflect completion in the curriculum sidebar locally + auto-advance after a beat
                setUserProgress(prev => {
                  const existing = prev.find(p => p.lesson === activeItem.data._id);
                  if (existing) {
                    return prev.map(p => p.lesson === activeItem.data._id ? { ...p, isCompleted: true } : p);
                  }
                  return [...prev, { lesson: activeItem.data._id, isCompleted: true }];
                });
                if (passed) setTimeout(() => goToNext(), 1500);
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 py-20">
              <Lock size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Enroll to take this assignment</p>
              <button
                onClick={handleEnrollFromPlayer}
                disabled={enrolling}
                className="mt-4 px-6 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
              >
                {enrolling ? 'Processing…' : 'Enroll Now'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
          Select a lesson from the right
        </div>
      )}
    </div>
  );

  // ────────────────────────────────────────────────────────────────────
  // Sidebar (right): Course content / Up next list (YouTube playlist style)
  // ────────────────────────────────────────────────────────────────────
  const sidebarBlock = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col max-h-[calc(100vh-7rem)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListVideo size={16} className="text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Course content</h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {completedLessons}/{totalLessons}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${calculateTotalProgress()}%` }} />
          </div>
          <span className="text-[10px] font-bold text-emerald-600">{calculateTotalProgress()}%</span>
        </div>
      </div>

      {/* Scrollable chapter list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {course.modules.map((mod, idx) => {
          const modCompleted = (mod.lessons || []).filter(l => isLessonCompleted(l._id)).length;
          const modTotal = (mod.lessons || []).length;
          const expanded = expandedModules[mod._id];
          return (
            <div key={mod._id || idx} className="border-b border-slate-50 last:border-b-0">
              <button
                onClick={() => toggleModule(mod._id)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Chapter {idx + 1}</p>
                  <p className="font-semibold text-slate-800 text-[13px] truncate">{mod.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    {modCompleted}/{modTotal} · {modTotal} lesson{modTotal === 1 ? '' : 's'}
                  </p>
                </div>
                <ChevronDown size={16} className={clsx("text-slate-400 shrink-0 transition-transform", expanded && "rotate-180")} />
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50/30"
                  >
                    {/* Module-level resources */}
                    {(mod.attachments || []).map((att, aIdx) => {
                      const isActive = activeItem?.type === 'pdf' && activeItem?.data?.url === att.url;
                      return (
                        <button
                          key={`${mod._id}-modatt-${aIdx}`}
                          onClick={() => {
                            setActiveItem({ type: 'pdf', data: att, moduleTitle: mod.title });
                            setActiveTab('overview');
                          }}
                          className={clsx(
                            "w-full px-5 py-2.5 flex items-center gap-3 text-left transition-all border-l-2",
                            isActive ? "bg-blue-50 border-blue-600" : "border-transparent hover:bg-white"
                          )}
                        >
                          <FileText size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                          <span className={clsx("text-[12px] font-medium truncate flex-1", isActive ? "text-blue-700" : "text-slate-600")}>
                            {att.name || 'Module resource'}
                          </span>
                          <span className="text-[9px] font-bold text-blue-500 uppercase">PDF</span>
                        </button>
                      );
                    })}

                    {/* Lessons */}
                    {(mod.lessons || []).map((lesson, lIdx) => {
                      const lessonType = lesson.type || 'video';
                      const isActive = activeItem?.data?._id === lesson._id && (
                        activeItem?.type === lessonType
                        || (activeItem?.type === 'video' && lessonType === 'video')
                      );
                      const completed = isLessonCompleted(lesson._id);
                      // Per-type icon + label
                      const TypeIcon = lessonType === 'reading' ? BookOpen
                                      : lessonType === 'assignment' ? ClipboardList
                                      : PlayCircle;
                      const typeLabel = lessonType === 'reading' ? 'Reading'
                                      : lessonType === 'assignment' ? 'Practice'
                                      : 'Video';
                      // Subtitle: minutes for reading, duration for video, "X questions" for assignment
                      const subtitle = lessonType === 'reading'
                        ? `Reading • ${lesson.readingMinutes || 4} min`
                        : lessonType === 'assignment'
                          ? `Practice • ${lesson.assignment?.questions?.length || 0} questions`
                          : (lesson.duration ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` : null);
                      return (
                        <React.Fragment key={lesson._id}>
                          <button
                            onClick={() => {
                              setActiveItem({
                                type: lessonType,
                                data: lesson,
                                moduleTitle: mod.title,
                                startTime: userProgress.find(p => p.lesson === lesson._id)?.lastWatchedTime || 0
                              });
                              setActiveTab('overview');
                            }}
                            className={clsx(
                              "w-full px-5 py-3 flex items-center gap-3 text-left transition-all border-l-2",
                              isActive ? "bg-blue-50 border-blue-600" : "border-transparent hover:bg-white"
                            )}
                          >
                            <div className={clsx(
                              "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                              completed ? "bg-emerald-100 text-emerald-600" : isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                            )}>
                              {completed ? <CheckCircle2 size={13} /> : <TypeIcon size={13} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={clsx("text-[12px] font-semibold leading-tight truncate", isActive ? "text-blue-700" : "text-slate-800")}>
                                {lIdx + 1}. {lesson.title}
                              </p>
                              {subtitle && (
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
                              )}
                            </div>
                          </button>

                          {/* Lesson attachments */}
                          {(lesson.attachments || []).map((att, aIdx) => {
                            const aActive = activeItem?.type === 'pdf' && activeItem?.data?.url === att.url;
                            return (
                              <button
                                key={`${lesson._id}-att-${aIdx}`}
                                onClick={() => {
                                  setActiveItem({ type: 'pdf', data: att, moduleTitle: mod.title });
                                  setActiveTab('overview');
                                }}
                                className={clsx(
                                  "w-full pl-14 pr-5 py-2 flex items-center gap-2 text-left transition-all border-l-2",
                                  aActive ? "bg-blue-50/60 border-blue-600" : "border-transparent hover:bg-white"
                                )}
                              >
                                <FileText size={12} className={aActive ? "text-blue-600" : "text-slate-400"} />
                                <span className={clsx("text-[11px] font-medium truncate flex-1", aActive ? "text-blue-700" : "text-slate-500")}>
                                  {att.name || 'Resource'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">PDF</span>
                              </button>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}

                    {/* Quizzes */}
                    {(mod.quizzes || []).map((quiz) => {
                      const isActive = activeItem?.type === 'quiz' && activeItem?.data?._id === quiz._id;
                      return (
                        <button
                          key={quiz._id}
                          onClick={() => { setActiveItem({ type: 'quiz', data: quiz, moduleTitle: mod.title }); setActiveTab('overview'); }}
                          className={clsx(
                            "w-full px-5 py-3 flex items-center gap-3 text-left transition-all border-l-2",
                            isActive ? "bg-amber-50 border-amber-500" : "border-transparent hover:bg-white"
                          )}
                        >
                          <div className={clsx(
                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                            isActive ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600"
                          )}>
                            <HelpCircle size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={clsx("text-[12px] font-semibold leading-tight truncate", isActive ? "text-amber-700" : "text-slate-800")}>
                              {quiz.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{quiz.questions?.length || 0} questions</p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <DashboardLayout>
      <div className="-mx-4 lg:-mx-8 -mt-4 lg:-mt-8">
        <div className="bg-slate-100 min-h-[calc(100vh-5rem)]">
          <div className="max-w-[1700px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">

            {/* Back to course header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <ChevronLeft size={14} /> Back to course
              </button>

              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-semibold">
                <span className="truncate max-w-[400px]">{course.title}</span>
              </div>
            </div>

            {/* Live session banner */}
            {liveSessions.length > 0 && (
              <div className="bg-emerald-600 text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white/20 rounded-lg shrink-0"><Video size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Live Session</p>
                    <p className="font-semibold text-sm truncate">
                      {liveSessions[0].title} @ {new Date(liveSessions[0].scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <a
                  href={liveSessions[0].meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0"
                >
                  Join <ExternalLink size={12} />
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-4 lg:gap-6">

              {/* ─────────── MAIN COLUMN ─────────── */}
              <main className="min-w-0 space-y-4">
                {playerBlock}

                {/* Title + actions */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="truncate">{course.title}</span>
                    <ChevronDown className="-rotate-90 shrink-0" size={10} />
                    <span className="text-blue-600 truncate">{moduleTitle || 'Lesson'}</span>
                  </p>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 leading-tight">
                    {activeItem?.data?.title || activeItem?.data?.name || 'Loading…'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {/* Instructor badge */}
                    <div className="flex items-center gap-2 mr-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        <img
                          src={course.instructor?.profilePhoto === 'no-photo.jpg'
                            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.name}`
                            : course.instructor?.profilePhoto}
                          alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[12px] font-semibold text-slate-800">{course.instructor?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{course.instructor?.instructorSpecialty || 'Instructor'}</p>
                      </div>
                    </div>

                    {isEnrolled && activeItem?.type === 'video' && !isLessonCompleted(activeItem?.data?._id) && (
                      <button
                        onClick={() => handleMarkAsComplete()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-semibold text-xs text-emerald-700 transition-all"
                      >
                        <CheckCircle2 size={14} /> Mark Complete
                      </button>
                    )}
                    {isEnrolled && isLessonCompleted(activeItem?.data?._id) && activeItem?.type === 'video' && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl font-semibold text-xs text-emerald-700">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    )}
                    <button
                      onClick={handleToggleBookmark}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all",
                        isBookmarked ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      )}
                    >
                      <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-xs text-slate-700 transition-all">
                      <Share2 size={14} /> Share
                    </button>
                  </div>

                  {/* Prev / Next nav */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={goToPrev}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      onClick={goToNext}
                      className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-all"
                    >
                      Next lesson <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 px-5 lg:px-6 flex gap-6 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'comments', label: `Comments${reviews.length ? ` (${reviews.length})` : ''}` },
                      { id: 'notes', label: `Notes${notes.length ? ` (${notes.length})` : ''}` },
                      { id: 'resources', label: 'Resources' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={clsx(
                          "py-3 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                          activeTab === t.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {t.label}
                        {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 lg:p-6 min-h-[300px]">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 mb-2">About this course</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-slate-50 rounded-xl">
                            <p className="text-base font-semibold text-slate-900">{totalLessons}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lessons</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-xl">
                            <p className="text-base font-semibold text-slate-900">{stats?.totalStudents || '—'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Students</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-xl">
                            {stats?.averageRating > 0 ? (
                              <p className="text-base font-semibold text-slate-900 flex items-center justify-center gap-1">
                                <Star size={12} className="text-orange-400 fill-orange-400" />
                                {Number(stats.averageRating).toFixed(1)}
                              </p>
                            ) : (
                              <p className="text-base font-semibold text-slate-400">—</p>
                            )}
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-xl">
                            <p className="text-base font-semibold text-emerald-600">{calculateTotalProgress()}%</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">You</p>
                          </div>
                        </div>

                        {/* Instructor bio card */}
                        <div className="border-t border-slate-100 pt-5">
                          <h3 className="text-base font-semibold text-slate-900 mb-3">Instructor</h3>
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                              <img
                                src={course.instructor?.profilePhoto === 'no-photo.jpg'
                                  ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.name}`
                                  : course.instructor?.profilePhoto}
                                alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900">{course.instructor?.name}</p>
                              <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-widest mb-2">
                                {course.instructor?.instructorSpecialty || 'Expert Mentor'}
                              </p>
                              {course.instructor?.instructorBio && (
                                <p className="text-sm text-slate-500 leading-relaxed">{course.instructor.instructorBio}</p>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                {course.instructor?.socialLinks?.linkedin && (
                                  <a href={course.instructor.socialLinks.linkedin} target="_blank" className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg"><Linkedin size={12} /></a>
                                )}
                                {course.instructor?.socialLinks?.twitter && (
                                  <a href={course.instructor.socialLinks.twitter} target="_blank" className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-400 rounded-lg"><Twitter size={12} /></a>
                                )}
                                {course.instructor?.socialLinks?.youtube && (
                                  <a href={course.instructor.socialLinks.youtube} target="_blank" className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg"><Youtube size={12} /></a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COMMENTS TAB */}
                    {activeTab === 'comments' && (
                      <div className="space-y-6">
                        {isEnrolled && isStudent && (
                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Leave a comment & rating</p>
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setCommentRating(n)} className="p-0.5">
                                  <Star size={20} className={n <= commentRating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'} />
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Share your thoughts about this course…"
                              className="w-full bg-white rounded-xl p-4 min-h-[80px] text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 border border-slate-100 resize-none"
                            />
                            <div className="flex justify-end mt-3">
                              <button
                                onClick={handlePostComment}
                                disabled={!commentText.trim() || postingComment}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 transition-all"
                              >
                                <Send size={13} /> {postingComment ? 'Posting…' : 'Post'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                            {reviews.length} comment{reviews.length === 1 ? '' : 's'}
                          </p>
                          {reviews.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
                              <p className="text-sm font-semibold">Be the first to comment.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {reviews.map(r => (
                                <div key={r._id} className="flex gap-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                    <img
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user?.name || r.user || 'student'}`}
                                      alt="" className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <p className="text-sm font-semibold text-slate-800">{r.user?.name || 'Student'}</p>
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(n => (
                                          <Star key={n} size={11} className={n <= (r.rating || 0) ? 'text-orange-400 fill-orange-400' : 'text-slate-200'} />
                                        ))}
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{r.comment || r.review}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NOTES TAB */}
                    {activeTab === 'notes' && (
                      <div className="space-y-5">
                        {/* Instructor notes shown above the student's own notes */}
                        {activeItem?.data?.notes && (
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-2">From the instructor</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {activeItem.data.notes}
                            </p>
                          </div>
                        )}
                        {isEnrolled && activeItem?.type === 'video' && (
                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 border-dashed">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="text-blue-600" size={16} />
                                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Take a note</h4>
                              </div>
                              {isSavingNote && <span className="text-[9px] font-bold text-slate-400 uppercase animate-pulse">Saving…</span>}
                            </div>
                            <textarea
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              placeholder="Jot down a thought at the current timestamp…"
                              className="w-full bg-white rounded-xl p-4 min-h-[80px] text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 border border-slate-100 resize-none"
                            />
                            <div className="flex justify-end mt-3">
                              <button
                                onClick={handleSaveNote}
                                disabled={!noteContent.trim() || isSavingNote}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 transition-all"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        )}
                        {notes.length > 0 ? notes.map(note => (
                          <div key={note._id} className="bg-white border border-slate-100 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                {note.lesson?.title} @ {Math.floor(note.timestamp / 60)}:{String(note.timestamp % 60).padStart(2, '0')}
                              </span>
                              <p className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm text-slate-700">{note.content}</p>
                          </div>
                        )) : (
                          <div className="text-center py-12 text-slate-400">
                            <FileText size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-semibold">No notes yet.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RESOURCES / DOWNLOADS TAB */}
                    {activeTab === 'resources' && (() => {
                      // Combine attachments + downloads into one list, deduped by URL.
                      const merged = [
                        ...(activeItem?.data?.attachments || []),
                        ...(activeItem?.data?.downloads || [])
                      ];
                      const seen = new Set();
                      const items = merged.filter(f => {
                        if (!f?.url || seen.has(f.url)) return false;
                        seen.add(f.url); return true;
                      });
                      return (
                        <div>
                          {items.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {items.map((file, idx) => (
                                <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-all">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Download size={16} /></div>
                                    <span className="font-semibold text-slate-700 text-sm truncate">{file.name || `Resource ${idx + 1}`}</span>
                                  </div>
                                  <ArrowRight size={14} className="text-slate-300 shrink-0" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-slate-400">
                              <Info size={36} className="mx-auto mb-3 opacity-30" />
                              <p className="text-sm font-semibold">No downloads for this lesson.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </main>

              {/* ─────────── RIGHT SIDEBAR ─────────── */}
              <aside className="xl:sticky xl:top-24 xl:h-fit">
                {sidebarBlock}
              </aside>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

