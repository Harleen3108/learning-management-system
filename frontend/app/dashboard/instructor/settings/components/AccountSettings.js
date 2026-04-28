'use client';

export default function AccountSettings({ data, setData }) {
    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div>
                <h2 className="text-2xl font-semibold text-slate-900">Account Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your contact information and regional settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                        type="email"
                        disabled
                        value={data.user.email}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm text-slate-400 cursor-not-allowed outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 px-1 mt-1">Email cannot be changed directly.</p>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                    <input 
                        type="tel"
                        value={data.settings.account.phone}
                        onChange={e => setData(prev => ({ ...prev, settings: { ...prev.settings, account: { ...prev.settings.account, phone: e.target.value } } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-1">Country</label>
                    <select 
                        value={data.settings.account.country}
                        onChange={e => setData(prev => ({ ...prev, settings: { ...prev.settings, account: { ...prev.settings.account, country: e.target.value } } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-1">Timezone</label>
                    <select 
                        value={data.settings.account.timezone}
                        onChange={e => setData(prev => ({ ...prev, settings: { ...prev.settings, account: { ...prev.settings.account, timezone: e.target.value } } }))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="UTC">UTC - Universal Time Coordinated</option>
                        <option value="EST">EST - Eastern Standard Time</option>
                        <option value="PST">PST - Pacific Standard Time</option>
                        <option value="IST">IST - Indian Standard Time</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
