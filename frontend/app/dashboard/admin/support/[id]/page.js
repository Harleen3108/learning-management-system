'use client';
import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Send, 
    Paperclip, 
    MoreVertical, 
    CheckCircle2, 
    MessageSquare, 
    User, 
    Clock, 
    Shield, 
    AlertCircle,
    RotateCcw,
    XCircle,
    Activity,
    Database,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function TicketDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchTicket = async () => {
        try {
            const res = await api.get(`/support/tickets/${id}`);
            setTicket(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch ticket:', err);
            router.push('/dashboard/admin/support');
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    const handleSend = async () => {
        if (!reply.trim()) return;
        setSending(true);
        try {
            await api.post(`/support/tickets/${id}/replies`, { message: reply });
            setReply('');
            fetchTicket();
        } catch (err) {
            alert('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleUpdate = async (updates) => {
        try {
            await api.put(`/support/tickets/${id}`, updates);
            fetchTicket();
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Decrypting transmission channel...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
                {/* Channel Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/dashboard/admin/support')}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">{ticket.subject}</h1>
                                <span className="text-[10px] font-mono text-slate-300 font-black">#{ticket._id.slice(-6)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Clock size={12} /> Established {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                                <span className={clsx(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                    ticket.status === 'Open' ? "text-rose-600 bg-rose-50 border-rose-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                                )}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <select 
                            className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 outline-none shadow-sm"
                            value={ticket.priority}
                            onChange={(e) => handleUpdate({ priority: e.target.value })}
                        >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                            <option value="Urgent">Urgent Alert</option>
                        </select>
                        <button 
                            onClick={() => handleUpdate({ status: 'Resolved' })}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-100 hover:-translate-y-1 transition-all"
                        >
                            <CheckCircle2 size={16} /> Mark Resolved
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex gap-8 min-h-0">
                    {/* Main Chat Flow */}
                    <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                        {/* Conversation Ledger */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide"
                        >
                            {/* Initial Description */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Transmission Body</p>
                                    <div className="bg-slate-50 text-slate-800 p-6 rounded-3xl rounded-tl-none border border-slate-100 text-[13px] font-bold leading-relaxed shadow-sm">
                                        {ticket.description}
                                    </div>
                                </div>
                            </div>

                            {ticket.messages.map((msg, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i} 
                                    className={clsx(
                                        "flex gap-4",
                                        msg.sender.role === 'admin' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm",
                                        msg.sender.role === 'admin' ? "bg-blue-600 border-blue-500 text-white" : "bg-white border-slate-100 text-slate-400"
                                    )}>
                                        <User size={20} />
                                    </div>
                                    <div className={clsx("max-w-lg space-y-1.5", msg.sender.role === 'admin' ? "text-right" : "text-left")}>
                                        <div className="flex items-center gap-2 justify-end flex-row-reverse">
                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{msg.sender.name}</span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={clsx(
                                            "p-5 rounded-3xl text-[13px] font-bold leading-relaxed shadow-sm border",
                                            msg.sender.role === 'admin' 
                                                ? "bg-slate-800 text-white border-slate-700 rounded-tr-none" 
                                                : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                                        )}>
                                            {msg.message}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Comms Link (Input) */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-2 flex items-end gap-2 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                                <button className="p-3 text-slate-300 hover:text-slate-600 transition-all">
                                    <Paperclip size={20} />
                                </button>
                                <textarea 
                                    className="flex-1 bg-transparent border-none outline-none p-3 text-sm font-bold resize-none min-h-[44px] max-h-32 text-slate-800 placeholder:text-slate-300"
                                    placeholder="Execute administrative response..."
                                    rows={1}
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={sending || !reply.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Meta/User Panel */}
                    <div className="w-80 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Origin Descriptor</h5>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 p-1">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${ticket.user?.name}&background=random&size=128`} 
                                        className="w-full h-full rounded-2xl shadow-inner" 
                                        alt="" 
                                    />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{ticket.user?.name}</h4>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{ticket.user?.role}</p>
                                </div>
                                <div className="grid grid-cols-2 w-full gap-2 mt-2">
                                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Status</p>
                                        <p className="text-[10px] font-bold text-slate-800">Verified</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">History</p>
                                        <p className="text-[10px] font-bold text-emerald-600">Clean</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase italic">Email</span>
                                    <span className="text-[11px] font-bold text-slate-800">{ticket.user?.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase italic">Category</span>
                                    <span className="text-[11px] font-bold text-blue-600">{ticket.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/50 rounded-[2rem] p-6 space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-slate-300" /> Resolution Directives
                            </h5>
                            <button 
                                onClick={() => handleUpdate({ status: 'Closed' })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest"
                            >
                                Terminate Session
                            </button>
                            <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed">Closing the session will archive the transmission and notify the origin user. Immutable logs will be retained.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
