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
  HelpCircle
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import QuizEditor from './QuizEditor';

export default function InstructorStudio({ courseId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Design',
    difficulty: 'beginner',
    thumbnail: ''
  });

  const [editingQuiz, setEditingQuiz] = useState(null); // { modId: string, quizId: string, data: object }

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
          setCourseData({
            title: course.title,
            description: course.description,
            price: course.price,
            category: course.category,
            difficulty: course.difficulty,
            thumbnail: course.thumbnail
          });
          
          if (course.modules && course.modules.length > 0) {
            setModules(course.modules.map(m => ({
              id: m._id,
              title: m.title,
              lessons: m.lessons.map(l => ({
                id: l._id,
                title: l.title,
                type: 'video',
                videoUrl: l.videoUrl,
                videoPublicId: l.videoPublicId,
                attachments: l.attachments || []
              })),
              quizzes: m.quizzes.map(q => ({
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
  }, [courseId]);

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
        resourceType: type === 'thumbnail' ? 'image' : (type === 'attachment' ? 'auto' : 'video'),
        maxVideoFileSize: 3221225472, // 3 GB in bytes
        chunkSize: 6000000, // 6 MB chunk size
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
          } else {
            setModules(prev => prev.map(mod => 
              mod.id === moduleId 
              ? { ...mod, lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, videoUrl: url, videoPublicId: publicId } : l) }
              : mod
            ));
          }
        }
      }
    );
    widget.open();
  };

  const handleSaveCourse = async (status = 'draft') => {
    setLoading(true);
    setSaveStatus('Saving everything...');
    try {
      let currentCourseId = courseId;

      // 1. Create Course if it doesn't exist to get an ID
      if (!currentCourseId) {
        setSaveStatus('Initializing course...');
        const sanitizedData = {
          ...courseData,
          price: Number(courseData.price) || 0,
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
        price: Number(courseData.price) || 0,
        status,
        modules: modules.map(mod => ({
          ...mod,
          lessons: mod.lessons.map(lesson => ({
            ...lesson,
            videoUrl: lesson.videoUrl || 'https://placeholder.com/video'
          }))
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
    setModules([...modules, { id: Date.now().toString(), title: 'New Module', lessons: [] }]);
  };

  const addLesson = (moduleId) => {
    setModules(modules.map(mod => 
      mod.id === moduleId 
      ? { ...mod, lessons: [...mod.lessons, { id: Date.now().toString(), title: 'New Lesson', type: 'video', videoUrl: '', attachments: [] }] }
      : mod
    ));
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
                  {saveStatus.includes('Error') ? <Trash2 size={14} className="text-rose-500" /> : <Loader2 size={14} className="animate-spin text-blue-600" />}
                  {saveStatus}
               </div>
            )}
            <div className="flex gap-3">
              <button 
                onClick={() => handleSaveCourse('draft')}
                disabled={loading}
                className="px-6 py-3 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Save Draft
              </button>
              <button 
                onClick={() => handleSaveCourse('pending')}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 group disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Publish Course'}
                {!loading && <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
               <h3 className="font-bold text-slate-900 text-xl mb-8 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">1</span>
                 Basic Information
               </h3>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Course Title</label>
                    <input 
                      type="text" 
                      value={courseData.title}
                      onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                      placeholder="e.g. Mastering Digital Typography"
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Course Description</label>
                    <textarea 
                      value={courseData.description}
                      onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                      placeholder="Tell students what they will learn..."
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-600 min-h-[120px] outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                      <select 
                        value={courseData.category}
                        onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 appearance-none"
                      >
                        <option>Design</option>
                        <option>Development</option>
                        <option>Business</option>
                        <option>Marketing</option>
                        <option>Music</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Difficulty</label>
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
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pricing (INR)</label>
                    <input 
                      type="number" 
                      value={courseData.price}
                      onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                      placeholder="0 for Free"
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
               </div>
            </Card>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-xl flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">2</span>
                    Curriculum Builder
                  </h3>
                  <button 
                    onClick={addModule}
                    className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all"
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
                                className="text-lg font-black text-slate-900 bg-transparent border-none outline-none focus:text-blue-600"
                                onChange={(e) => {
                                  const nextModules = [...modules];
                                  nextModules[mIdx].title = e.target.value;
                                  setModules(nextModules);
                                }}
                             />
                          </div>
                          <button 
                            onClick={() => deleteModule(mod.id)}
                            className="text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>

                       <div className="space-y-3">
                          {/* Lessons Mapping */}
                          {mod.lessons.map((lesson, lIdx) => (
                             <div key={lesson.id} className="space-y-2">
                               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group/lesson">
                                 <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                      {lesson.type === 'video' ? <Video size={16} className="text-blue-600" /> : <FileText size={16} className="text-slate-400" />}
                                    </div>
                                    <input 
                                      value={lesson.title} 
                                      onChange={(e) => {
                                        const nextModules = [...modules];
                                        nextModules[mIdx].lessons[lIdx].title = e.target.value;
                                        setModules(nextModules);
                                      }}
                                      className="text-xs font-bold text-slate-700 bg-transparent outline-none focus:text-blue-600 w-64"
                                    />
                                 </div>
                                 <div className="flex items-center gap-3 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => handleUpload(mod.id, lesson.id)}
                                      className={`text-[10px] font-black uppercase ${lesson.videoUrl ? 'text-emerald-500' : 'text-blue-600'}`}
                                    >
                                      {lesson.videoUrl ? 'Video Uploaded' : 'Upload Video'}
                                    </button>
                                    <button 
                                      onClick={() => handleUpload(mod.id, lesson.id, 'attachment')}
                                      className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600"
                                    >
                                      <Paperclip size={12} /> Add Resource
                                    </button>
                                    <button 
                                      onClick={() => deleteLesson(mod.id, lesson.id)}
                                      className="text-slate-300 hover:text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                 </div>
                               </div>
                               
                               {/* Attachments List */}
                               {lesson.attachments && lesson.attachments.length > 0 && (
                                 <div className="ml-12 space-y-2">
                                   {lesson.attachments.map((att, aIdx) => (
                                     <div key={aIdx} className="flex items-center justify-between px-4 py-2 bg-white border border-slate-100 rounded-xl">
                                       <div className="flex items-center gap-2 overflow-hidden">
                                         <Paperclip size={12} className="text-slate-400 flex-shrink-0" />
                                         <span className="text-[10px] font-bold text-slate-600 truncate max-w-[200px]">{att.name}</span>
                                       </div>
                                       <button 
                                         onClick={() => removeAttachment(mod.id, lesson.id, att.url)}
                                         className="text-slate-300 hover:text-rose-500"
                                       >
                                         <Trash2 size={12} />
                                       </button>
                                     </div>
                                   ))}
                                 </div>
                               )}
                             </div>
                          ))}

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

                          <div className="flex gap-3 pt-2">
                             <button 
                                onClick={() => addLesson(mod.id)}
                                className="flex-1 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-100 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                             >
                                <Plus size={14} /> Add Lesson
                             </button>
                             <button 
                                onClick={() => {
                                   const nextModules = [...modules];
                                   const newQuiz = { id: Date.now().toString(), title: 'New Quiz', questions: [], randomize: true };
                                   if (!nextModules[mIdx].quizzes) nextModules[mIdx].quizzes = [];
                                   nextModules[mIdx].quizzes.push(newQuiz);
                                   setModules(nextModules);
                                }}
                                className="flex-1 py-4 border-2 border-dashed border-amber-100 rounded-2xl text-[10px] font-black text-amber-400 uppercase tracking-widest hover:border-amber-200 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
                             >
                                <Plus size={14} /> Add Quiz
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
