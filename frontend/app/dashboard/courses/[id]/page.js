'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LearningPage from '../../LearningPage';
import AdminCourseView from '@/components/admin/AdminCourseView';
import InstructorCourseView from '@/components/instructor/InstructorCourseView';
import CourseLandingPage from '@/components/CourseLandingPage';
import api from '@/services/api';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/useAuthStore';

export default function CourseDetailModulePage({ params }) {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
                    <div className="w-12 h-12 border-4 border-[#071739] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-widest animate-pulse">Loading course…</p>
                </div>
            </DashboardLayout>
        }>
            <CourseDetailModule params={params} />
        </Suspense>
    );
}

function CourseDetailModule({ params }) {
    const searchParams = useSearchParams();
    const requestedView = searchParams.get('view'); // 'learn' | 'landing' | null

    const [role, setRole] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('landing');

    const { user: authUser, isLoading: authLoading } = useAuthStore();

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading) return;
            try {
                const courseRes = await api.get(`/courses/${params.id}`);
                const role = authUser?.role?.toLowerCase() || 'student';
                setRole(role);
                const enrolled = courseRes.data.isEnrolled;
                setIsEnrolled(enrolled);

                // Decide the initial view:
                //   • ?view=learn  → go straight into the LearningPage (used from My Learning,
                //     Continue learning, etc.). Falls back to landing if not enrolled & not staff.
                //   • Otherwise admin/super-admin → admin view; everyone else → landing.
                if (requestedView === 'learn'
                    && (enrolled || role === 'admin' || role === 'super-admin' || role === 'instructor')) {
                    setViewMode('learn');
                } else if (role.includes('admin')) {
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
    }, [params.id, authLoading, authUser, requestedView]);

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-widest animate-pulse">Personalizing Experience...</p>
            </div>
        </DashboardLayout>
    );

    const isStaff = role === 'admin' || role === 'super-admin' || role === 'instructor';

    // Admin curriculum/operations dashboard
    if ((role === 'admin' || role === 'super-admin') && viewMode === 'admin') {
        return (
            <DashboardLayout>
                <div className="w-full mx-auto pt-10">
                    <AdminCourseView courseId={params.id} />
                </div>
                {/* Floating switcher to jump between views */}
                <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} role={role} />
            </DashboardLayout>
        );
    }

    if (role === 'instructor' && viewMode === 'instructor') {
        return (
            <DashboardLayout>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                    <InstructorCourseView courseId={params.id} />
                </div>
                <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} role={role} />
            </DashboardLayout>
        );
    }

    // Learning Page — enrolled students AND staff (for previewing the new YouTube-style UI)
    if ((isEnrolled || isStaff) && viewMode === 'learn') {
        // Back button takes staff to their dashboard view, students back to the landing page.
        const backTarget = (role === 'admin' || role === 'super-admin') ? 'admin'
            : role === 'instructor' ? 'instructor'
            : 'landing';
        return (
            <>
                <LearningPage params={params} onBack={() => setViewMode(backTarget)} />
                {isStaff && <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} role={role} />}
            </>
        );
    }

    // Otherwise the marketing-style landing page
    return (
        <DashboardLayout>
            <CourseLandingPage
                courseId={params.id}
                isEnrolled={isEnrolled}
                onStartLearning={() => setViewMode('learn')}
            />
            {isStaff && <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} role={role} />}
        </DashboardLayout>
    );
}

// Floating view switcher visible to admins/instructors. Lets staff cycle between
// the operations dashboard, the public landing page, and the new student "watch" UI.
function ViewSwitcher({ viewMode, setViewMode, role }) {
    const isAdmin = role === 'admin' || role === 'super-admin';
    const isInstructor = role === 'instructor';

    const buttons = [
        { id: 'learn', label: 'Watch as Student' },
        { id: 'landing', label: 'Public Preview' },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin View' }] : []),
        ...(isInstructor ? [{ id: 'instructor', label: 'Instructor View' }] : [])
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-full shadow-2xl flex items-center gap-1 p-1">
            {buttons.map(btn => (
                <button
                    key={btn.id}
                    onClick={() => setViewMode(btn.id)}
                    className={
                        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all " +
                        (viewMode === btn.id
                            ? "bg-white text-slate-900"
                            : "text-white/60 hover:text-white")
                    }
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
}
