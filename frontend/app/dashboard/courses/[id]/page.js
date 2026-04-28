'use client';
import { useState, useEffect } from 'react';
import LearningPage from '../../LearningPage';
import AdminCourseView from '@/components/admin/AdminCourseView';
import InstructorCourseView from '@/components/instructor/InstructorCourseView';
import CourseLandingPage from '@/components/CourseLandingPage';
import api from '@/services/api';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function CourseDetailModule({ params }) {
    const [role, setRole] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('landing'); // 'landing' or 'learn'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, courseRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get(`/courses/${params.id}`)
                ]);
                const userData = userRes.data.data;
                setRole(userData.role.toLowerCase());
                setIsEnrolled(courseRes.data.isEnrolled);
                
                // Default view based on role
                if (userData.role.toLowerCase().includes('admin')) {
                    setViewMode('admin');
                } else {
                    setViewMode('landing');
                }
            } catch (err) {
                console.error('Failed to fetch course detail data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Personalizing Experience...</p>
            </div>
        </DashboardLayout>
    );

    // If Admin/Instructor wants to see their dashboard
    if ((role === 'admin' || role === 'super-admin') && viewMode === 'admin') {
        return (
            <DashboardLayout>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                    <AdminCourseView courseId={params.id} />
                </div>
            </DashboardLayout>
        );
    }

    if (role === 'instructor' && viewMode === 'instructor') {
        return (
            <DashboardLayout>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                    <InstructorCourseView courseId={params.id} />
                </div>
            </DashboardLayout>
        );
    }

    // Default to Learning Page if enrolled and in learn mode
    if (isEnrolled && viewMode === 'learn') {
        return <LearningPage params={params} />;
    }

    // Otherwise show the beautiful Udemy-style Landing Page
    return (
        <DashboardLayout>
            <CourseLandingPage 
                courseId={params.id} 
                isEnrolled={isEnrolled} 
                onStartLearning={() => setViewMode('learn')}
            />
            
            {/* Contextual Switcher for Staff */}
            {(role === 'admin' || role === 'super-admin' || role === 'instructor') && (
                <div className="fixed bottom-8 left-8 z-[100]">
                    <button 
                        onClick={() => setViewMode(viewMode === 'landing' ? (role.includes('admin') ? 'admin' : 'instructor') : 'landing')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center gap-2 border border-white/10"
                    >
                        {viewMode === 'landing' ? `Switch to ${role.includes('admin') ? 'Admin' : 'Instructor'} View` : 'Switch to Public Preview'}
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
