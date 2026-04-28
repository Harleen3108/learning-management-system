'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { 
    User as UserIcon, 
    Key, 
    Save, 
    RefreshCcw, 
    Shield, 
    Mail, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function GeneralSettings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updatingAccount, setUpdatingAccount] = useState(false);
    const [user, setUser] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/me');
            setUser({ name: res.data.data.name, email: res.data.data.email });
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingAccount(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/updatedetails', user);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            // Optional: refresh to update header/sidebar avatars/names
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setUpdatingAccount(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        setUpdatingAccount(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully. Redirecting to login...' });
            
            // Logout and redirect
            setTimeout(() => {
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                router.push('/login');
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setUpdatingAccount(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">
                Loading Secure Vault...
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 font-medium italic">Manage your digital identity and security preferences.</p>
                </div>

                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-10">
                    {/* Profile Section */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <UserIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Personal Identity</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">General Information</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Display Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text"
                                            value={user.name}
                                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Verified Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="email"
                                            value={user.email}
                                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={updatingAccount}
                                    className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50"
                                >
                                    {updatingAccount ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.section>

                    {/* Security Section */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security Access</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Password Management</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Current Validation Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Secure Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={updatingAccount}
                                    className="flex items-center gap-2 px-10 py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-200 transition-all disabled:opacity-50"
                                >
                                    {updatingAccount ? <RefreshCcw className="animate-spin" size={16} /> : <Shield size={16} />}
                                    Update Security Key
                                </button>
                            </div>
                        </form>
                    </motion.section>
                </div>
            </div>
        </DashboardLayout>
    );
}
