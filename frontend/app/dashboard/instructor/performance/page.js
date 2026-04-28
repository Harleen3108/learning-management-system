'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2,
  TrendingUp,
  Users,
  Star,
  DollarSign,
  Activity,
  Filter,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useSearchParams, useRouter } from 'next/navigation';

// Sub-components
import OverviewSection from './sections/OverviewSection';
import RevenueSection from './sections/RevenueSection';
import StudentsSection from './sections/StudentsSection';
import ReviewsSection from './sections/ReviewsSection';
import EngagementSection from './sections/EngagementSection';

export default function PerformancePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sectionParam = searchParams.get('section');

    const [activeSection, setActiveSection] = useState('overview');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sectionParam) {
            setActiveSection(sectionParam);
        }
    }, [sectionParam]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/communication/courses'); // Using same utility route
                setCourses(res.data.data);
            } catch (err) {
                console.error('Failed to fetch instructor courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-none">Performance Hub</h1>
                        <p className="text-slate-500 font-medium mt-2">Track course success, revenue, and student engagement.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 px-3 text-slate-400">
                            <Filter size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Filter by Course</span>
                        </div>
                        <select 
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 transition-all appearance-none cursor-pointer"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="all">All My Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dynamic Content Section */}
                <div className="min-h-[500px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#071739]" size={32} />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeSection === 'overview' && <OverviewSection selectedCourse={selectedCourse} />}
                                {activeSection === 'revenue' && <RevenueSection selectedCourse={selectedCourse} />}
                                {activeSection === 'students' && <StudentsSection selectedCourse={selectedCourse} />}
                                {activeSection === 'reviews' && <ReviewsSection selectedCourse={selectedCourse} />}
                                {activeSection === 'engagement' && <EngagementSection selectedCourse={selectedCourse} />}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
