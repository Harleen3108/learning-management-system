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
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx } from 'clsx';

// EduFlow palette: navy #071739, tan #A68868
// Typography matches admin pages: font-semibold for headings/values, font-medium for body.

export default function GeneralSettings() {
    const router = useRouter();
    const [updatingAccount, setUpdatingAccount] = useState(false);
    const { user: authUser, logout, isLoading } = useAuthStore();
    const [user, setUser] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!isLoading && authUser) {
            setUser({ name: authUser.name, email: authUser.email });
        }
    }, [isLoading, authUser]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingAccount(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/updatedetails', user);
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setUpdatingAccount(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match.' });
        }
        if (passwords.newPassword.length < 6) {
            return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        }

        setUpdatingAccount(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully. Redirecting to login…' });
            setTimeout(() => logout(router), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
        } finally {
            setUpdatingAccount(false);
        }
    };

    if (isLoading) return (
        <DashboardLayout>
            <div className="p-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-[10px] animate-pulse">
                Loading account…
            </div>
        </DashboardLayout>
    );

    const initials = (authUser?.name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* ───────── Header ───────── */}
                <header>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Manage your profile and security preferences.
                    </p>
                </header>

                {/* ───────── Account summary card ───────── */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#071739] text-white flex items-center justify-center text-lg font-semibold shrink-0 ring-4 ring-white shadow-md shadow-slate-200/50">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-900 truncate">{authUser?.name}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{authUser?.email}</p>
                        <span className="inline-block mt-2 text-[9px] font-semibold uppercase tracking-widest text-[#A68868] bg-[#A68868]/10 px-2.5 py-0.5 rounded-full">
                            {authUser?.role || 'Member'}
                        </span>
                    </div>
                </div>

                {/* ───────── Status message ───────── */}
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            'p-4 rounded-2xl flex items-center gap-3 text-sm font-medium',
                            message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                        )}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </motion.div>
                )}

                {/* ───────── Profile section ───────── */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 p-8 lg:p-10"
                >
                    <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-50">
                        <div className="w-10 h-10 bg-[#071739]/5 text-[#071739] rounded-xl flex items-center justify-center">
                            <UserIcon size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Personal Information</h3>
                            <p className="text-xs text-slate-400 font-medium">How your details appear across EduFlow.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Full name" icon={<UserIcon size={16} />}>
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    placeholder="Your name"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all"
                                />
                            </Field>
                            <Field label="Email address" icon={<Mail size={16} />}>
                                <input
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all"
                                />
                            </Field>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updatingAccount}
                                className="inline-flex items-center gap-2 px-7 py-3 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15 disabled:opacity-50"
                            >
                                {updatingAccount ? <RefreshCcw className="animate-spin" size={14} /> : <Save size={14} />}
                                Save changes
                            </button>
                        </div>
                    </form>
                </motion.section>

                {/* ───────── Security section ───────── */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-slate-100 p-8 lg:p-10"
                >
                    <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-50">
                        <div className="w-10 h-10 bg-[#A68868]/10 text-[#A68868] rounded-xl flex items-center justify-center">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Security</h3>
                            <p className="text-xs text-slate-400 font-medium">Update your password regularly to keep your account safe.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <Field label="Current password" icon={<Key size={16} />}>
                            <input
                                type={showPwd.current ? 'text' : 'password'}
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all"
                            />
                            <ToggleEye visible={showPwd.current} onClick={() => setShowPwd(s => ({ ...s, current: !s.current }))} />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="New password" icon={<Key size={16} />}>
                                <input
                                    type={showPwd.next ? 'text' : 'password'}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    placeholder="At least 6 characters"
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all"
                                />
                                <ToggleEye visible={showPwd.next} onClick={() => setShowPwd(s => ({ ...s, next: !s.next }))} />
                            </Field>
                            <Field label="Confirm new password" icon={<Key size={16} />}>
                                <input
                                    type={showPwd.confirm ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    placeholder="Re-enter new password"
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all"
                                />
                                <ToggleEye visible={showPwd.confirm} onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))} />
                            </Field>
                        </div>

                        {/* Password strength hint */}
                        {passwords.newPassword && (
                            <PasswordStrength value={passwords.newPassword} />
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updatingAccount || !passwords.currentPassword || !passwords.newPassword}
                                className="inline-flex items-center gap-2 px-7 py-3 bg-[#A68868] hover:bg-[#8a7152] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#A68868]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingAccount ? <RefreshCcw className="animate-spin" size={14} /> : <Shield size={14} />}
                                Update password
                            </button>
                            <p className="text-[11px] text-slate-400 font-medium mt-3">
                                You'll be logged out after changing your password and asked to sign in again.
                            </p>
                        </div>
                    </form>
                </motion.section>
            </div>
        </DashboardLayout>
    );
}

// ────────────────────────────────────────────────────────────────────
// Field wrapper — consistent label + icon-prefixed input
// ────────────────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {icon}
                </span>
                {children}
            </div>
        </div>
    );
}

function ToggleEye({ visible, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#071739] hover:bg-slate-100 rounded-lg transition-all"
            aria-label={visible ? 'Hide password' : 'Show password'}
        >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
    );
}

function PasswordStrength({ value }) {
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 10) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const tone = score <= 1 ? 'rose' : score <= 3 ? 'amber' : 'emerald';
    const label = score <= 1 ? 'Weak' : score <= 3 ? 'Decent' : 'Strong';

    const bg = tone === 'rose' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';
    const text = tone === 'rose' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-emerald-600';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest">
                <span className="text-slate-400">Password strength</span>
                <span className={text}>{label}</span>
            </div>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className={clsx(
                            'h-1 flex-1 rounded-full transition-all',
                            i <= score ? bg : 'bg-slate-100'
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
