'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Users, 
    UserPlus, 
    Search, 
    MoreVertical, 
    Shield, 
    Mail, 
    Activity, 
    Ban, 
    Trash2, 
    Edit3, 
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Filter
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
    const [dropdownOpen, setDropdownOpen] = useState(null);

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
        if (selectedUser) {
            // Update
            await api.put(`/admin/users/${selectedUser._id}`, formData);
        } else {
            // Create
            await api.post('/admin/users', formData);
        }
        fetchUsers();
    };

    const handleToggleStatus = async (user) => {
        try {
            await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
            setUsers(users.map(u => u._id === user._id ? { ...u, isActive: !user.isActive } : u));
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const handleSoftDelete = async (userId) => {
        if (confirm('Are you sure you want to deactivate this user? They will no longer be able to log in.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.map(u => u._id === userId ? { ...u, isActive: false } : u));
            } catch (err) {
                console.error('Failed to delete user:', err);
            }
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">User Management</h1>
                        <p className="text-slate-400 mt-1">Manage global access, roles, and monitor user behavior.</p>
                    </div>
                    <button 
                        onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-100 group"
                    >
                        <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                        Provision User
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-slate-600"
                        />
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {roleTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0",
                                    activeTab === tab 
                                        ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
                        ))
                    ) : users.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                            <span className="text-4xl">🔍</span>
                            <p className="mt-4 font-bold">No users matches your criteria</p>
                        </div>
                    ) : (
                        users.map((user) => (
                            <motion.div 
                                key={user._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="relative">
                                        <button 
                                            onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                                            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                                        >
                                            <MoreVertical size={20} className="text-slate-400" />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {dropdownOpen === user._id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                                                >
                                                    <button 
                                                        onClick={() => { setSelectedUser(user); setIsLogOpen(true); setDropdownOpen(null); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-600 rounded-xl transition-all text-sm font-bold"
                                                    >
                                                        <Activity size={18} className="text-blue-500" />
                                                        Activity Logs
                                                    </button>
                                                    <button 
                                                        onClick={() => { handleToggleStatus(user); setDropdownOpen(null); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-600 rounded-xl transition-all text-sm font-bold"
                                                    >
                                                        <Ban size={18} className="text-orange-500" />
                                                        {user.isActive ? 'Suspend Access' : 'Restore Access'}
                                                    </button>
                                                    <div className="my-2 border-t border-slate-50" />
                                                    <button 
                                                        onClick={() => { handleSoftDelete(user._id); setDropdownOpen(null); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-500 rounded-xl transition-all text-sm font-bold"
                                                    >
                                                        <Trash2 size={18} />
                                                        Soft Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 overflow-hidden relative">
                                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" className="w-full h-full object-cover" />
                                        {!user.isActive && (
                                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                                                <Ban size={20} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-slate-800 truncate tracking-tight">{user.name}</h3>
                                        <p className="text-sm font-medium text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</span>
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-blue-600" />
                                            <span className="text-sm font-black text-slate-700 capitalize">{user.role}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-2 h-2 rounded-full", user.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                            <span className={clsx("text-sm font-black capitalize", user.isActive ? "text-emerald-700" : "text-slate-400")}>
                                                {user.isActive ? 'Operational' : 'Restricted'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { setSelectedUser(user); setIsFormOpen(true); }}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200"
                                >
                                    <Edit3 size={16} />
                                    Modify Profile
                                </button>
                            </motion.div>
                        ))
                    )}
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
