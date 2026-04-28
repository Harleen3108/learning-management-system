import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from './Topbar';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

    // Removed redundant checkAuth call, handled by AuthInitializer
    useEffect(() => {
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'admin' && user?.role !== 'super-admin') {
                router.push('/dashboard/student');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#A68868] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super-admin')) {
        return null;
    }

    return (
        <div className="bg-slate-50/50 min-h-screen">
            {/* Unified Topbar with Admin Links */}
            <Topbar />
            
            <div className="flex flex-col pt-4">
                {/* Main Content */}
                <main className="p-4 lg:p-8 flex-1 max-w-screen-2xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

