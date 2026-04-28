'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Paperclip,
  Trash2,
  Edit3,
  Loader2,
  X,
  Upload,
  GraduationCap
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

export default function AssignmentsSection({ selectedCourse, courses = [] }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewSubmissions, setViewSubmissions] = useState(null); // Assignment object
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [gradingSub, setGradingSub] = useState(null); // Submission object
    const [editingAssignment, setEditingAssignment] = useState(null);

    const [formData, setFormData] = useState({
        courseId: selectedCourse === 'all' ? '' : selectedCourse,
        title: '',
        description: '',
        dueDate: '',
        attachments: []
    });

    useEffect(() => {
        fetchAssignments();
    }, [selectedCourse]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const courseParam = selectedCourse === 'all' ? '' : `?courseId=${selectedCourse}`;
            const res = await api.get(`/communication/assignments${courseParam}`);
            setAssignments(res.data.data);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.courseId) {
            alert('Please select a specific course.');
            return;
        }
        try {
            if (editingAssignment) {
                await api.put(`/communication/assignments/${editingAssignment}`, formData);
            } else {
                await api.post('/communication/assignments', formData);
            }
            setShowModal(false);
            setEditingAssignment(null);
            setFormData({ courseId: selectedCourse === 'all' ? '' : selectedCourse, title: '', description: '', dueDate: '', attachments: [] });
            fetchAssignments();
        } catch (err) {
            console.error('Failed to save assignment:', err);
        }
    };

    const handleEdit = (assignment) => {
        setFormData({
            courseId: assignment.course._id || assignment.course,
            title: assignment.title,
            description: assignment.description,
            dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
            attachments: assignment.attachments || []
        });
        setEditingAssignment(assignment._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/communication/assignments/${id}`);
            fetchAssignments();
        } catch (err) {
            console.error('Failed to delete assignment:', err);
        }
    };

    const handleUpload = () => {
        if (!window.cloudinary) {
            alert('Upload service is loading. Please try again in a moment.');
            return;
        }
        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: 'dtadnrc7n',
                apiKey: '116434844277175',
                uploadSignature: async (callback, params_to_sign) => {
                  try {
                    const res = await api.post('/courses/upload-signature', { paramsToSign: params_to_sign });
                    callback(res.data.data.signature);
                  } catch (err) {
                    console.error('Signature fetch failed:', err);
                  }
                },
                uploadPreset: 'ml_default',
                sources: ['local', 'url'],
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setFormData(prev => ({
                        ...prev,
                        attachments: [...prev.attachments, { name: result.info.original_filename, url: result.info.secure_url }]
                    }));
                }
            }
        );
        widget.open();
    };

    const fetchSubmissions = async (assignmentId) => {
        setLoadingSubmissions(true);
        try {
            const res = await api.get(`/communication/assignments/${assignmentId}/submissions`);
            setSubmissions(res.data.data);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleGrade = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/communication/submissions/${gradingSub._id}/grade`, {
                grade: gradingSub.grade,
                feedback: gradingSub.feedback
            });
            setGradingSub(null);
            fetchSubmissions(viewSubmissions._id);
        } catch (err) {
            console.error('Failed to grade submission:', err);
        }
    };

    return (
        <div className="space-y-6">
            <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="afterInteractive" />
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900">Manage Assignments</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Create tasks and review student progress.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingAssignment(null);
                        setFormData({ courseId: selectedCourse === 'all' ? '' : selectedCourse, title: '', description: '', dueDate: '', attachments: [] });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#071739] text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/10"
                >
                    <Plus size={18} /> Create Assignment
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" /></div>
            ) : assignments.length === 0 ? (
                <Card className="p-20 text-center flex flex-col items-center border-slate-50">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6">
                        <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No assignments created</h3>
                    <p className="text-slate-400 font-medium mt-2">Start by creating an assignment for your students.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assignment) => (
                        <Card key={assignment._id} className="p-8 border-slate-50 hover:border-[#071739]/10 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#071739]/5 group-hover:bg-[#071739] transition-colors"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(assignment)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(assignment._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <h4 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">{assignment.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                                {assignment.course.title}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-xs font-semibold">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Users size={16} className="text-slate-400" />
                                    <span className="text-xs font-semibold">Multiple Submissions</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setViewSubmissions(assignment);
                                    fetchSubmissions(assignment._id);
                                }}
                                className="w-full py-4 border border-[#071739]/10 text-[#071739] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#071739] hover:text-white transition-all"
                            >
                                View Submissions
                            </button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Assignment Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-[#071739]/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-slate-900">{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h3>
                                            <p className="text-xs text-slate-400 font-medium">{editingAssignment ? 'Update assignment details.' : 'Post a new task for your students.'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Select Course</label>
                                            <select 
                                                required
                                                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all appearance-none cursor-pointer"
                                                value={formData.courseId}
                                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                            >
                                                <option value="" disabled>Choose a course</option>
                                                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Assignment Title</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                                                placeholder="e.g. Final Project Submission"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Due Date</label>
                                            <input 
                                                required
                                                type="date" 
                                                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Attachments ({formData.attachments.length})</label>
                                            <div className="space-y-2">
                                                {formData.attachments.map((att, i) => (
                                                    <div key={i} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-2 px-3 rounded-lg">
                                                        <span className="truncate">{att.name}</span>
                                                        <button type="button" onClick={() => setFormData({ ...formData, attachments: formData.attachments.filter((_, idx) => idx !== i) })} className="text-rose-500 hover:text-rose-600"><X size={14}/></button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={handleUpload} className="w-full h-[60px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-[#071739]/20 hover:text-[#071739] transition-all">
                                                    <Upload size={18} />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Upload Files</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Description & Instructions</label>
                                        <textarea 
                                            required
                                            className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all min-h-[150px]"
                                            placeholder="Explain the task, requirements, and grading criteria..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full bg-[#071739] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                                    >
                                        {editingAssignment ? 'Update Assignment' : 'Publish Assignment'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Submissions Modal */}
            <AnimatePresence>
                {viewSubmissions && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setViewSubmissions(null)}
                            className="absolute inset-0 bg-[#071739]/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                            className="relative w-full max-w-4xl bg-slate-50 h-[80vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex"
                        >
                            {/* Left: Submissions List */}
                            <div className="w-[380px] bg-white border-r border-slate-100 flex flex-col">
                                <div className="p-10 border-b border-slate-50">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Submissions</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewSubmissions.title}</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                    {loadingSubmissions ? (
                                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#071739]" /></div>
                                    ) : submissions.length === 0 ? (
                                        <p className="text-center py-20 text-[10px] font-black text-slate-300 uppercase tracking-widest">No submissions yet</p>
                                    ) : (
                                        submissions.map((sub) => (
                                            <button 
                                                key={sub._id}
                                                onClick={() => setGradingSub(sub)}
                                                className={clsx(
                                                    "w-full flex items-center gap-4 p-5 rounded-3xl transition-all text-left",
                                                    gradingSub?._id === sub._id ? "bg-[#071739] text-white shadow-xl" : "hover:bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {sub.student.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-bold uppercase tracking-tight truncate">{sub.student.name}</p>
                                                    <p className={clsx(
                                                        "text-[9px] font-medium",
                                                        gradingSub?._id === sub._id ? "text-slate-300" : "text-slate-400"
                                                    )}>{new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                </div>
                                                {sub.status === 'graded' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right: Grading View */}
                            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30 custom-scrollbar">
                                {gradingSub ? (
                                    <div className="space-y-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-2xl font-semibold text-slate-900">{gradingSub.student.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium mt-1">Submitted on {new Date(gradingSub.submittedAt).toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
                                                    <Paperclip size={16} /> View Files
                                                </button>
                                            </div>
                                        </div>

                                        <Card className="p-8 border-slate-100 shadow-sm bg-white">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Student Content</h5>
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                                {gradingSub.content || "No text content provided. Please check attachments."}
                                            </p>
                                        </Card>

                                        <div className="pt-10 border-t border-slate-100">
                                            <h5 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                                                <GraduationCap size={24} className="text-[#071739]" />
                                                Grading & Feedback
                                            </h5>
                                            <form onSubmit={handleGrade} className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Grade / Score</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                                                        placeholder="e.g. A+ or 95/100"
                                                        value={gradingSub.grade || ''}
                                                        onChange={(e) => setGradingSub({ ...gradingSub, grade: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Private Feedback</label>
                                                    <textarea 
                                                        className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all min-h-[150px]"
                                                        placeholder="Write constructive feedback for the student..."
                                                        value={gradingSub.feedback || ''}
                                                        onChange={(e) => setGradingSub({ ...gradingSub, feedback: e.target.value })}
                                                    />
                                                </div>
                                                <button 
                                                    type="submit"
                                                    className="w-full bg-[#071739] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-slate-900/10"
                                                >
                                                    Submit Grade
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale grayscale-[0.5]">
                                        <Users size={64} className="text-slate-300 mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Select a submission to start grading</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
