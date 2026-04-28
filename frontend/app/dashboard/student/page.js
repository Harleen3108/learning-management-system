'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StudentDashboard from '../StudentDashboard';
import { useAuthStore } from '@/store/useAuthStore';

export default function StudentPage() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            
            const role = user?.role?.toLowerCase();
            if (role !== 'student') {
                router.push('/dashboard/' + role);
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || user?.role?.toLowerCase() !== 'student') return null;

    return (
        <DashboardLayout>
            <StudentDashboard user={user} />
        </DashboardLayout>
    );
}
