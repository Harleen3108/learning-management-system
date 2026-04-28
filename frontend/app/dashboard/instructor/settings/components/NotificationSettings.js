'use client';
import { Check } from 'lucide-react';

export default function NotificationSettings({ data, setData }) {
    const alerts = [
        { id: 'enrollments', label: 'New Enrollments', desc: 'Get notified when a student enrolls in your course.' },
        { id: 'reviews', label: 'Course Reviews', desc: 'Get notified when someone leaves a review.' },
        { id: 'assignments', label: 'Assignment Submissions', desc: 'Get notified when a student submits an assignment.' },
        { id: 'qna', label: 'Q&A Questions', desc: 'Get notified when a student asks a question.' },
        { id: 'announcements', label: 'Platform Announcements', desc: 'Receive important updates from the LMS.' }
    ];

    const toggleAlert = (id) => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                notifications: {
                    ...prev.settings.notifications,
                    emailAlerts: {
                        ...prev.settings.notifications.emailAlerts,
                        [id]: !prev.settings.notifications.emailAlerts[id]
                    }
                }
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Notification Settings</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Control which email alerts you receive.</p>
            </div>

            <div className="space-y-4">
                {alerts.map(alert => {
                    const isActive = data.settings.notifications.emailAlerts[alert.id];
                    return (
                        <div key={alert.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{alert.label}</h4>
                                <p className="text-xs font-medium text-slate-400 mt-1">{alert.desc}</p>
                            </div>
                            <button 
                                onClick={() => toggleAlert(alert.id)}
                                className={`w-14 h-8 rounded-full flex items-center transition-all px-1 ${isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
                            >
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    {isActive && <Check size={14} className="text-emerald-500" />}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
