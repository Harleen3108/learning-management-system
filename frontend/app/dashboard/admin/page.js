'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from '../AdminDashboard';

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                const userData = res.data.data;
                const role = userData.role.toLowerCase();
                
                if (role !== 'admin' && role !== 'super-admin') {
                    router.push('/dashboard/' + role);
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
        <AdminLayout>
            <AdminDashboard user={user} />
        </AdminLayout>
    );
}
