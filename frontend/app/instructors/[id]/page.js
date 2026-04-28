'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstructorProfile from '@/components/instructor/InstructorProfile';
import { Loader2, AlertCircle } from 'lucide-react';

export default function InstructorProfilePage() {
    const params = useParams();
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
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-32">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[500px]">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{error}</h2>
                        <button 
                            onClick={() => window.history.back()}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                        >
                            Go Back
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
