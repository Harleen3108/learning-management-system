'use client';
import { Video, Calendar, Cloud, CheckCircle2 } from 'lucide-react';

export default function IntegrationSettings({ data, setData }) {
    const { zoomConnected, googleMeetConnected, calendarSync } = data.settings.integrations;

    const toggleIntegration = (field) => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                integrations: {
                    ...prev.settings.integrations,
                    [field]: !prev.settings.integrations[field]
                }
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div>
                <h2 className="text-2xl font-semibold text-slate-900">Integrations</h2>
                <p className="text-sm text-slate-500 mt-1">Connect your favorite tools to streamline your teaching experience.</p>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Video size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-slate-900">Zoom</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Automatically generate Zoom meetings for your Live Classes and sync attendance.</p>
                        </div>
                    </div>
                    {zoomConnected ? (
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-medium uppercase tracking-widest"><CheckCircle2 size={16}/> Connected</span>
                            <button onClick={() => toggleIntegration('zoomConnected')} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 uppercase tracking-widest underline underline-offset-4">Disconnect</button>
                        </div>
                    ) : (
                        <button onClick={() => toggleIntegration('zoomConnected')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-600/20">
                            Connect Zoom
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Video size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-slate-900">Google Meet</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Use Google Meet for your interactive sessions. Integrates seamlessly with Calendar.</p>
                        </div>
                    </div>
                    {googleMeetConnected ? (
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-medium uppercase tracking-widest"><CheckCircle2 size={16}/> Connected</span>
                            <button onClick={() => toggleIntegration('googleMeetConnected')} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 uppercase tracking-widest underline underline-offset-4">Disconnect</button>
                        </div>
                    ) : (
                        <button onClick={() => toggleIntegration('googleMeetConnected')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                            Connect Google
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-slate-900">Calendar Sync</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Sync your course schedules, due dates, and live sessions with Google or Apple Calendar.</p>
                        </div>
                    </div>
                    {calendarSync ? (
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-medium uppercase tracking-widest"><CheckCircle2 size={16}/> Connected</span>
                            <button onClick={() => toggleIntegration('calendarSync')} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 uppercase tracking-widest underline underline-offset-4">Disconnect</button>
                        </div>
                    ) : (
                        <button onClick={() => toggleIntegration('calendarSync')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                            Enable Sync
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-[#071739]/5 text-[#071739] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Cloud size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-slate-900">Cloudinary</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Your video and image storage is already pre-configured and managed by the LMS admin.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-medium uppercase tracking-widest"><CheckCircle2 size={16}/> System Linked</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
