'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Settings, 
    Save, 
    RefreshCcw, 
    Globe, 
    Shield, 
    CreditCard, 
    Bell, 
    Lock, 
    Mail, 
    Cpu,
    CheckCircle2,
    Info,
    AlertTriangle,
    ToggleLeft,
    ToggleRight,
    User as UserIcon,
    Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export default function SystemSettings() {
    const router = useRouter();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Personal Account State
    const [user, setUser] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [updatingAccount, setUpdatingAccount] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, userRes] = await Promise.all([
                api.get('/admin/settings'),
                api.get('/auth/me')
            ]);
            setSettings(settingsRes.data.data);
            setUser({ name: userRes.data.data.name, email: userRes.data.data.email });
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', { settings });
            alert('System settings updated successfully');
        } catch (err) {
            alert('Failed to update system settings');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingAccount(true);
        try {
            await api.put('/auth/updatedetails', user);
            alert('Profile updated successfully');
            window.location.reload(); // Refresh to update header/sidebar
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdatingAccount(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return alert('New passwords do not match');
        }

        setUpdatingAccount(true);
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert('Password updated successfully. Please login again.');
            // Clear cookie and redirect to login
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            router.push('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update password');
        } finally {
            setUpdatingAccount(false);
        }
    };

    const categories = [
        { id: 'general', name: 'General', icon: Globe },
        { id: 'features', name: 'Features', icon: Cpu },
        { id: 'payment', name: 'Payments', icon: CreditCard },
        { id: 'advanced', name: 'Security', icon: Shield },
        { id: 'account', name: 'Account', icon: UserIcon },
    ];

    if (loading) return (
        <AdminLayout>
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Initializing System Configuration...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-1">System Settings</h1>
                        <p className="text-slate-400 font-medium italic">Global configuration for platform behavior, monetization, and visibility.</p>
                    </div>
                    {activeTab !== 'account' && (
                        <div className="flex gap-4">
                            <button 
                                onClick={fetchData}
                                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm"
                            >
                                <RefreshCcw size={20} />
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-[#071739] text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Synchronizing...' : 'Apply Changes'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Rail */}
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                                    activeTab === cat.id 
                                        ? "bg-white text-[#071739] shadow-sm border border-slate-100" 
                                        : "text-slate-400 hover:bg-white/50"
                                )}
                            >
                                <cat.icon size={18} />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-12"
                        >
                            {activeTab === 'account' ? (
                                <div className="space-y-12">
                                    {/* Profile Form */}
                                    <section>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-[#071739]/5 text-[#071739] rounded-xl flex items-center justify-center">
                                                <UserIcon size={20} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Personal Identity</h3>
                                        </div>
                                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                                <input 
                                                    type="text"
                                                    value={user.name}
                                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                                <input 
                                                    type="email"
                                                    value={user.email}
                                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2 pt-2">
                                                <button 
                                                    type="submit"
                                                    disabled={updatingAccount}
                                                    className="px-8 py-3 bg-[#071739] text-white rounded-xl font-bold text-xs hover:-translate-y-1 transition-all disabled:opacity-50"
                                                >
                                                    {updatingAccount ? 'Renaming...' : 'Update Identity'}
                                                </button>
                                            </div>
                                        </form>
                                    </section>

                                    <div className="h-[1px] bg-slate-100 w-full"></div>

                                    {/* Password Form */}
                                    <section>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-[#A68868]/10 text-[#A68868] rounded-xl flex items-center justify-center">
                                                <Key size={20} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Security Access</h3>
                                        </div>
                                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                                                    <input 
                                                        type="password"
                                                        value={passwords.currentPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                                        placeholder="••••••••"
                                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                                                    <input 
                                                        type="password"
                                                        value={passwords.newPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                        placeholder="••••••••"
                                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                                                    <input 
                                                        type="password"
                                                        value={passwords.confirmPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                        placeholder="••••••••"
                                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <button 
                                                    type="submit"
                                                    disabled={updatingAccount}
                                                    className="px-8 py-3 bg-[#A68868] text-white rounded-xl font-bold text-xs hover:-translate-y-1 transition-all disabled:opacity-50"
                                                >
                                                    {updatingAccount ? 'Resetting...' : 'Change Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </section>
                                </div>
                            ) : (
                                <>
                                    {settings.filter(s => s.category === activeTab).map((setting) => (
                                        <div key={setting.key} className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                            <div className="flex-1 max-w-md">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-widest text-[11px] opacity-80">{setting.key.replace(/([A-Z])/g, ' $1')}</label>
                                                    <Info size={12} className="text-slate-300 cursor-help" title={setting.description} />
                                                </div>
                                                <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{setting.description}</p>
                                            </div>

                                            <div className="flex-shrink-0 w-full md:w-64">
                                                {typeof setting.value === 'boolean' ? (
                                                    <button 
                                                        onClick={() => handleChange(setting.key, !setting.value)}
                                                        className={clsx(
                                                            "w-14 h-8 rounded-full p-1 transition-all duration-300 border",
                                                            setting.value ? "bg-emerald-500 border-emerald-400" : "bg-slate-100 border-slate-200"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                                                            setting.value ? "translate-x-6" : "translate-x-0"
                                                        )} />
                                                    </button>
                                                ) : (
                                                    <input 
                                                        type={setting.key.includes('Password') || setting.key.includes('Secret') || setting.key.includes('Key') ? 'password' : 'text'}
                                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                                        value={setting.value}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {settings.filter(s => s.category === activeTab).length === 0 && (
                                        <div className="py-20 text-center flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                                <AlertTriangle size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 italic">No configurations found in this frequency. Standard defaults are active.</p>
                                        </div>
                                    )}

                                    {activeTab === 'payment' && (
                                        <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                                            <Shield className="text-[#A68868] mt-1 flex-shrink-0" size={20} />
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-800 mb-1 leading-none uppercase tracking-tight">Security Protocol</h5>
                                                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">Payment keys are masked in this view. Updates will be logged to the immutable audit ledger with masked values for compliance.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
