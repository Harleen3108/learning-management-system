'use client';
import { Shield, Key, Smartphone, LogOut } from 'lucide-react';

export default function SecuritySettings() {
    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div>
                <h2 className="text-2xl font-semibold text-slate-900">Security Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Protect your instructor account and manage access.</p>
            </div>

            <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                            <Key size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-900">Password</h4>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">Change your password regularly to keep your account secure. Use a strong password.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm">
                        Change Password
                    </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-900">Two-Factor Authentication (2FA)</h4>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">Add an extra layer of security to your account by requiring a code from your phone.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-[#071739] text-white rounded-xl font-medium text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-sm">
                        Enable 2FA
                    </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-900">Active Sessions</h4>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">You are currently logged in on 1 device (Windows - Chrome). Sign out everywhere else.</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">
                        <LogOut size={14} /> Log out all
                    </button>
                </div>
            </div>
        </div>
    );
}
