'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function MyCoursesRedirect() {
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        const role = user?.role?.toLowerCase() || 'student';
        
        if (role === 'instructor') {
          router.replace('/dashboard/instructor');
        } else if (role === 'admin' || role === 'super-admin') {
          router.replace('/dashboard/admin/courses');
        } else {
          router.replace('/dashboard/student');
        }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Routing your curriculum...</p>
      </div>
    </div>
  );
}
