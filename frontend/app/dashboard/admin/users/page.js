'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Users, 
    UserPlus, 
    Search, 
    Shield, 
    Activity, 
    Ban, 
    Trash2, 
    Edit3, 
    Eye,
    CheckCircle2,
    RefreshCw,
    Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import UserFormModal from '@/components/admin/UserFormModal';
import ActivityLogModal from '@/components/admin/ActivityLogModal';

const roleTabs = ['All', 'Student', 'Instructor', 'Parent', 'Admin'];

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const router = useRouter();

    const viewProfile = (user) => {
        if (user.role === 'instructor') {
            router.push(`/dashboard/admin/instructors/${user._id}`);
        } else {
            router.push(`/dashboard/admin/users/${user._id}`);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = [];
            if (activeTab !== 'All') query.push(`role=${activeTab.toLowerCase()}`);
            if (search) query.push(`search=${search}`);
            
            const res = await api.get(`/admin/users?${query.join('&')}`);
            setUsers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeout);
    }, [activeTab, search]);

    const handleCreateUpdate = async (formData) => {
        try {
            if (selectedUser) {
                await api.put(`/admin/users/${selectedUser._id}`, formData);
            } else {
                await api.post('/admin/users', formData);
            }
            fetchUsers();
            setIsFormOpen(false);
        } catch (err) {
            console.error('Failed to save user:', err);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
            setUsers(users.map(u => u._id === user._id ? { ...u, isActive: !user.isActive } : u));
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const handleHardDelete = async (userId) => {
        if (confirm('WARNING: This action is permanent and IRREVERSIBLE. Are you sure you want to PERMANENTLY DELETE this user?')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.filter(u => u._id !== userId));
            } catch (err) {
                console.error('Failed to delete user:', err);
            }
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                            <Users className="text-[#071739]" size={32} />
                            User Management
                        </h1>
                        <p className="text-slate-400 mt-1">Manage global access, roles, and monitor user behavior across the platform.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchUsers}
                            className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-[#071739] hover:border-[#071739]/20 transition-all shadow-sm"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
                            className="flex items-center justify-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-slate-900/10 group"
                        >
                            <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                            Provision User
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200/50 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-medium text-slate-600"
                        />
                    </div>
                    <div className="flex gap-2 bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200/50 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {roleTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "px-8 py-3 rounded-[1.2rem] text-xs font-bold uppercase tracking-widest transition-all shrink-0",
                                    activeTab === tab 
                                        ? "bg-white text-[#071739] shadow-md border border-slate-200/50" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-xl overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-[#071739] border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fetching Personnel...</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">S.No</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <Search size={48} strokeWidth={1} />
                                                <p className="font-bold uppercase text-xs tracking-widest">No matching users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <motion.tr 
                                            key={user._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-slate-400 tracking-tighter">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                                        <img 
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">ID: {user._id.slice(-6)}</p>
                                                        
                                                        {user.role === 'parent' && user.linkedStudents?.length > 0 && (
                                                            <div className="mt-1.5 flex items-center gap-1">
                                                                <Users size={10} className="text-[#071739]" />
                                                                <p className="text-[9px] font-bold text-[#071739] uppercase tracking-tighter">
                                                                    Child: {user.linkedStudents.map(s => s.name).join(', ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                        {user.role === 'student' && user.linkedParent && (
                                                            <div className="mt-1.5 flex items-center gap-1 text-[#A68868]">
                                                                <Heart size={10} fill="currentColor" />
                                                                <p className="text-[9px] font-bold uppercase tracking-tighter">
                                                                    Parent: {user.linkedParent.name}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx(
                                                        "p-1.5 rounded-lg",
                                                        user.role === 'admin' ? "bg-rose-50 text-rose-500" :
                                                        user.role === 'instructor' ? "bg-[#071739]/5 text-[#071739]" :
                                                        "bg-slate-50 text-slate-500"
                                                    )}>
                                                        <Shield size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 capitalize tracking-tight">{user.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-600">{user.email}</p>
                                                    {user.phone && <p className="text-[10px] font-bold text-slate-400 tracking-widest">{user.phone}</p>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <span className={clsx(
                                                        "px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all",
                                                        user.isActive 
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white" 
                                                            : "bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-rose-500 group-hover:text-white"
                                                    )}>
                                                        {user.isActive ? 'Active' : 'Blocked'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => viewProfile(user)}
                                                        className="p-2.5 text-slate-400 hover:text-[#071739] hover:bg-[#071739]/5 rounded-xl transition-all"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedUser(user); setIsFormOpen(true); }}
                                                        className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={clsx(
                                                            "p-2.5 rounded-xl transition-all",
                                                            user.isActive ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"
                                                        )}
                                                        title={user.isActive ? "Block User" : "Unblock User"}
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleHardDelete(user._id)}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UserFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateUpdate}
                user={selectedUser}
            />
            
            <ActivityLogModal 
                isOpen={isLogOpen}
                onClose={() => setIsLogOpen(false)}
                user={selectedUser}
            />
        </AdminLayout>
    );
}
