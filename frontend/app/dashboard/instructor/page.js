'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import InstructorDashboard from '../InstructorDashboard';
import { useAuthStore } from '@/store/useAuthStore';

export default function InstructorPage() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            if (user?.role !== 'instructor') {
                router.push('/dashboard/' + user?.role);
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || user?.role !== 'instructor') return null;

    return (
        <DashboardLayout>
            <InstructorDashboard user={user} />
        </DashboardLayout>
    );
}
