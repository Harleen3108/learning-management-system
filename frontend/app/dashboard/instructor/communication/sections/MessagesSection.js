'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Send, 
  Search as SearchIcon, 
  MoreVertical,
  Loader2,
  Phone,
  Video,
  Info,
  Circle
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesSection({ selectedCourse, courses }) {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStudent, setActiveStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedCourse !== 'all') {
            fetchStudents();
        } else {
            setStudents([]);
            setActiveStudent(null);
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (activeStudent) {
            fetchMessages();
        }
    }, [activeStudent]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await api.get(`/communication/students?courseId=${selectedCourse}`);
            setStudents(res.data.data);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            // Sort IDs to ensure consistent conversation ID
            // In a real app, I'd get the current user ID from state or context
            const meRes = await api.get('/auth/me');
            const myId = meRes.data.data._id;
            const convId = [selectedCourse, activeStudent._id, myId].sort().join('-');
            const res = await api.get(`/communication/messages?conversationId=${convId}`);
            setMessages(res.data.data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!messageText.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post('/communication/messages', {
                courseId: selectedCourse,
                recipientId: activeStudent._id,
                text: messageText
            });
            setMessages([...messages, res.data.data]);
            setMessageText('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex h-[650px]">
            {/* Sidebar: Student List */}
            <div className="w-[350px] border-r border-slate-50 flex flex-col bg-slate-50/30">
                <div className="p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Enrolled Students</h3>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search students..."
                            className="w-full bg-white border border-slate-100 py-3.5 pl-12 pr-4 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1 custom-scrollbar">
                    {selectedCourse === 'all' ? (
                        <div className="px-6 py-10 text-center space-y-3">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto shadow-sm">
                                <Info size={24} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                Select a specific course to <br/> view enrolled students
                            </p>
                        </div>
                    ) : loadingStudents ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#071739]" /></div>
                    ) : filteredStudents.length === 0 ? (
                        <p className="px-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-10">No students found</p>
                    ) : (
                        filteredStudents.map((student) => (
                            <button
                                key={student._id}
                                onClick={() => setActiveStudent(student)}
                                className={clsx(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all group",
                                    activeStudent?._id === student._id 
                                        ? "bg-[#071739] text-white shadow-xl shadow-slate-900/10" 
                                        : "hover:bg-white text-slate-600 hover:shadow-lg"
                                )}
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 relative">
                                    <img src={student.profilePhoto || `https://ui-avatars.com/api/?name=${student.name}&background=071739&color=fff`} alt="" />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[11px] font-bold uppercase tracking-tight truncate">{student.name}</p>
                                    <p className={clsx(
                                        "text-[9px] font-medium truncate mt-0.5",
                                        activeStudent?._id === student._id ? "text-slate-300" : "text-slate-400"
                                    )}>{student.email}</p>
                                </div>
                                <div className={clsx(
                                    "w-1.5 h-1.5 rounded-full",
                                    activeStudent?._id === student._id ? "bg-[#A68868]" : "bg-transparent"
                                )}></div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {activeStudent ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                                    <img src={activeStudent.profilePhoto || `https://ui-avatars.com/api/?name=${activeStudent.name}&background=071739&color=fff`} alt="" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{activeStudent.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Circle className="text-emerald-500 fill-emerald-500" size={8} />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"><Phone size={18} /></button>
                                <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"><Video size={18} /></button>
                                <div className="w-px h-6 bg-slate-100 mx-1"></div>
                                <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/20">
                            {loadingMessages ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#071739]" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
                                    <MessageSquare size={48} className="text-slate-300 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No messages yet. Say hi!</p>
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <div 
                                        key={m._id} 
                                        className={clsx(
                                            "flex flex-col gap-1.5",
                                            m.sender._id === activeStudent._id ? "items-start" : "items-end"
                                        )}
                                    >
                                        <div className={clsx(
                                            "max-w-[70%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed",
                                            m.sender._id === activeStudent._id 
                                                ? "bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm" 
                                                : "bg-[#071739] text-white rounded-br-none shadow-xl shadow-slate-900/10"
                                        )}>
                                            {m.text}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-8 bg-white border-t border-slate-50">
                            <form 
                                onSubmit={handleSendMessage}
                                className="relative flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-[#071739]/20 focus-within:bg-white transition-all shadow-inner"
                            >
                                <input 
                                    type="text" 
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none py-3 px-6 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    disabled={!messageText.trim() || sending}
                                    className="w-12 h-12 bg-[#071739] text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/20">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-100 mb-8 shadow-xl shadow-slate-200">
                            <User size={48} />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900">Select a student</h3>
                        <p className="text-slate-400 font-medium mt-2 max-w-xs">Pick a student from the list to start a conversation or view message history.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
