'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { useLanguageStore } from '@/store/useLanguageStore';

export default function LanguageModal({ isOpen, onClose }) {
  const { language, setLanguage, languages } = useLanguageStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Choose a language</h2>
                  <p className="text-xs text-slate-500 font-medium">Select your preferred language for the platform.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Language Grid */}
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.name}
                    onClick={() => {
                      setLanguage(lang.name);
                      onClose();
                    }}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all group ${
                      language === lang.name 
                        ? 'border-[#071739] bg-[#071739]/5' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-sm font-bold ${
                      language === lang.name ? 'text-[#071739]' : 'text-slate-700'
                    }`}>
                      {lang.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium mt-1">
                      {lang.native}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium max-w-[300px]">
                    We're constantly adding more languages to make EduFlow accessible to everyone.
                </p>
                <button 
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#071739] text-white text-sm font-semibold rounded-xl hover:bg-[#020a1a] transition-all shadow-lg shadow-slate-900/10"
                >
                    Save Selection
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
