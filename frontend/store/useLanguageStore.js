import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'English',
      
      setLanguage: (lang) => set({ language: lang }),
      
      languages: [
        { name: 'English', native: 'English', code: 'en' },
        { name: 'Hindi', native: 'हिन्दी', code: 'hi' },
        { name: 'Tamil', native: 'தமிழ்', code: 'ta' },
        { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', code: 'pa' },
        { name: 'Chinese', native: '中文', code: 'zh' }
      ]
    }),
    {
      name: 'lms-language-storage',
    }
  )
);
