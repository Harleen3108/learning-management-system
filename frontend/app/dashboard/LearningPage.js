'use client';
import { useState, useEffect, useRef } from 'react';
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
  Bookmark
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import QuizTaker from '@/components/QuizTaker';
import api from '@/services/api';

export default function LearningPage({ params }) {
  const videoRef = useRef(null);
  const [activeTab, setActiveTab] = useState('content');
  const [course, setCourse] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // { type: 'video'|'quiz', data: object }
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [liveSessions, setLiveSessions] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // Student Progress, Notes & Bookmarks
  const [userProgress, setUserProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchCourse = async () => {
    setLoading(true);
    setIsLocked(false);
    try {
      const res = await api.get(`/courses/${params.id}`);
      const courseData = res.data.data;
      setCourse(courseData);
      setIsEnrolled(res.data.isEnrolled);
      
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
                        type: 'video', 
                        data: lesson, 
                        moduleTitle: mod.title,
                        startTime: lastUpdated.lastWatchedTime 
                    });
                    found = true;
                    break;
                }
            }
            if (!found && courseData.modules?.[0]?.lessons?.[0]) {
                setActiveItem({ type: 'video', data: courseData.modules[0].lessons[0], moduleTitle: courseData.modules[0].title });
            }
        } else if (courseData.modules?.[0]?.lessons?.[0]) {
            setActiveItem({ type: 'video', data: courseData.modules[0].lessons[0], moduleTitle: courseData.modules[0].title });
        }
      } else if (courseData.modules?.[0]?.lessons?.[0]) {
        setActiveItem({ type: 'video', data: courseData.modules[0].lessons[0], moduleTitle: courseData.modules[0].title });
      }

      // Fetch Live Sessions
      try {
          const liveRes = await api.get(`/live-classes/course/${params.id}`);
          setLiveSessions(liveRes.data.data);
      } catch (e) {
          console.warn('Could not fetch live classes');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsLocked(true);
      }
      console.error('Fetch course failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonVideo = async (lessonId) => {
    if (!isEnrolled) {
      setCurrentVideoUrl(null);
      return;
    }
    try {
      const res = await api.get(`/courses/${params.id}/lessons/${lessonId}/video`);
      setCurrentVideoUrl(res.data.videoUrl);
    } catch (err) {
      console.error('Failed to fetch secure video url');
      setCurrentVideoUrl(null);
    }
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

  const handleMarkAsComplete = async (lessonId) => {
    if (!isEnrolled) return;
    try {
        await api.post('/student/progress', {
            courseId: params.id,
            lessonId: lessonId || activeItem.data._id,
            isCompleted: true
        });
        // Update local state
        setUserProgress(prev => {
            const existing = prev.find(p => p.lesson === (lessonId || activeItem.data._id));
            if (existing) {
                return prev.map(p => p.lesson === (lessonId || activeItem.data._id) ? { ...p, isCompleted: true } : p);
            }
            return [...prev, { lesson: (lessonId || activeItem.data._id), isCompleted: true }];
        });
    } catch (err) {
        console.error('Failed to mark as complete');
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

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Initializing Flow...</div>;

  if (!course) return <div className="p-20 text-center font-black text-slate-400">Course not found.</div>;

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
        {/* Left Side: Video Player & Tabs */}
        <div className="flex-1 space-y-6">
          {/* Live Sessions Alert */}
          {liveSessions.length > 0 && (
            <div className="bg-emerald-600 p-4 rounded-3xl text-white flex items-center justify-between shadow-lg shadow-emerald-600/20 animate-pulse">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                     <Video size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Upcoming Live Session</p>
                    <p className="font-bold">{liveSessions[0].title} @ {new Date(liveSessions[0].scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
               <a 
                href={liveSessions[0].meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-emerald-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
               >
                 Join Live <ExternalLink size={14} />
               </a>
            </div>
          )}

          <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/40 relative group">
            <div className="absolute top-6 left-10 z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>{course.title}</span>
              <ChevronDown className="-rotate-90" size={12} />
              <span className="text-blue-600">{activeItem?.moduleTitle}</span>
            </div>

            {activeItem?.type === 'video' ? (
              <div className="w-full h-full relative">
                 {isEnrolled && currentVideoUrl ? (
                   <video 
                     ref={videoRef}
                     key={currentVideoUrl}
                     controls 
                     onTimeUpdate={handleTimeUpdate}
                     onEnded={() => handleMarkAsComplete()}
                     onLoadedMetadata={() => {
                        if (activeItem.startTime && videoRef.current) {
                            videoRef.current.currentTime = activeItem.startTime;
                        }
                     }}
                     className="w-full h-full object-cover"
                     poster={course.thumbnail}
                   >
                     <source src={currentVideoUrl} type="video/mp4" />
                     Your browser does not support the video tag.
                   </video>
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm space-y-4">
                      <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center shadow-lg">
                         <Lock size={24} />
                      </div>
                      <div className="text-center">
                         <p className="text-white font-black uppercase text-xs tracking-widest mb-1">Content Locked</p>
                         <p className="text-slate-400 text-[10px] font-bold">Enroll in the course to unlock this lesson</p>
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
                 )}
              </div>
            ) : (
              <Card className="bg-white min-h-[500px] rounded-[2.5rem] shadow-xl overflow-hidden border-none p-0 flex flex-col items-center justify-center border border-slate-100">
                <QuizTaker 
                   quiz={activeItem?.data} 
                   onComplete={() => setActiveTab('resources')} 
                />
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h1 className="text-4xl font-black text-slate-900 leading-tight">
                    {activeItem?.data?.title || 'Loading Lesson...'}
                  </h1>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      <Clock size={16} /> Course Duration: {course.duration || 'N/A'}
                    </div>
                    {isEnrolled && isLessonCompleted(activeItem?.data?._id) && (
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                            <CheckCircle2 size={16} /> Completed
                        </div>
                    )}
                  </div>
               </div>
               <div className="flex gap-3">
                  {isEnrolled && activeItem?.type === 'video' && !isLessonCompleted(activeItem?.data?._id) && (
                     <button 
                        onClick={() => handleMarkAsComplete()}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-100 hover:bg-emerald-200 rounded-2xl font-bold text-sm text-emerald-700 transition-all"
                     >
                        <CheckCircle2 size={18} /> Mark Complete
                     </button>
                  )}
                  <button 
                    onClick={handleToggleBookmark}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                        isBookmarked 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} /> 
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-sm text-slate-700 transition-all">
                    <Share2 size={18} /> Share
                  </button>
               </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-100 mt-10">
              <div className="flex gap-10">
                {['content', 'notes', 'resources'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 min-h-[400px]">
              {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                       <h3 className="text-2xl font-black text-slate-900 mb-6 underline decoration-blue-500/30 underline-offset-8">About this Course</h3>
                       <p className="text-slate-500 leading-relaxed font-semibold">
                         {course.description}
                       </p>
                    </div>

                    {/* Notepad component */}
                    {isEnrolled && activeItem?.type === 'video' && (
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 border-dashed">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-blue-600" size={20} />
                                    <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Personal Notes</h4>
                                </div>
                                {isSavingNote && <span className="text-[10px] font-black text-slate-400 uppercase bg-white px-3 py-1 rounded-full border border-slate-100 animate-pulse">Saving...</span>}
                            </div>
                            <textarea 
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Jot down important points..." 
                                className="w-full bg-white rounded-3xl p-6 min-h-[120px] text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all border border-slate-100 shadow-sm"
                            />
                            <div className="flex justify-end mt-4">
                                <button 
                                    onClick={handleSaveNote}
                                    disabled={!noteContent.trim() || isSavingNote}
                                    className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    )}
                  </div>

                  <div className="space-y-6">
                     <Card className="p-8 bg-emerald-50 border-emerald-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-emerald-500 text-white rounded-xl">
                            <Star size={16} fill="currentColor" />
                          </div>
                          <h4 className="font-bold text-emerald-900 uppercase text-xs tracking-widest">Your Progress</h4>
                        </div>
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                          You've completed {userProgress.filter(p => p.isCompleted).length} items out of {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}.
                        </p>
                        <div className="mt-6 w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${calculateTotalProgress()}%` }}></div>
                        </div>
                     </Card>

                     <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest">Instructor</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">
                                {course.instructor?.name?.charAt(0)}
                            </div>
                           <div>
                              <p className="font-black text-slate-900">{course.instructor?.name}</p>
                              <p className="text-xs text-slate-400 font-bold">Expert Mentor</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-6 max-w-3xl">
                    <h3 className="text-2xl font-black text-slate-900">Your Study Notes</h3>
                    {notes.length > 0 ? notes.map(note => (
                        <div key={note._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                                    {note.lesson?.title} @ {Math.floor(note.timestamp / 60)}:{String(note.timestamp % 60).padStart(2, '0')}
                                </span>
                                <p className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-slate-600 text-sm font-medium">{note.content}</p>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-slate-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No notes captured yet for this course.</p>
                        </div>
                    )}
                </div>
              )}

              {activeTab === 'resources' && (
                  <div className="space-y-6">
                      <h3 className="text-2xl font-black text-slate-900">Downloadable Resources</h3>
                      {activeItem?.data?.attachments?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {activeItem.data.attachments.map((file, idx) => (
                                  <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all">
                                      <div className="flex items-center gap-4">
                                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                              <Download size={20} />
                                          </div>
                                          <span className="font-bold text-slate-700">{file.name || `Attachment ${idx + 1}`}</span>
                                      </div>
                                      <ArrowRight size={18} className="text-slate-300" />
                                  </a>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-20 text-slate-400">
                              <Info size={48} className="mx-auto mb-4 opacity-20" />
                              <p className="font-bold">No attachments available for this lesson.</p>
                          </div>
                      )}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Curriculum */}
        <div className="w-full xl:w-96">
          <Card className="p-8 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
             <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                  <FileText size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 text-lg">Course Curriculum</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${calculateTotalProgress()}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">{calculateTotalProgress()}% Completed</span>
                   </div>
                </div>
             </div>

             <div className="space-y-10">
                {course.modules.map((mod, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex justify-between items-center group cursor-pointer">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{mod.title}</h4>
                      <ChevronDown size={14} className="text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      {/* Lessons */}
                      {mod.lessons.map((lesson) => (
                        <div 
                          key={lesson._id} 
                          onClick={() => {
                              setActiveItem({ 
                                type: 'video', 
                                data: lesson, 
                                moduleTitle: mod.title,
                                startTime: userProgress.find(p => p.lesson === lesson._id)?.lastWatchedTime || 0
                              });
                              setActiveTab('content');
                          }}
                          className={`group p-4 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                            activeItem?.data?._id === lesson._id 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-transparent hover:border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                              activeItem?.data?._id === lesson._id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                            }`}>
                               {isLessonCompleted(lesson._id) ? <CheckCircle2 size={14} /> : <Play size={14} />}
                            </div>
                            <div>
                               <p className={`text-[11px] font-black leading-tight ${activeItem?.data?._id === lesson._id ? 'text-blue-700' : 'text-slate-900'}`}>{lesson.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Quizzes */}
                      {mod.quizzes && mod.quizzes.map((quiz) => (
                        <div 
                          key={quiz._id} 
                          onClick={() => setActiveItem({ type: 'quiz', data: quiz, moduleTitle: mod.title })}
                          className={`group p-4 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                            activeItem?.data?._id === quiz._id 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-white border-transparent hover:border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                              activeItem?.data?._id === quiz._id ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500'
                            }`}>
                               <HelpCircle size={14} />
                            </div>
                            <div>
                               <p className={`text-[11px] font-black leading-tight ${activeItem?.data?._id === quiz._id ? 'text-amber-700' : 'text-slate-900'}`}>{quiz.title}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{quiz.questions?.length || 0} Questions</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
             </div>

             <button 
                onClick={() => {
                    // Simple logic to find next lesson
                    let flatItems = [];
                    course.modules.forEach(m => {
                        m.lessons.forEach(l => flatItems.push({ type: 'video', data: l, moduleTitle: m.title }));
                        m.quizzes.forEach(q => flatItems.push({ type: 'quiz', data: q, moduleTitle: m.title }));
                    });
                    const currentIndex = flatItems.findIndex(item => item.data._id === activeItem.data._id);
                    if (currentIndex < flatItems.length - 1) {
                        setActiveItem(flatItems[currentIndex + 1]);
                    }
                }}
                className="w-full mt-12 py-5 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
             >
                Next Item
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

