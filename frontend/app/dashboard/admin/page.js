'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminPage() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            
            const role = user?.role?.toLowerCase();
            if (role !== 'admin' && role !== 'super-admin') {
                router.push('/dashboard/' + role);
            } else {
                router.push('/dashboard/admin/analytics');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    return null;
}
