'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';

export default function ParentPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                const userData = res.data.data;
                if (userData.role !== 'parent') {
                    router.push('/dashboard/' + userData.role);
                } else {
                    setUser(userData);
                }
            } catch (err) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    if (loading) return null;
    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900">Parent Dashboard</h2>
                <p className="text-slate-500 max-w-md mx-auto font-medium">Monitoring linked student accounts for performance and safety analytics.</p>
                <button className="btn-primary">Link a Student Account</button>
            </div>
        </DashboardLayout>
    );
}
