'use client';
import { useState, useEffect } from 'react';
import {
  Plus,
  Video,
  FileText,
  GripVertical,
  Trash2,
  Save,
  Rocket,
  Loader2,
  CheckCircle2,
  Paperclip,
  HelpCircle,
  AlertCircle,
  Lock,
  BookOpen,
  ClipboardList,
  Edit2
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import clsx from 'clsx';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import QuizEditor from './QuizEditor';
import LessonEditor from './LessonEditor';

const CATEGORY_ICONS = {
    'Design': 'Palette',
    'Development': 'Code',
    'Business': 'Briefcase',
    'Marketing': 'TrendingUp',
    'Music': 'Music'
};

export default function InstructorStudio({ courseId, initialData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [courseData, setCourseData] = useState({
    title: initialData?.title || '',
    description: '',
    pricingType: 'paid',
    price: 0,
    discountPrice: 0,
    category: initialData?.category || '',
    subcategory: '',
    topics: [],
    difficulty: 'beginner',
    thumbnail: '',
    subtitle: '',
    tagline: '',
    whatYouWillLearn: [''],
    requirements: [''],
    targetAudience: [''],
    language: 'English',
    status: 'draft',
    feedback: '',
    feedbackHistory: [],
    bulkLearn: '',
    bulkReqs: '',
    bulkAudience: ''
  });

  const [editingQuiz, setEditingQuiz] = useState(null); // { modId: string, quizId: string, data: object }
  const [editingLesson, setEditingLesson] = useState(null); // { modId, lessonId }

  const [modules, setModules] = useState([
    {
      id: 'initial',
      title: 'Introduction',
      lessons: [{ id: 'init-lesson', title: 'Welcome to the Course', type: 'video', videoUrl: '', attachments: [] }]
    }
  ]);

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        setLoading(true);
        setSaveStatus('Loading course data...');
        try {
          const res = await api.get(`/courses/${courseId}`);
          const course = res.data.data;
          setCourseData(prev => ({
            ...prev,
            title: course.title || '',
            description: course.description || '',
            pricingType: course.price === 0 ? 'free' : 'paid',
            price: course.price ?? 0,
            discountPrice: course.discountPrice || 0,
            // Backend may populate category/subcategory into objects; the form expects ObjectId strings.
            category: course.category?._id || course.category || '',
            subcategory: course.subcategory?._id || course.subcategory || '',
            topics: course.topics || [],
            difficulty: course.difficulty || 'beginner',
            thumbnail: course.thumbnail || '',
            subtitle: course.subtitle || '',
            tagline: course.tagline || '',
            whatYouWillLearn: course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn : [''],
            requirements: course.requirements?.length > 0 ? course.requirements : [''],
            targetAudience: course.targetAudience?.length > 0 ? course.targetAudience : [''],
            language: course.language || 'English',
            status: course.status || 'draft',
            feedback: course.feedback || '',
            feedbackHistory: course.feedbackHistory || []
          }));
          
          if (course.modules && course.modules.length > 0) {
            setModules(course.modules.map(m => ({
              id: m._id,
              title: m.title,
              attachments: m.attachments || [],
              lessons: (m.lessons || []).map(l => ({
                id: l._id,
                title: l.title,
                type: l.type || 'video',
                videoUrl: l.videoUrl || '',
                videoPublicId: l.videoPublicId || '',
                videoAccessType: l.videoAccessType || 'upload',
                duration: l.duration || 0,
                isFree: l.isFree || false,
                readingContent: l.readingContent || '',
                readingMinutes: l.readingMinutes || 4,
                notes: l.notes || '',
                downloads: l.downloads || [],
                assignment: l.assignment || undefined,
                attachments: l.attachments || []
              })),
              quizzes: (m.quizzes || []).map(q => ({
                id: q._id,
                title: q.title,
                description: q.description,
                randomize: q.randomize,
                questions: q.questions || []
              }))
            })));
          }
          setSaveStatus('');
        } catch (err) {
          console.error('Failed to fetch course:', err);
          setSaveStatus('Error loading course data');
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
    fetchCategories();
  }, [courseId]);

  const fetchCategories = async () => {
    try {
        const res = await api.get('/categories');
        setCategories(res.data.data.filter(c => !c.parentId));
        setSubcategories(res.data.data.filter(c => c.parentId));
    } catch (err) {
        console.error('Failed to fetch categories:', err);
    }
  };

  const handleUpload = (moduleId, lessonId, type = 'video') => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dtadnrc7n',
        apiKey: '116434844277175',
        uploadSignature: async (callback, params_to_sign) => {
          try {
            const res = await api.post('/courses/upload-signature', { paramsToSign: params_to_sign });
            callback(res.data.data.signature);
          } catch (err) {
            console.error('Signature fetch failed:', err);
          }
        },
        uploadPreset: 'ml_default',
        // Use Cloudinary's public 'upload' delivery for videos. The previous 'authenticated'
        // mode required signed URLs that don't work without auth_token, causing 404s.
        // Course access is still gated by the backend (only enrolled users get the URL).
        type: 'upload',
        resourceType: type === 'thumbnail' ? 'image' : (type === 'attachment' ? 'auto' : 'video'),
        maxVideoFileSize: 3221225472, // 3 GB in bytes
        chunkSize: 10000000, // Balanced: 10 MB chunk size for compatibility and speed
        clientAllowedFormats: type === 'video' ? ['mp4', 'mov', 'avi', 'mkv'] : undefined,
        sources: ['local', 'url', 'camera'],
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
        }
        if (!error && result && result.event === "success") {
          const url = result.info.secure_url;
          const publicId = result.info.public_id;
          const originalName = result.info.original_filename || 'Attachment';

          if (type === 'thumbnail') {
            setCourseData(prev => ({ ...prev, thumbnail: url }));
          } else if (type === 'attachment') {
            setModules(prev => prev.map(mod =>
              mod.id === moduleId
              ? { ...mod, lessons: mod.lessons.map(l =>
                  l.id === lessonId
                  ? { ...l, attachments: [...(l.attachments || []), { name: originalName, url }] }
                  : l) }
              : mod
            ));
          } else if (type === 'moduleAttachment') {
            // Module-level PDF/notes: attached directly to the module, not a specific lesson.
            setModules(prev => prev.map(mod =>
              mod.id === moduleId
              ? { ...mod, attachments: [...(mod.attachments || []), { name: originalName, url }] }
              : mod
            ));
          } else {
            setModules(prev => prev.map(mod =>
              mod.id === moduleId
              ? { ...mod, lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, videoUrl: url, videoPublicId: publicId, videoAccessType: 'upload' } : l) }
              : mod
            ));
          }
        }
      }
    );
    widget.open();
  };

  const handleSaveCourse = async (statusArg = 'draft') => {
    // Allow editing at any stage. If a course is under review and the user is just saving
    // changes (not explicitly resubmitting), drop it back to draft so the admin reviews
    // the latest version rather than a stale snapshot.
    let status = statusArg;
    if (courseData.status === 'pending' && statusArg !== 'pending') {
        status = 'draft';
    }

    // Mandatory-field validation. Drafts allow partial saves so instructors can return later;
    // anything beyond draft (Submit for Review / Publish) requires every required field.
    if (status !== 'draft') {
        const missing = [];
        if (!courseData.title?.trim())       missing.push('Course Title');
        if (!courseData.description?.trim()) missing.push('Course Description');
        if (!courseData.category)            missing.push('Category');

        // Subcategory is required whenever the selected category actually exposes any.
        // (Some top-level categories may have no children — we don't block in that case.)
        const subOptions = subcategories.filter(s => (s.parentId?._id || s.parentId) === courseData.category);
        if (subOptions.length > 0 && !courseData.subcategory) missing.push('Subcategory');

        if (!courseData.difficulty)          missing.push('Level');
        if (!courseData.pricingType)         missing.push('Pricing Strategy');
        if (courseData.pricingType === 'paid' && !(Number(courseData.price) > 0)) {
            missing.push('Regular Price');
        }
        if (!modules || modules.length === 0 || (modules.length === 1 && (!modules[0].lessons || modules[0].lessons.length === 0))) {
            missing.push('At least one module with a lesson');
        }
        if (missing.length > 0) {
            setSaveStatus(`Please complete: ${missing.join(', ')}`);
            return;
        }
    }

    setLoading(true);
    setSaveStatus('Saving everything...');
    try {
      let currentCourseId = courseId;

      // 1. Create Course if it doesn't exist to get an ID
      if (!currentCourseId) {
        setSaveStatus('Initializing course...');
        const sanitizedData = {
          ...courseData,
          price: courseData.pricingType === 'free' ? 0 : (Number(courseData.price) || 0),
          discountPrice: courseData.pricingType === 'free' ? 0 : (Number(courseData.discountPrice) || 0),
          thumbnail: courseData.thumbnail || undefined,
          status
        };
        const courseRes = await api.post('/courses', sanitizedData);
        currentCourseId = courseRes.data.data._id;
      }

      // 2. Use Bulk Sync for Modules, Lessons, and Quizzes
      setSaveStatus('Syncing all content...');
      const syncPayload = {
        ...courseData,
        price: courseData.pricingType === 'free' ? 0 : (Number(courseData.price) || 0),
        discountPrice: courseData.pricingType === 'free' ? 0 : (Number(courseData.discountPrice) || 0),
        status,
        modules: modules.map(mod => ({
          ...mod,
          lessons: mod.lessons.map(lesson => {
            // Only force a placeholder URL for video lessons that haven't been filled yet.
            // Reading/assignment lessons must NOT carry a video URL — the schema rejects it.
            const out = { ...lesson };
            if (lesson.type === 'video') {
              out.videoUrl = lesson.videoUrl || 'https://placeholder.com/video';
            } else {
              delete out.videoUrl;
              delete out.videoPublicId;
              delete out.videoAccessType;
            }
            return out;
          })
        }))
      };

      await api.put(`/courses/${currentCourseId}/bulk-sync`, syncPayload);

      setSaveStatus('All changes saved! Redirecting...');
      setTimeout(() => router.push('/dashboard/instructor'), 2000);
    } catch (err) {
      console.error('Failed to save course:', err);
      const errorMsg = err.response?.data?.message || 'Error saving. Please check all fields.';
      setSaveStatus(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setModules([...modules, {
      id: Date.now().toString(),
      title: `Module ${modules.length + 1}`,
      lessons: [],
      quizzes: [],
      attachments: []
    }]);
  };

  // Auto-number title per type within a module so adding multiple of the same kind
  // gives "Reading 1", "Reading 2", "Reading 3" instead of three identical titles.
  // We look at every existing item in the module (lessons + quizzes) and pick the
  // next free number for that type.
  const buildLessonTitle = (mod, type) => {
    const baseLabel = type === 'reading' ? 'Reading'
                    : type === 'assignment' ? 'Assignment'
                    : 'Video Lesson';
    const existing = (mod?.lessons || []).filter(l => (l.type || 'video') === type).length;
    return `${baseLabel} ${existing + 1}`;
  };

  const buildQuizTitle = (mod) => {
    const existing = (mod?.quizzes || []).length;
    return `Quiz ${existing + 1}`;
  };

  const addLesson = (moduleId, type = 'video') => {
    const targetMod = modules.find(m => m.id === moduleId);
    const baseLesson = {
      id: Date.now().toString(),
      title: buildLessonTitle(targetMod, type),
      type,
      videoUrl: '',
      readingContent: type === 'reading' ? '' : undefined,
      readingMinutes: type === 'reading' ? 4 : undefined,
      notes: '',
      downloads: [],
      attachments: [],
      assignment: type === 'assignment'
        ? { instructions: '', questions: [], maxAttempts: 5, passingScore: 50 }
        : undefined
    };
    setModules(prev => prev.map(mod =>
      mod.id === moduleId ? { ...mod, lessons: [...mod.lessons, baseLesson] } : mod
    ));
    // Open the editor immediately so the instructor can fill in content.
    setEditingLesson({ modId: moduleId, lessonId: baseLesson.id });
  };

  const handleLessonSave = (updatedLesson) => {
    setModules(prev => prev.map(mod =>
      mod.id === editingLesson.modId
        ? { ...mod, lessons: mod.lessons.map(l => l.id === editingLesson.lessonId ? { ...l, ...updatedLesson } : l) }
        : mod
    ));
    setEditingLesson(null);
  };

  // Cloudinary helper that fits the LessonEditor callback signature.
  // The editor passes a callback: (url, publicIdOrName) => void
  const triggerLessonUpload = (kind) => (cb) => {
    if (typeof window === 'undefined' || !window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dtadnrc7n',
        apiKey: '116434844277175',
        uploadSignature: async (callback, params_to_sign) => {
          try {
            const res = await api.post('/courses/upload-signature', { paramsToSign: params_to_sign });
            callback(res.data.data.signature);
          } catch (err) { console.error('Signature fetch failed:', err); }
        },
        uploadPreset: 'ml_default',
        type: 'upload',
        resourceType: kind === 'video' ? 'video' : 'auto',
        maxVideoFileSize: 3221225472,
        chunkSize: 10000000,
        sources: ['local', 'url'],
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          const url = result.info.secure_url;
          const publicId = result.info.public_id;
          const originalName = result.info.original_filename || 'Resource';
          cb(url, kind === 'video' ? publicId : originalName);
        }
      }
    );
    widget.open();
  };

  const deleteModule = async (modId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    
    const isNew = modId.length < 20; // Simplified check
    if (!isNew && courseId) {
      try {
        await api.delete(`/courses/${courseId}/modules/${modId}`);
      } catch (err) {
        console.error('Delete module failed:', err);
      }
    }
    setModules(modules.filter(m => m.id !== modId));
  };

  const handleQuizUpdate = (quizData) => {
    setModules(prev => prev.map(m => 
      m.id === editingQuiz.modId 
      ? { ...m, quizzes: m.quizzes.map(q => q.id === editingQuiz.quizId ? quizData : q) } 
      : m
    ));
    setEditingQuiz(null);
  };

  const deleteLesson = async (modId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;

    const isNew = lessonId.length < 20;
    if (!isNew) {
      try {
        const mod = modules.find(m => m.id === modId);
        const mongoModId = mod.id; 
        await api.delete(`/modules/${mongoModId}/lessons/${lessonId}`);
      } catch (err) {
        console.error('Delete lesson failed:', err);
      }
    }
    setModules(modules.map(m => 
      m.id === modId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
    ));
  };

  const deleteQuiz = async (modId, quizId) => {
    if (!window.confirm('Delete this quiz?')) return;

    const isNew = quizId.length < 20;
    if (!isNew) {
      try {
        await api.delete(`/quizzes/${quizId}`);
      } catch (err) {
        console.error('Delete quiz failed:', err);
      }
    }
    setModules(modules.map(m => 
      m.id === modId ? { ...m, quizzes: m.quizzes.filter(q => q.id !== quizId) } : m
    ));
  };

  const removeAttachment = (modId, lessonId, attachmentUrl) => {
    setModules(prev => prev.map(m =>
      m.id === modId
      ? { ...m, lessons: m.lessons.map(l =>
          l.id === lessonId
          ? { ...l, attachments: (l.attachments || []).filter(a => a.url !== attachmentUrl) }
          : l) }
      : m
    ));
  };

  const removeModuleAttachment = (modId, attachmentUrl) => {
    setModules(prev => prev.map(m =>
      m.id === modId
      ? { ...m, attachments: (m.attachments || []).filter(a => a.url !== attachmentUrl) }
      : m
    ));
  };

  return (
    <DashboardLayout>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="afterInteractive" />
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Instructor Studio</h1>
            <p className="text-slate-500 font-medium mt-1">Build and manage your professional learning content.</p>
          </div>
          <div className="flex items-center gap-4">
            {saveStatus && (
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 animate-pulse">
                  {saveStatus.includes('Error') ? <AlertCircle size={14} className="text-rose-500" /> : <Loader2 size={14} className="animate-spin text-[#071739]" />}
                  {saveStatus}
               </div>
            )}
            <div className="flex gap-3">
              <div className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2",
                courseData.status === 'pending' ? "bg-orange-500 text-white border-orange-400" :
                courseData.status === 'published' ? "bg-emerald-500 text-white border-emerald-400" :
                courseData.status === 'rejected' ? "bg-rose-500 text-white border-rose-400" :
                courseData.status === 'needs changes' ? "bg-amber-500 text-white border-amber-400" : "bg-slate-100 text-slate-500 border-slate-200"
              )}>
                {courseData.status === 'pending' && <Lock size={12} className="animate-pulse" />}
                {courseData.status}
              </div>
              
              {/* Save Changes is always available so instructors can keep iterating, even on pending or published courses */}
              <button
                onClick={() => handleSaveCourse(courseId ? (courseData.status === 'pending' ? 'draft' : courseData.status) : 'draft')}
                disabled={loading}
                className="px-6 py-3 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {courseId ? 'Save Changes' : 'Save Draft'}
              </button>
              {courseData.status !== 'published' && (
                  <button
                    onClick={() => handleSaveCourse('pending')}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#071739] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 group disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (courseData.status === 'pending' ? 'Resubmit for Review' : 'Submit for Review')}
                    {!loading && <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />}
                  </button>
              )}
            </div>
          </div>
        </div>

        {courseData.status === 'needs changes' && courseData.feedback && (
            <Card className="p-6 bg-amber-50 border-amber-100 flex items-start gap-4">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className="font-black text-amber-900 text-sm uppercase tracking-widest">Admin Revision Notes</h4>
                    <p className="text-sm font-medium text-amber-800 mt-1 leading-relaxed">
                        {courseData.feedback}
                    </p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase mt-4">Please address these issues and resubmit for final approval.</p>
                </div>
            </Card>
        )}

        {courseData.status === 'rejected' && courseData.feedback && (
            <Card className="p-6 bg-rose-50 border-rose-100 flex items-start gap-4">
                <div className="p-2 bg-rose-500 text-white rounded-xl">
                    <Trash2 size={20} />
                </div>
                <div>
                    <h4 className="font-black text-rose-900 text-sm uppercase tracking-widest">Rejection Reason</h4>
                    <p className="text-sm font-medium text-rose-800 mt-1 leading-relaxed">
                        {courseData.feedback}
                    </p>
                </div>
            </Card>
        )}

        {/* Full Feedback History for Instructor */}
        {courseData.feedbackHistory?.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Admin Feedback History</h3>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courseData.feedbackHistory.slice().reverse().map((f, i) => (
                        <Card key={i} className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                        f.statusAtTime === 'published' ? "bg-emerald-50 text-emerald-600" :
                                        f.statusAtTime === 'rejected' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {f.statusAtTime}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(f.date).toLocaleString()}</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic mb-4">"{f.content}"</p>
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                <div className="w-6 h-6 rounded-full bg-[#071739] flex items-center justify-center text-[10px] font-bold text-white">
                                    {f.admin?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.admin?.name || 'Administrative Reviewer'}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
               <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
                 <h3 className="font-bold text-slate-900 text-xl flex items-center gap-3">
                   <span className="w-8 h-8 rounded-full bg-slate-100 text-[#071739] flex items-center justify-center text-xs">1</span>
                   Basic Information
                 </h3>
                 <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                   Fields marked <span className="text-rose-500">*</span> are required
                 </p>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Course Title <span className="text-rose-500" aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courseData.title}
                      onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                      placeholder="e.g. Mastering Digital Typography"
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Course Description <span className="text-rose-500" aria-label="required">*</span>
                    </label>
                    <textarea
                      required
                      value={courseData.description}
                      onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                      placeholder="Detailed course description..."
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-600 min-h-[120px] outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Course Subtitle</label>
                    <input 
                      type="text" 
                      value={courseData.subtitle}
                      onChange={(e) => setCourseData({...courseData, subtitle: e.target.value})}
                      placeholder="e.g. A comprehensive guide to modern UI design"
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Course Tagline</label>
                    <input 
                      type="text" 
                      value={courseData.tagline}
                      onChange={(e) => setCourseData({...courseData, tagline: e.target.value})}
                      placeholder="e.g. Master the art of UI in 30 days"
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Category <span className="text-rose-500" aria-label="required">*</span>
                      </label>
                      <select
                        value={courseData.category}
                        onChange={(e) => setCourseData({...courseData, category: e.target.value, subcategory: ''})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Subcategory <span className="text-rose-500" aria-label="required">*</span>
                      </label>
                      <select
                        value={courseData.subcategory}
                        onChange={(e) => setCourseData({...courseData, subcategory: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 appearance-none disabled:opacity-50"
                        disabled={!courseData.category}
                        required
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories
                            .filter(sub => sub.parentId === courseData.category)
                            .map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Level <span className="text-rose-500" aria-label="required">*</span>
                      </label>
                      <select
                        value={courseData.difficulty}
                        onChange={(e) => setCourseData({...courseData, difficulty: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 appearance-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Language</label>
                      <input 
                        type="text" 
                        value={courseData.language}
                        onChange={(e) => setCourseData({...courseData, language: e.target.value})}
                        placeholder="e.g. English"
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">What students will learn</label>
                        <button 
                            type="button"
                            onClick={() => setCourseData({...courseData, whatYouWillLearn: [...courseData.whatYouWillLearn, '']})}
                            className="text-[10px] font-black text-[#071739] uppercase"
                        >+ Add Single Point</button>
                    </div>
                    <div className="mb-4">
                        <textarea 
                            value={courseData.bulkLearn}
                            onChange={(e) => setCourseData({...courseData, bulkLearn: e.target.value})}
                            placeholder="Bulk Add: Paste multiple points here (one per line)..."
                            className="w-full bg-slate-50 border-dashed border-2 border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-500 min-h-[80px] outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                        />
                        <button 
                            type="button"
                            onClick={() => {
                                const points = courseData.bulkLearn.split('\n').map(p => p.trim()).filter(p => p);
                                if (points.length > 0) {
                                    setCourseData({
                                        ...courseData, 
                                        whatYouWillLearn: [...courseData.whatYouWillLearn.filter(p => p), ...points],
                                        bulkLearn: ''
                                    });
                                }
                            }}
                            className="mt-2 text-[10px] font-black bg-[#071739] text-white px-4 py-2 rounded-lg uppercase tracking-widest hover:opacity-90 transition-all"
                        >Import Points</button>
                    </div>
                    <div className="space-y-3">
                        {courseData.whatYouWillLearn.map((point, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    type="text"
                                    value={point}
                                    onChange={(e) => {
                                        const newLearn = [...courseData.whatYouWillLearn];
                                        newLearn[idx] = e.target.value;
                                        setCourseData({...courseData, whatYouWillLearn: newLearn});
                                    }}
                                    placeholder="e.g. Master the basics of Figma"
                                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                                />
                                {courseData.whatYouWillLearn.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => setCourseData({...courseData, whatYouWillLearn: courseData.whatYouWillLearn.filter((_, i) => i !== idx)})}
                                        className="text-slate-300 hover:text-rose-500"
                                    ><Trash2 size={16} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Requirements</label>
                        <button 
                            type="button"
                            onClick={() => setCourseData({...courseData, requirements: [...courseData.requirements, '']})}
                            className="text-[10px] font-black text-[#071739] uppercase"
                        >+ Add Single Requirement</button>
                    </div>
                    <div className="mb-4">
                        <textarea 
                            value={courseData.bulkReqs}
                            onChange={(e) => setCourseData({...courseData, bulkReqs: e.target.value})}
                            placeholder="Bulk Add: Paste multiple requirements here (one per line)..."
                            className="w-full bg-slate-50 border-dashed border-2 border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-500 min-h-[80px] outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                        />
                        <button 
                            type="button"
                            onClick={() => {
                                const reqs = courseData.bulkReqs.split('\n').map(r => r.trim()).filter(r => r);
                                if (reqs.length > 0) {
                                    setCourseData({
                                        ...courseData, 
                                        requirements: [...courseData.requirements.filter(r => r), ...reqs],
                                        bulkReqs: ''
                                    });
                                }
                            }}
                            className="mt-2 text-[10px] font-black bg-[#071739] text-white px-4 py-2 rounded-lg uppercase tracking-widest hover:opacity-90 transition-all"
                        >Import Requirements</button>
                    </div>
                    <div className="space-y-3">
                        {courseData.requirements.map((req, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => {
                                        const newReqs = [...courseData.requirements];
                                        newReqs[idx] = e.target.value;
                                        setCourseData({...courseData, requirements: newReqs});
                                    }}
                                    placeholder="e.g. Basic understanding of design principles"
                                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                                />
                                {courseData.requirements.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCourseData({...courseData, requirements: courseData.requirements.filter((_, i) => i !== idx)})}
                                        className="text-slate-300 hover:text-rose-500"
                                    ><Trash2 size={16} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Who This Course Is For — same pattern as learning outcomes / requirements */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Who This Course Is For</label>
                        <button
                            type="button"
                            onClick={() => setCourseData({...courseData, targetAudience: [...courseData.targetAudience, '']})}
                            className="text-[10px] font-black text-[#071739] uppercase"
                        >+ Add Audience Item</button>
                    </div>
                    <div className="mb-4">
                        <textarea
                            value={courseData.bulkAudience}
                            onChange={(e) => setCourseData({...courseData, bulkAudience: e.target.value})}
                            placeholder="Bulk Add: Paste audience descriptions here (one per line)..."
                            className="w-full bg-slate-50 border-dashed border-2 border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-500 min-h-[80px] outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const items = courseData.bulkAudience.split('\n').map(r => r.trim()).filter(r => r);
                                if (items.length > 0) {
                                    setCourseData({
                                        ...courseData,
                                        targetAudience: [...courseData.targetAudience.filter(r => r), ...items],
                                        bulkAudience: ''
                                    });
                                }
                            }}
                            className="mt-2 text-[10px] font-black bg-[#071739] text-white px-4 py-2 rounded-lg uppercase tracking-widest hover:opacity-90 transition-all"
                        >Import Audience</button>
                    </div>
                    <div className="space-y-3">
                        {courseData.targetAudience.map((aud, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    value={aud}
                                    onChange={(e) => {
                                        const next = [...courseData.targetAudience];
                                        next[idx] = e.target.value;
                                        setCourseData({...courseData, targetAudience: next});
                                    }}
                                    placeholder="e.g. Beginners curious about Python; career switchers; product managers"
                                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all"
                                />
                                {courseData.targetAudience.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCourseData({...courseData, targetAudience: courseData.targetAudience.filter((_, i) => i !== idx)})}
                                        className="text-slate-300 hover:text-rose-500"
                                    ><Trash2 size={16} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                          Pricing Strategy <span className="text-rose-500" aria-label="required">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <button 
                                type="button"
                                onClick={() => setCourseData({...courseData, pricingType: 'free'})}
                                className={clsx(
                                    "flex-1 py-4 rounded-2xl font-bold text-sm transition-all border-2 flex flex-col items-center gap-1",
                                    courseData.pricingType === 'free' ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                <span>Free Course</span>
                                <span className="text-[10px] font-medium opacity-80">Students can access all videos instantly</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCourseData({...courseData, pricingType: 'paid'})}
                                className={clsx(
                                    "flex-1 py-4 rounded-2xl font-bold text-sm transition-all border-2 flex flex-col items-center gap-1",
                                    courseData.pricingType === 'paid' ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                <span>Paid Course</span>
                                <span className="text-[10px] font-medium opacity-80">Requires one-time payment to unlock</span>
                            </button>
                        </div>
                    </div>

                    {courseData.pricingType === 'paid' && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                  Regular Price (INR) <span className="text-rose-500" aria-label="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={courseData.price}
                                    onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                                    placeholder="e.g. 1999"
                                    className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all shadow-sm"
                                />
                                </div>
                                <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Final Discounted Price (INR)</label>
                                <input 
                                    type="number" 
                                    value={courseData.discountPrice}
                                    onChange={(e) => setCourseData({...courseData, discountPrice: e.target.value})}
                                    placeholder="e.g. 499"
                                    className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all shadow-sm"
                                />
                                </div>
                            </div>
                            
                            {Number(courseData.price) > 0 && Number(courseData.discountPrice) >= 0 && Number(courseData.price) > Number(courseData.discountPrice) && (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl text-sm font-bold">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    You are offering a {Math.round(((Number(courseData.price) - Number(courseData.discountPrice)) / Number(courseData.price)) * 100)}% discount!
                                </div>
                            )}
                        </div>
                    )}
                  </div>
               </div>
            </Card>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-xl flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-[#071739] flex items-center justify-center text-xs">2</span>
                    Curriculum Builder <span className="text-rose-500" aria-label="required">*</span>
                  </h3>
                  <button 
                    onClick={addModule}
                    className="flex items-center gap-2 text-[#071739] font-bold text-xs bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <Plus size={16} /> Add Module
                  </button>
               </div>

               <div className="space-y-6">
                  {modules.map((mod, mIdx) => (
                    <div key={mod.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm group">
                       <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-4 flex-1">
                             <GripVertical className="text-slate-300 cursor-move" size={20} />
                             <input
                                value={mod.title}
                                className="text-lg font-black text-slate-900 bg-transparent border-none outline-none focus:text-[#071739]"
                                onChange={(e) => {
                                  const nextModules = [...modules];
                                  nextModules[mIdx].title = e.target.value;
                                  setModules(nextModules);
                                }}
                             />
                          </div>
                          <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUpload(mod.id, null, 'moduleAttachment')}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-[#071739] border border-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                              >
                                <Paperclip size={12} /> Add PDF / Notes
                              </button>
                              <button
                                onClick={() => deleteModule(mod.id)}
                                className="text-slate-300 hover:text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>
                          </div>
                       </div>

                       {/* Module-level attachments */}
                       {mod.attachments && mod.attachments.length > 0 && (
                          <div className="mb-6 space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Resources</p>
                             {mod.attachments.map((att, aIdx) => (
                                <div key={aIdx} className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-xl">
                                   <div className="flex items-center gap-2 overflow-hidden flex-1">
                                      <FileText size={14} className="text-blue-600 flex-shrink-0" />
                                      <input
                                         value={att.name}
                                         onChange={(e) => {
                                            const nextModules = [...modules];
                                            nextModules[mIdx].attachments[aIdx].name = e.target.value;
                                            setModules(nextModules);
                                         }}
                                         className="text-[11px] font-bold text-slate-700 bg-transparent outline-none focus:text-[#071739] w-full"
                                         placeholder="Resource Name (e.g. Module Slides.pdf)"
                                      />
                                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View</a>
                                   </div>
                                   <button
                                      onClick={() => removeModuleAttachment(mod.id, att.url)}
                                      className="text-slate-300 hover:text-rose-500 ml-2"
                                   >
                                      <Trash2 size={12} />
                                   </button>
                                </div>
                             ))}
                          </div>
                       )}

                       <div className="space-y-3">
                          {/* Lessons Mapping */}
                          {mod.lessons.map((lesson, lIdx) => {
                            // Pick icon + colour by lesson type
                            const lessonMeta = lesson.type === 'reading'
                              ? { Icon: BookOpen, color: 'text-amber-600', label: 'Reading' }
                              : lesson.type === 'assignment'
                                ? { Icon: ClipboardList, color: 'text-emerald-600', label: 'Assignment' }
                                : { Icon: Video, color: 'text-[#071739]', label: 'Video' };
                            // "Filled in" means the type-specific content exists
                            const filled = lesson.type === 'video' ? !!lesson.videoUrl
                                          : lesson.type === 'reading' ? !!lesson.readingContent
                                          : (lesson.assignment?.questions?.length > 0);
                            return (
                             <div key={lesson.id} className="space-y-2">
                               {/* Whole row is clickable — opens the LessonEditor for this lesson.
                                   Title is still editable inline; we stop propagation on the input
                                   so editing the name doesn't also open the modal. */}
                               <div
                                 onClick={() => setEditingLesson({ modId: mod.id, lessonId: lesson.id })}
                                 className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-[#071739]/20 hover:bg-white transition-all group/lesson cursor-pointer"
                               >
                                 <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                      <lessonMeta.Icon size={16} className={lessonMeta.color} />
                                    </div>
                                    <input
                                      value={lesson.title}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        const nextModules = [...modules];
                                        nextModules[mIdx].lessons[lIdx].title = e.target.value;
                                        setModules(nextModules);
                                      }}
                                      className="text-xs font-bold text-slate-700 bg-transparent outline-none focus:text-[#071739] flex-1 min-w-0"
                                    />
                                    {filled && (
                                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1 shrink-0">
                                        <CheckCircle2 size={10} /> Ready
                                      </span>
                                    )}
                                 </div>
                                 <button
                                    onClick={(e) => { e.stopPropagation(); deleteLesson(mod.id, lesson.id); }}
                                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/lesson:opacity-100 transition-opacity shrink-0 ml-2"
                                    title="Delete lesson"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                               </div>
                               
                               {/* Attachments List */}
                               {lesson.attachments && lesson.attachments.length > 0 && (
                                 <div className="ml-12 space-y-2">
                                   {lesson.attachments.map((att, aIdx) => (
                                     <div key={aIdx} className="flex items-center justify-between px-4 py-2 bg-white border border-slate-100 rounded-xl">
                                       <div className="flex items-center gap-2 overflow-hidden flex-1">
                                         <Paperclip size={12} className="text-slate-400 flex-shrink-0" />
                                         <input
                                           value={att.name}
                                           onChange={(e) => {
                                             const nextModules = [...modules];
                                             nextModules[mIdx].lessons[lIdx].attachments[aIdx].name = e.target.value;
                                             setModules(nextModules);
                                           }}
                                           className="text-[10px] font-bold text-slate-600 bg-transparent outline-none focus:text-[#071739] w-full"
                                           placeholder="Resource Name (e.g. Lesson Notes.pdf)"
                                         />
                                         <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline whitespace-nowrap">View</a>
                                       </div>
                                       <button
                                         onClick={() => removeAttachment(mod.id, lesson.id, att.url)}
                                         className="text-slate-300 hover:text-rose-500 ml-2"
                                       >
                                         <Trash2 size={12} />
                                       </button>
                                     </div>
                                   ))}
                                 </div>
                               )}
                             </div>
                            );
                          })}

                          {/* Quizzes Mapping */}
                          {mod.quizzes && mod.quizzes.map((quiz, qIdx) => (
                            <div key={quiz.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-transparent hover:border-amber-100 transition-all group/quiz">
                               <div className="flex items-center gap-4">
                                  <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <HelpCircle size={16} className="text-amber-600" />
                                  </div>
                                  <input 
                                    value={quiz.title} 
                                    onChange={(e) => {
                                      const nextModules = [...modules];
                                      nextModules[mIdx].quizzes[qIdx].title = e.target.value;
                                      setModules(nextModules);
                                    }}
                                    className="text-xs font-bold text-slate-700 bg-transparent outline-none focus:text-amber-600 w-64"
                                  />
                               </div>
                               <div className="flex items-center gap-3 opacity-0 group-hover/quiz:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => setEditingQuiz({ modId: mod.id, quizId: quiz.id, data: quiz })}
                                    className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-700"
                                  >
                                    Manage Quiz ({quiz.questions?.length || 0})
                                  </button>
                                  <button 
                                    onClick={() => deleteQuiz(mod.id, quiz.id)}
                                    className="text-slate-300 hover:text-red-500"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                               </div>
                            </div>
                          ))}

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                             <button
                                onClick={() => addLesson(mod.id, 'video')}
                                className="py-3 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#071739]/30 hover:text-[#071739] transition-all flex items-center justify-center gap-2"
                             >
                                <Video size={12} /> Video
                             </button>
                             <button
                                onClick={() => addLesson(mod.id, 'reading')}
                                className="py-3 border-2 border-dashed border-amber-100 rounded-2xl text-[10px] font-black text-amber-400 uppercase tracking-widest hover:border-amber-300 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
                             >
                                <BookOpen size={12} /> Reading
                             </button>
                             <button
                                onClick={() => addLesson(mod.id, 'assignment')}
                                className="py-3 border-2 border-dashed border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                             >
                                <ClipboardList size={12} /> Assignment
                             </button>
                             <button
                                onClick={() => {
                                   const nextModules = [...modules];
                                   const newQuiz = {
                                     id: Date.now().toString(),
                                     title: buildQuizTitle(nextModules[mIdx]),
                                     questions: [],
                                     randomize: true
                                   };
                                   if (!nextModules[mIdx].quizzes) nextModules[mIdx].quizzes = [];
                                   nextModules[mIdx].quizzes.push(newQuiz);
                                   setModules(nextModules);
                                }}
                                className="py-3 border-2 border-dashed border-blue-100 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                             >
                                <HelpCircle size={12} /> Quiz
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-8">
             {/* Quiz Editor Modal */}
             {editingQuiz && (
               <QuizEditor
                  quiz={editingQuiz.data}
                  onSave={handleQuizUpdate}
                  onClose={() => setEditingQuiz(null)}
               />
             )}

             {/* Lesson Editor Modal */}
             {editingLesson && (() => {
                const mod = modules.find(m => m.id === editingLesson.modId);
                const lesson = mod?.lessons.find(l => l.id === editingLesson.lessonId);
                if (!lesson) return null;
                return (
                  <LessonEditor
                    lesson={lesson}
                    onClose={() => setEditingLesson(null)}
                    onSave={handleLessonSave}
                    onUploadVideo={triggerLessonUpload('video')}
                    onUploadDownload={triggerLessonUpload('attachment')}
                    onUploadAttachment={triggerLessonUpload('attachment')}
                  />
                );
             })()}

             <Card className="p-8">
                <h4 className="font-bold text-slate-900 text-sm mb-6">Course Preview</h4>
                <div 
                   onClick={() => handleUpload(null, null, 'thumbnail')}
                   className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative group cursor-pointer"
                >
                   {courseData.thumbnail ? (
                      <img src={courseData.thumbnail} className="w-full h-full object-cover" alt="Thumbnail" />
                   ) : (
                      <div className="text-center">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                           <Plus className="text-slate-400" size={24} />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase">Thumbnail</p>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-black text-xs uppercase tracking-widest">Change Image</p>
                   </div>
                </div>
                <div className="mt-6 space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Duration</span>
                      <span className="text-slate-900 font-black">0h 0m</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Video Count</span>
                      <span className="text-slate-900 font-black">{modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</span>
                   </div>
                </div>
             </Card>

             <Card className="p-8 bg-slate-900 text-white !rounded-[2.5rem]">
                <h4 className="font-bold uppercase text-[10px] tracking-widest text-blue-400 mb-6">Expert Tips</h4>
                <ul className="space-y-4">
                   <li className="flex gap-3 text-xs font-medium text-slate-300 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      Use high-quality 1080p videos for better student engagement.
                   </li>
                   <li className="flex gap-3 text-xs font-medium text-slate-300 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      Keep modules focused on a single learning objective.
                   </li>
                </ul>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
