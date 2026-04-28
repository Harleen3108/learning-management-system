'use client';
import { Check } from 'lucide-react';

export default function CoursePreferences({ data, setData }) {
    const { defaultVisibility, defaultLanguage, defaultPricing, discussionsEnabled, reviewsEnabled } = data.settings.coursePreferences;

    const handleChange = (field, value) => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                coursePreferences: {
                    ...prev.settings.coursePreferences,
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Course Preferences</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Set default configurations for newly created courses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Visibility</label>
                    <select 
                        value={defaultVisibility}
                        onChange={e => handleChange('defaultVisibility', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="draft">Draft (Private)</option>
                        <option value="public">Published (Public)</option>
                        <option value="private">Invite Only</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Language</label>
                    <select 
                        value={defaultLanguage}
                        onChange={e => handleChange('defaultLanguage', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Pricing Strategy</label>
                    <select 
                        value={defaultPricing}
                        onChange={e => handleChange('defaultPricing', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="paid">Paid Course</option>
                        <option value="free">Free Course</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Enable Discussions by Default</h4>
                        <p className="text-xs font-medium text-slate-400 mt-1">Allow students to participate in Q&A on new courses.</p>
                    </div>
                    <button 
                        onClick={() => handleChange('discussionsEnabled', !discussionsEnabled)}
                        className={`w-14 h-8 rounded-full flex items-center transition-all px-1 ${discussionsEnabled ? 'bg-[#071739] justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                            {discussionsEnabled && <Check size={14} className="text-[#071739]" />}
                        </div>
                    </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Enable Reviews by Default</h4>
                        <p className="text-xs font-medium text-slate-400 mt-1">Allow students to leave ratings and reviews.</p>
                    </div>
                    <button 
                        onClick={() => handleChange('reviewsEnabled', !reviewsEnabled)}
                        className={`w-14 h-8 rounded-full flex items-center transition-all px-1 ${reviewsEnabled ? 'bg-[#071739] justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                            {reviewsEnabled && <Check size={14} className="text-[#071739]" />}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
