'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardRedirect() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            
            let role = user?.role?.toLowerCase() || 'student';
            if (role === 'super-admin') role = 'admin';
            router.push(`/dashboard/${role}`);
        }
    }, [isLoading, isAuthenticated, user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Routing to your workspace...</p>
            </div>
        </div>
    );
}
