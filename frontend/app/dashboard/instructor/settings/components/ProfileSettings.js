'use client';
import { Camera, X } from 'lucide-react';
import Script from 'next/script';

export default function ProfileSettings({ data, setData }) {
    const handleUpload = () => {
        if (!window.cloudinary) {
            alert('Upload service is loading. Please try again in a moment.');
            return;
        }
        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: 'dtadnrc7n',
                uploadPreset: 'ml_default',
                sources: ['local', 'url'],
                multiple: false
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setData(prev => ({
                        ...prev,
                        user: { ...prev.user, profilePhoto: result.info.secure_url }
                    }));
                }
            }
        );
        widget.open();
    };

    const addExpertise = (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') {
            e.preventDefault();
            const newExpertise = e.target.value.trim();
            if (!data.settings.profile.expertise.includes(newExpertise)) {
                setData(prev => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        profile: {
                            ...prev.settings.profile,
                            expertise: [...prev.settings.profile.expertise, newExpertise]
                        }
                    }
                }));
            }
            e.target.value = '';
        }
    };

    const removeExpertise = (item) => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                profile: {
                    ...prev.settings.profile,
                    expertise: prev.settings.profile.expertise.filter(e => e !== item)
                }
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="afterInteractive" />
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage your public instructor identity.</p>
            </div>

            <div className="flex items-center gap-8">
                <div className="relative">
                    <img 
                        src={data.user.profilePhoto || '/no-photo.jpg'} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-3xl object-cover shadow-sm border border-slate-100"
                    />
                    <button 
                        onClick={handleUpload}
                        className="absolute -bottom-3 -right-3 p-3 bg-[#071739] text-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
                    >
                        <Camera size={18} />
                    </button>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Profile Picture</h3>
                    <p className="text-xs font-medium text-slate-400 max-w-xs mt-1">Upload a professional headshot to build trust with your students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                        type="text"
                        value={data.user.name}
                        onChange={e => setData(prev => ({ ...prev, user: { ...prev.user, name: e.target.value } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name (Optional)</label>
                    <input 
                        type="text"
                        value={data.settings.profile.displayName}
                        onChange={e => setData(prev => ({ ...prev, settings: { ...prev.settings, profile: { ...prev.settings.profile, displayName: e.target.value } } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Headline</label>
                    <input 
                        type="text"
                        placeholder="e.g. Senior Software Engineer at TechCorp"
                        value={data.settings.profile.headline}
                        onChange={e => setData(prev => ({ ...prev, settings: { ...prev.settings, profile: { ...prev.settings.profile, headline: e.target.value } } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bio / About Me</label>
                    <textarea 
                        rows={4}
                        value={data.user.instructorBio}
                        onChange={e => setData(prev => ({ ...prev, user: { ...prev.user, instructorBio: e.target.value } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teaching Expertise / Skills</label>
                    <div className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-wrap gap-2 items-center focus-within:ring-4 focus-within:ring-blue-600/5 transition-all">
                        {data.settings.profile.expertise.map(item => (
                            <span key={item} className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                                {item}
                                <button onClick={() => removeExpertise(item)} className="text-slate-400 hover:text-rose-500"><X size={14}/></button>
                            </span>
                        ))}
                        <input 
                            type="text"
                            placeholder="Type a skill and press Enter..."
                            onKeyDown={addExpertise}
                            className="flex-1 bg-transparent outline-none text-sm font-bold min-w-[200px] p-2"
                        />
                    </div>
                </div>

                {/* Social Links */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                    {['website', 'linkedin', 'twitter', 'youtube'].map(network => (
                        <div key={network} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{network}</label>
                            <input 
                                type="url"
                                placeholder={`https://${network}.com/...`}
                                value={data.user.socialLinks?.[network] || ''}
                                onChange={e => setData(prev => ({ 
                                    ...prev, 
                                    user: { 
                                        ...prev.user, 
                                        socialLinks: { ...prev.user.socialLinks, [network]: e.target.value } 
                                    } 
                                }))}
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
