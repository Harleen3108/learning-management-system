'use client';

export default function PayoutSettings({ data, setData }) {
    const payout = data.settings.payout || {};
    const method = payout.method || 'Bank Transfer';
    const details = payout.details || { accountName: '', accountNumber: '', routingNumber: '', bankName: '', upiId: '', paypalEmail: '' };
    const taxInfo = payout.taxInfo || { taxId: '', taxCountry: '' };

    const handleChange = (field, subfield, value) => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                payout: {
                    ...prev.settings.payout,
                    [field]: subfield ? { ...prev.settings.payout[field], [subfield]: value } : value
                }
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Payout Settings</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Configure how you want to receive your earnings.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payout Method</label>
                    <select 
                        value={method}
                        onChange={e => handleChange('method', null, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI (India Only)</option>
                        <option value="Stripe">Stripe</option>
                        <option value="PayPal">PayPal</option>
                    </select>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4 mb-4">Method Details</h3>
                    
                    {method === 'Bank Transfer' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Name</label>
                                <input 
                                    type="text" value={details.accountName} onChange={e => handleChange('details', 'accountName', e.target.value)}
                                    className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bank Name</label>
                                <input 
                                    type="text" value={details.bankName} onChange={e => handleChange('details', 'bankName', e.target.value)}
                                    className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                                <input 
                                    type="text" value={details.accountNumber} onChange={e => handleChange('details', 'accountNumber', e.target.value)}
                                    className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Routing Number / IFSC</label>
                                <input 
                                    type="text" value={details.routingNumber} onChange={e => handleChange('details', 'routingNumber', e.target.value)}
                                    className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {method === 'UPI' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">UPI ID</label>
                            <input 
                                type="text" placeholder="name@bank" value={details.upiId} onChange={e => handleChange('details', 'upiId', e.target.value)}
                                className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                            />
                        </div>
                    )}

                    {method === 'PayPal' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">PayPal Email</label>
                            <input 
                                type="email" value={details.paypalEmail} onChange={e => handleChange('details', 'paypalEmail', e.target.value)}
                                className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                            />
                        </div>
                    )}

                    {method === 'Stripe' && (
                        <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-sm font-bold border border-blue-100 flex justify-between items-center">
                            <span>Connect your Stripe account to receive automatic payouts.</span>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700">Connect</button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tax ID / PAN</label>
                        <input 
                            type="text" value={taxInfo.taxId} onChange={e => handleChange('taxInfo', 'taxId', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tax Country</label>
                        <input 
                            type="text" value={taxInfo.taxCountry} onChange={e => handleChange('taxInfo', 'taxCountry', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
