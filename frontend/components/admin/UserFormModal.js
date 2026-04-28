'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, Key, AlertCircle, Calendar, Phone, Heart } from 'lucide-react';
import { clsx } from 'clsx';

export default function UserFormModal({ isOpen, onClose, onSubmit, user = null }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'student',
        password: '',
        dob: '',
        phone: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        instructorBio: '',
        instructorSpecialty: '',
        profilePhoto: '',
        socialLinks: {
            website: '',
            linkedin: '',
            twitter: '',
            youtube: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'student',
                password: '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                phone: user.phone || '',
                parentName: user.parentName || '',
                parentEmail: user.parentEmail || '',
                parentPhone: user.parentPhone || '',
                instructorBio: user.instructorBio || '',
                instructorSpecialty: user.instructorSpecialty || '',
                profilePhoto: user.profilePhoto || '',
                socialLinks: user.socialLinks || {
                    website: '',
                    linkedin: '',
                    twitter: '',
                    youtube: ''
                }
            });
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'student',
                password: '',
                dob: '',
                phone: '',
                parentName: '',
                parentEmail: '',
                parentPhone: '',
                instructorBio: '',
                instructorSpecialty: '',
                profilePhoto: '',
                socialLinks: {
                    website: '',
                    linkedin: '',
                    twitter: '',
                    youtube: ''
                }
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation for student
        if (formData.role === 'student' && !user) {
            if (!formData.parentEmail && !formData.parentPhone) {
                setError('Parent Email or Phone is required for students.');
                setLoading(false);
                return;
            }
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50 my-auto"
                >
                    <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                                    {user ? 'Edit User Profile' : 'Provision New User'}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    {user ? 'Update account details and permissions.' : 'Add a new member to the ecosystem.'}
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-semibold"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Identity Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            disabled={!!user}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 disabled:opacity-50"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="parent">Parent</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info for Student */}
                            <AnimatePresence mode='wait'>
                                {formData.role === 'student' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6 pt-4 border-t border-slate-50"
                                    >
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <Calendar size={16} />
                                            <h4 className="text-[10px] font-semibold uppercase tracking-widest">Student Specifics</h4>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-rose-500">
                                                <Heart size={16} fill="currentColor" />
                                                <h4 className="text-[10px] font-semibold uppercase tracking-widest">Guardian Link</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Guardian Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.parentName}
                                                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                    placeholder="Parent's full name"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Guardian Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.parentEmail}
                                                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                        placeholder="parent@..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Guardian Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.parentPhone}
                                                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                        placeholder="+91..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {formData.role === 'instructor' && (
                                     <motion.div
                                         initial={{ opacity: 0, y: -10 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         exit={{ opacity: 0, y: -10 }}
                                         className="space-y-6 pt-4 border-t border-slate-50"
                                     >
                                         <div className="flex items-center gap-2 text-blue-600 mb-2">
                                             <Shield size={16} />
                                             <h4 className="text-[10px] font-semibold uppercase tracking-widest">Instructor Profile</h4>
                                         </div>

                                         <div className="space-y-2">
                                             <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Specialty / Title</label>
                                             <input
                                                 type="text"
                                                 value={formData.instructorSpecialty}
                                                 onChange={(e) => setFormData({ ...formData, instructorSpecialty: e.target.value })}
                                                 className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                 placeholder="e.g. Master Chef / Senior Developer"
                                             />
                                         </div>

                                         <div className="space-y-2">
                                             <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                                             <textarea
                                                 value={formData.instructorBio}
                                                 onChange={(e) => setFormData({ ...formData, instructorBio: e.target.value })}
                                                 rows="3"
                                                 className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 resize-none"
                                                 placeholder="Short bio for students..."
                                             />
                                         </div>

                                         <div className="space-y-2">
                                             <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
                                             <input
                                                 type="text"
                                                 value={formData.profilePhoto}
                                                 onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                                                 className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                 placeholder="https://..."
                                             />
                                         </div>
                                     </motion.div>
                                 )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">
                                    {user ? 'Reset Password' : 'Security Key'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                        placeholder={user ? "Leave blank to keep current" : "••••••••"}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-semibold uppercase tracking-widest text-xs transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : user ? 'Save Changes' : 'Provision User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
