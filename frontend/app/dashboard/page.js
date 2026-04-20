'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        const redirectByRole = async () => {
            try {
                const res = await api.get('/auth/me');
                let role = res.data.data.role.toLowerCase();
                
                console.log('Dashboard redirect, detected role:', role);
                
                if (role === 'super-admin') role = 'admin';
                router.push(`/dashboard/${role}`);
            } catch (err) {
                router.push('/login');
            }
        };
        redirectByRole();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Routing to your workspace...</p>
            </div>
        </div>
    );
}
