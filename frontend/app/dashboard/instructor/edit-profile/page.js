'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/services/api';
import { clsx } from 'clsx';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import { 
    User, 
    Mail, 
    Phone, 
    Globe, 
    Linkedin, 
    Twitter, 
    Youtube, 
    Camera, 
    Save, 
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        instructorBio: '',
        instructorSpecialty: '',
        profilePhoto: '',
        socialLinks: {
            website: '',
            linkedin: '',
            twitter: '',
            youtube: ''
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                const user = res.data.data;
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    instructorBio: user.instructorBio || '',
                    instructorSpecialty: user.instructorSpecialty || '',
                    profilePhoto: user.profilePhoto || '',
                    socialLinks: user.socialLinks || {
                        website: '',
                        linkedin: '',
                        twitter: '',
                        youtube: ''
                    }
                });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPhoto(true);
        setError('');

        try {
            // 1. Get signature from backend
            const timestamp = Math.round(new Date().getTime() / 1000);
            const folder = 'profile_photos';
            const paramsToSign = { timestamp, folder };

            const sigRes = await api.post('/courses/upload-signature', { paramsToSign });
            const { signature, apiKey, cloudName } = sigRes.data.data;

            // 2. Upload to Cloudinary
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('api_key', apiKey);
            uploadFormData.append('timestamp', timestamp);
            uploadFormData.append('signature', signature);
            uploadFormData.append('folder', folder);

            const cloudinaryRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                uploadFormData
            );

            setFormData({ ...formData, profilePhoto: cloudinaryRes.data.secure_url });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await api.put('/instructors/profile', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#071739]" size={32} />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-10">
                <header>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your identity and how students see you.</p>
                </header>

                {success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 flex items-center gap-3 font-bold"
                    >
                        <CheckCircle2 size={20} />
                        Profile updated successfully!
                    </motion.div>
                )}

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex items-center gap-3 font-bold">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Avatar & Basic Info */}
                        <Card className="p-8 space-y-8 flex flex-col items-center">
                            <div className="relative group">
                                <div 
                                    className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden relative cursor-pointer"
                                    onClick={() => document.getElementById('photo-upload').click()}
                                >
                                    <img 
                                        src={formData.profilePhoto === 'no-photo.jpg' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}` : formData.profilePhoto} 
                                        alt="Profile" 
                                        className={clsx("w-full h-full object-cover transition-opacity", uploadingPhoto && "opacity-20")}
                                    />
                                    <div className={clsx(
                                        "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center",
                                        uploadingPhoto ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        {uploadingPhoto ? (
                                            <Loader2 className="text-white animate-spin" size={32} />
                                        ) : (
                                            <Camera className="text-white" size={32} />
                                        )}
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    id="photo-upload" 
                                    hidden 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#071739] rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white">
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                            
                            <div className="w-full space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Profile Photo URL</label>
                                <input 
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#071739] transition-all font-medium text-slate-800 text-sm"
                                    placeholder="https://..."
                                    value={formData.profilePhoto}
                                    onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                                />
                            </div>
                        </Card>

                        {/* General Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-8 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <User size={16} className="text-[#071739]" />
                                    General Information
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input 
                                            type="text"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#071739] transition-all font-medium text-slate-800 text-sm"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="email"
                                                readOnly
                                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none cursor-not-allowed opacity-60 font-medium text-slate-800 text-sm"
                                                value={formData.email}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="tel"
                                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800 text-sm"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Title</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g. Senior Software Architect"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#071739] transition-all font-medium text-slate-800 text-sm"
                                            value={formData.instructorSpecialty}
                                            onChange={(e) => setFormData({ ...formData, instructorSpecialty: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                                    <textarea 
                                        rows="4"
                                        placeholder="Tell students about your journey and expertise..."
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800 text-sm resize-none"
                                        value={formData.instructorBio}
                                        onChange={(e) => setFormData({ ...formData, instructorBio: e.target.value })}
                                    />
                                </div>
                            </Card>

                            {/* Social Links */}
                            <Card className="p-8 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <Globe size={16} className="text-[#071739]" />
                                    Social Presence
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="url"
                                                placeholder="https://..."
                                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800 text-sm"
                                                value={formData.socialLinks.website}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    socialLinks: { ...formData.socialLinks, website: e.target.value } 
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn Profile</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="url"
                                                placeholder="https://linkedin.com/in/..."
                                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800 text-sm"
                                                value={formData.socialLinks.linkedin}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value } 
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Twitter (X)</label>
                                        <div className="relative">
                                            <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="url"
                                                placeholder="https://twitter.com/..."
                                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800 text-sm"
                                                value={formData.socialLinks.twitter}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    socialLinks: { ...formData.socialLinks, twitter: e.target.value } 
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube Channel</label>
                                        <div className="relative">
                                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="url"
                                                placeholder="https://youtube.com/@..."
                                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all font-medium text-slate-800 text-sm"
                                                value={formData.socialLinks.youtube}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    socialLinks: { ...formData.socialLinks, youtube: e.target.value } 
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-10 py-4 bg-[#071739] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
