'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import StudentDashboard from '../StudentDashboard';

export default function StudentPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                const userData = res.data.data;
                const role = userData.role.toLowerCase();
                
                if (role !== 'student') {
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
        <DashboardLayout>
            <StudentDashboard user={user} />
        </DashboardLayout>
    );
}
