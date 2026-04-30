'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Footer from '@/components/Footer';
import InstructorProfile from '@/components/instructor/InstructorProfile';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function InstructorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const res = await api.get(`/instructors/${params.id}/profile`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch instructor:', err);
                setError(err.response?.data?.message || 'Failed to load instructor profile');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchInstructor();
    }, [params.id]);

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 lg:pt-10 pb-12">
                {/* Slim back button — replaces the heavy navbar */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-[#071739] transition-colors"
                >
                    <ChevronLeft size={14} /> Back
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-[#071739]" size={32} />
                        <p className="text-xs font-semibold uppercase tracking-widest">Loading instructor…</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] text-center gap-4">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{error}</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">The instructor you're looking for might have moved or been removed.</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                        >
                            Go back
                        </button>
                    </div>
                ) : (
                    <InstructorProfile data={data} />
                )}
            </main>
            <Footer />
        </div>
    );
}
