'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  BookOpen, 
  Shield, 
  Link as LinkIcon,
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';

import ProfileSettings from './components/ProfileSettings';
import AccountSettings from './components/AccountSettings';
import PayoutSettings from './components/PayoutSettings';
import NotificationSettings from './components/NotificationSettings';
import CoursePreferences from './components/CoursePreferences';
import SecuritySettings from './components/SecuritySettings';
import IntegrationSettings from './components/IntegrationSettings';

export default function InstructorSettingsPage() {
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Master state for settings and user
    const [data, setData] = useState({
        settings: {
            profile: { displayName: '', headline: '', bio: '', expertise: [], language: 'English', socialLinks: { website: '', linkedin: '', twitter: '', youtube: '' } },
            account: { phone: '', country: 'United States', timezone: 'UTC' },
            payout: { method: 'Bank Transfer', details: { accountName: '', accountNumber: '', routingNumber: '', bankName: '', upiId: '', paypalEmail: '' }, taxInfo: { taxId: '', taxCountry: '' } },
            notifications: { emailAlerts: { enrollments: true, reviews: true, assignments: true, qna: true, announcements: true } },
            coursePreferences: { defaultVisibility: 'draft', defaultLanguage: 'English', defaultPricing: 'paid', discussionsEnabled: true, reviewsEnabled: true },
            integrations: { zoomConnected: false, googleMeetConnected: false, calendarSync: false }
        },
        user: {
            name: '',
            email: '',
            profilePhoto: '',
            instructorBio: '',
            socialLinks: {}
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/instructor-settings');
                if (res.data.data) {
                    setData(prev => {
                        const fetchedSettings = res.data.data.settings || {};
                        const fetchedUser = res.data.data.user || {};
                        return {
                            settings: {
                                profile: { ...prev.settings.profile, ...(fetchedSettings.profile || {}) },
                                account: { ...prev.settings.account, ...(fetchedSettings.account || {}) },
                                payout: { 
                                    ...prev.settings.payout, 
                                    ...(fetchedSettings.payout || {}),
                                    details: { ...prev.settings.payout.details, ...(fetchedSettings.payout?.details || {}) },
                                    taxInfo: { ...prev.settings.payout.taxInfo, ...(fetchedSettings.payout?.taxInfo || {}) }
                                },
                                notifications: { 
                                    ...prev.settings.notifications, 
                                    ...(fetchedSettings.notifications || {}),
                                    emailAlerts: { ...prev.settings.notifications.emailAlerts, ...(fetchedSettings.notifications?.emailAlerts || {}) }
                                },
                                coursePreferences: { ...prev.settings.coursePreferences, ...(fetchedSettings.coursePreferences || {}) },
                                integrations: { ...prev.settings.integrations, ...(fetchedSettings.integrations || {}) }
                            },
                            user: { ...prev.user, ...fetchedUser }
                        };
                    });
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/instructor-settings', data);
            if (res.data.data) {
                setData(prev => {
                    const fetchedSettings = res.data.data.settings || {};
                    const fetchedUser = res.data.data.user || {};
                    return {
                        settings: {
                            profile: { ...prev.settings.profile, ...(fetchedSettings.profile || {}) },
                            account: { ...prev.settings.account, ...(fetchedSettings.account || {}) },
                            payout: { 
                                ...prev.settings.payout, 
                                ...(fetchedSettings.payout || {}),
                                details: { ...prev.settings.payout.details, ...(fetchedSettings.payout?.details || {}) },
                                taxInfo: { ...prev.settings.payout.taxInfo, ...(fetchedSettings.payout?.taxInfo || {}) }
                            },
                            notifications: { 
                                ...prev.settings.notifications, 
                                ...(fetchedSettings.notifications || {}),
                                emailAlerts: { ...prev.settings.notifications.emailAlerts, ...(fetchedSettings.notifications?.emailAlerts || {}) }
                            },
                            coursePreferences: { ...prev.settings.coursePreferences, ...(fetchedSettings.coursePreferences || {}) },
                            integrations: { ...prev.settings.integrations, ...(fetchedSettings.integrations || {}) }
                        },
                        user: { ...prev.user, ...fetchedUser }
                    };
                });
            }
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'Profile', icon: User, desc: 'Public identity' },
        { id: 'account', label: 'Account', icon: Settings, desc: 'Basic info & region' },
        { id: 'payout', label: 'Payout', icon: CreditCard, desc: 'Earnings & bank info' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email alerts' },
        { id: 'course', label: 'Course Preferences', icon: BookOpen, desc: 'Default settings' },
        { id: 'security', label: 'Security', icon: Shield, desc: 'Password & access' },
        { id: 'integrations', label: 'Integrations', icon: LinkIcon, desc: 'Zoom, Meet, etc.' }
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-[#071739]" size={40} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Settings Control Center</h1>
                        <p className="text-slate-500 mt-1">Manage your account preferences, payouts, and integrations.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl border border-emerald-100 font-medium text-xs uppercase tracking-widest"
                                >
                                    <CheckCircle2 size={16} /> Saved
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-[#071739] text-white px-8 py-4 rounded-[1.5rem] font-medium text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-4 sticky top-10 shadow-sm">
                            <div className="space-y-2">
                                {sections.map(section => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left group ${isActive ? 'bg-[#071739] text-white shadow-xl shadow-slate-900/10' : 'hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-[#071739] group-hover:bg-[#071739]/5'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-900'}`}>{section.label}</p>
                                                <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>{section.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 md:p-14"
                            >
                                {activeSection === 'profile' && <ProfileSettings data={data} setData={setData} />}
                                {activeSection === 'account' && <AccountSettings data={data} setData={setData} />}
                                {activeSection === 'payout' && <PayoutSettings data={data} setData={setData} />}
                                {activeSection === 'notifications' && <NotificationSettings data={data} setData={setData} />}
                                {activeSection === 'course' && <CoursePreferences data={data} setData={setData} />}
                                {activeSection === 'security' && <SecuritySettings data={data} setData={setData} />}
                                {activeSection === 'integrations' && <IntegrationSettings data={data} setData={setData} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
