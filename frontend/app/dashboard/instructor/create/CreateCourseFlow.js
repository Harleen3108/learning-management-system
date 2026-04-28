'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  FileText, 
  ChevronLeft, 
  X,
  Loader2
} from 'lucide-react';
import api from '@/services/api';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function CreateCourseFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    type: 'course', // 'course' or 'practice-test'
    title: '',
    category: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data.filter(c => !c.parentId));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleComplete = () => {
    onComplete(formData);
  };

  const isNextDisabled = () => {
    if (step === 2) return formData.title.trim().length === 0;
    if (step === 3) return !formData.category;
    return false;
  };

  const steps = [
    { id: 1, title: "Course Type" },
    { id: 2, title: "Course Title" },
    { id: 3, title: "Category" },
    { id: 4, title: "Finishing" }
  ];

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col font-inter">
      {/* Header */}
      <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white relative">
        <div className="flex items-center gap-4">
           <span className="text-xl font-bold text-[#071739] tracking-tighter">EduFlow</span>
           <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
           <span className="text-sm font-semibold text-slate-500">Step {step} of 3</span>
        </div>
        
        <Link href="/dashboard/instructor" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Exit
        </Link>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 w-full">
           <motion.div 
             className="h-full bg-[#071739]"
             initial={{ width: '0%' }}
             animate={{ width: `${(step / 3) * 100}%` }}
             transition={{ duration: 0.5 }}
           />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-12"
              >
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">First, let's find out what type of course you're making.</h1>
                  <p className="text-slate-500 font-medium max-w-lg mx-auto">Select the format that best fits your content strategy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <button 
                    onClick={() => setFormData({...formData, type: 'course'})}
                    className={clsx(
                      "p-8 rounded-[2rem] border-2 transition-all group flex flex-col items-center text-center space-y-6",
                      formData.type === 'course' ? "border-[#071739] bg-slate-50" : "border-slate-100 hover:border-[#071739]/30 bg-white"
                    )}
                  >
                    <div className={clsx(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                      formData.type === 'course' ? "bg-[#071739] text-white shadow-xl shadow-slate-900/10" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-[#071739]"
                    )}>
                      <Video size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Course</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Create rich learning experiences with the help of video lectures, quizzes, and coding exercises.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setFormData({...formData, type: 'practice-test'})}
                    className={clsx(
                      "p-8 rounded-[2rem] border-2 transition-all group flex flex-col items-center text-center space-y-6",
                      formData.type === 'practice-test' ? "border-[#071739] bg-slate-50" : "border-slate-100 hover:border-[#071739]/30 bg-white"
                    )}
                  >
                    <div className={clsx(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                      formData.type === 'practice-test' ? "bg-[#071739] text-white shadow-xl shadow-slate-900/10" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-[#071739]"
                    )}>
                      <FileText size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Practice Test</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Help students prepare for certification exams by providing high-quality practice questions.</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-12"
              >
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">How about a working title?</h1>
                  <p className="text-slate-500 font-medium">It's ok if you can't think of a good title now. You can change it later.</p>
                </div>

                <div className="max-w-xl mx-auto relative group">
                  <input 
                    type="text"
                    autoFocus
                    placeholder="e.g. Learn Photoshop CS6 from Scratch"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    maxLength={60}
                    className="w-full bg-white border border-slate-200 rounded-none p-4 text-xl md:text-2xl font-semibold text-slate-900 outline-none focus:border-[#071739] transition-all text-center"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formData.title.length} / 60</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-12"
              >
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">What category best fits the knowledge you'll share?</h1>
                  <p className="text-slate-500 font-medium">If you're not sure about the right category, you can change it later.</p>
                </div>

                <div className="max-w-xl mx-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-12">
                      <Loader2 className="animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-none p-4 text-lg font-medium text-slate-900 outline-none focus:border-[#071739] transition-all appearance-none text-center cursor-pointer"
                    >
                      <option value="" disabled>Choose a category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-24 border-t border-slate-100 flex items-center justify-between px-8 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className={clsx(
            "px-8 py-3 rounded-none font-bold text-sm transition-all border border-slate-200",
            step === 1 ? "opacity-0 pointer-events-none" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          Previous
        </button>

        <button 
          onClick={step === 3 ? handleComplete : nextStep}
          disabled={isNextDisabled()}
          className={clsx(
            "px-10 py-3 rounded-none font-bold text-sm transition-all shadow-lg active:scale-95",
            isNextDisabled() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#071739] text-white hover:bg-[#020a1a] shadow-slate-900/10"
          )}
        >
          {step === 3 ? 'Finish' : 'Continue'}
        </button>
      </footer>
    </div>
  );
}
