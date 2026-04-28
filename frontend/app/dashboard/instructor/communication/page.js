'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  HelpCircle, 
  BookOpen, 
  Megaphone, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight,
  User,
  Send,
  MoreVertical,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Paperclip,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useSearchParams, useRouter } from 'next/navigation';

// Sub-components for each section
import QnASection from './sections/QnASection';
import MessagesSection from './sections/MessagesSection';
import AssignmentsSection from './sections/AssignmentsSection';
import AnnouncementsSection from './sections/AnnouncementsSection';

export default function CommunicationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sectionParam = searchParams.get('section');

    const [activeSection, setActiveSection] = useState('qna');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sectionParam) {
            setActiveSection(sectionParam);
        }
    }, [sectionParam]);

    const handleSectionChange = (sectionId) => {
        setActiveSection(sectionId);
        router.push(`/dashboard/instructor/communication?section=${sectionId}`);
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/communication/courses');
                setCourses(res.data.data);
            } catch (err) {
                console.error('Failed to fetch instructor courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const sections = [
        { id: 'qna', label: 'Q&A', icon: HelpCircle, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'bg-[#071739]/5 text-[#071739]' },
        { id: 'assignments', label: 'Assignments', icon: FileText, color: 'bg-orange-50 text-orange-600' },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, color: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-none">Communication Hub</h1>
                        <p className="text-slate-500 font-medium mt-2">Interact with students and manage course engagement.</p>
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
                                {activeSection === 'qna' && <QnASection selectedCourse={selectedCourse} />}
                                {activeSection === 'messages' && <MessagesSection selectedCourse={selectedCourse} courses={courses} />}
                                {activeSection === 'assignments' && <AssignmentsSection selectedCourse={selectedCourse} courses={courses} />}
                                {activeSection === 'announcements' && <AnnouncementsSection selectedCourse={selectedCourse} />}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
