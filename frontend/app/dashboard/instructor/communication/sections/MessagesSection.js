'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon,
  User,
  Send,
  Loader2,
  Inbox as InboxIcon,
  Users as UsersIcon,
  MessageSquare,
  BookOpen,
  Mail
} from 'lucide-react';
import api from '@/services/api';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/useAuthStore';

// EduFlow palette: navy #071739, tan #A68868. font-semibold/font-medium typography.
//
// Two views in one component:
//   • Inbox    → shows every thread (course-scoped + direct) the instructor is part of.
//   • By Course → existing flow: pick a course, see enrolled students, chat.

export default function MessagesSection({ selectedCourse }) {
    const me = useAuthStore.getState().user;
    const myId = me?._id;

    const [mode, setMode] = useState('inbox'); // 'inbox' | 'course'
    const [searchTerm, setSearchTerm] = useState('');

    // Inbox-mode state: list of collapsed threads
    const [threads, setThreads] = useState([]);
    const [loadingThreads, setLoadingThreads] = useState(false);
    const [activeThread, setActiveThread] = useState(null);

    // Course-mode state (legacy)
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [activeStudent, setActiveStudent] = useState(null);

    // Shared chat-window state
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // ── Inbox mode ──
    useEffect(() => {
        if (mode === 'inbox') fetchThreads();
    }, [mode]);

    const fetchThreads = async () => {
        setLoadingThreads(true);
        try {
            const res = await api.get('/communication/threads');
            setThreads(res.data?.data || []);
        } catch (err) {
            console.error('fetchThreads:', err);
        } finally {
            setLoadingThreads(false);
        }
    };

    // ── Course mode ──
    useEffect(() => {
        if (mode === 'course' && selectedCourse && selectedCourse !== 'all') {
            fetchStudents();
        } else if (mode === 'course') {
            setStudents([]);
            setActiveStudent(null);
        }
    }, [mode, selectedCourse]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await api.get(`/communication/students?courseId=${selectedCourse}`);
            setStudents(res.data?.data || []);
        } catch (err) {
            console.error('fetchStudents:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    // ── Load messages whenever the active thread/student changes ──
    useEffect(() => {
        if (mode === 'inbox' && activeThread) {
            loadMessagesByConversationId(activeThread.conversationId);
        } else if (mode === 'course' && activeStudent && selectedCourse !== 'all') {
            const convId = [selectedCourse, activeStudent._id, myId].sort().join('-');
            loadMessagesByConversationId(convId);
        } else {
            setMessages([]);
        }
    }, [mode, activeThread, activeStudent, selectedCourse]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const loadMessagesByConversationId = async (conversationId) => {
        setLoadingMessages(true);
        try {
            const res = await api.get(`/communication/messages?conversationId=${conversationId}`);
            setMessages(res.data?.data || []);
            // Mark as read so the unread badge clears
            api.post(`/communication/threads/${conversationId}/read`).catch(() => {});
        } catch (err) {
            console.error('loadMessagesByConversationId:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Build the chat-header context (peer + course label)
    const chatPeer = mode === 'inbox' ? activeThread?.peer : activeStudent;
    const chatKind = mode === 'inbox' ? activeThread?.kind : 'course';
    const chatCourseTitle = mode === 'inbox' ? activeThread?.course?.title : null;
    const chatCourseId = mode === 'inbox' ? activeThread?.course?._id : selectedCourse;

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!messageText.trim() || sending || !chatPeer) return;
        setSending(true);
        try {
            const payload = {
                recipientId: chatPeer._id,
                text: messageText.trim()
            };
            // Course-scoped sends still pass courseId; direct replies leave it out
            if (chatKind === 'course' && chatCourseId && chatCourseId !== 'all') {
                payload.courseId = chatCourseId;
            }
            const res = await api.post('/communication/messages', payload);
            const newMsg = res.data?.data;
            // Hydrate sender shape so render works without a full reload
            setMessages(prev => [...prev, { ...newMsg, sender: { _id: myId, name: me?.name, profilePhoto: me?.profilePhoto } }]);
            setMessageText('');
            // Refresh thread list so this thread bubbles to top
            if (mode === 'inbox') fetchThreads();
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    // ── Filtering ──
    const filteredThreads = threads.filter(t => {
        const q = searchTerm.toLowerCase();
        return !q || t.peer?.name?.toLowerCase().includes(q) || t.peer?.email?.toLowerCase().includes(q) || t.course?.title?.toLowerCase().includes(q);
    });
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex h-[650px]">
            {/* ─── Left: thread / student list ─── */}
            <div className="w-[340px] border-r border-slate-100 flex flex-col bg-slate-50/30">
                {/* Mode toggle */}
                <div className="p-5 border-b border-slate-100">
                    <div className="grid grid-cols-2 bg-white border border-slate-100 rounded-xl p-1 mb-4">
                        <button
                            onClick={() => { setMode('inbox'); setActiveStudent(null); }}
                            className={clsx(
                                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-widest transition-all',
                                mode === 'inbox' ? 'bg-[#071739] text-white' : 'text-slate-500 hover:text-[#071739]'
                            )}
                        >
                            <InboxIcon size={12} /> Inbox
                        </button>
                        <button
                            onClick={() => { setMode('course'); setActiveThread(null); }}
                            className={clsx(
                                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-widest transition-all',
                                mode === 'course' ? 'bg-[#071739] text-white' : 'text-slate-500 hover:text-[#071739]'
                            )}
                        >
                            <UsersIcon size={12} /> By course
                        </button>
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder={mode === 'inbox' ? 'Search threads…' : 'Search students…'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 py-2.5 pl-9 pr-3 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 focus:border-[#071739]/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
                    {mode === 'inbox' ? (
                        loadingThreads ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#071739]" /></div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <MessageSquare size={28} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-xs font-semibold text-slate-500">No conversations yet</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">Messages from students will appear here.</p>
                            </div>
                        ) : (
                            filteredThreads.map(t => {
                                const isActive = activeThread?.conversationId === t.conversationId;
                                return (
                                    <button
                                        key={t.conversationId}
                                        onClick={() => setActiveThread(t)}
                                        className={clsx(
                                            'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left',
                                            isActive ? 'bg-[#071739] text-white shadow-md' : 'hover:bg-white text-slate-700'
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                                            <img src={t.peer?.profilePhoto || `https://ui-avatars.com/api/?name=${t.peer?.name || 'Student'}&background=071739&color=fff`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={clsx('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-900')}>
                                                    {t.peer?.name || 'Student'}
                                                </p>
                                                {t.kind === 'direct' && (
                                                    <span className={clsx(
                                                        'text-[8px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded',
                                                        isActive ? 'bg-white/20 text-white' : 'bg-[#A68868]/15 text-[#A68868]'
                                                    )}>Direct</span>
                                                )}
                                            </div>
                                            <p className={clsx('text-[11px] font-medium truncate mt-0.5', isActive ? 'text-white/70' : 'text-slate-400')}>
                                                {t.lastMessage?.fromMe ? 'You: ' : ''}{t.lastMessage?.text || ''}
                                            </p>
                                            {t.kind === 'course' && t.course?.title && (
                                                <p className={clsx('text-[10px] font-medium truncate mt-0.5 inline-flex items-center gap-1', isActive ? 'text-white/60' : 'text-slate-400')}>
                                                    <BookOpen size={10} /> {t.course.title}
                                                </p>
                                            )}
                                        </div>
                                        {t.unread > 0 && (
                                            <span className={clsx(
                                                'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                                isActive ? 'bg-white text-[#071739]' : 'bg-[#A68868] text-white'
                                            )}>
                                                {t.unread}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )
                    ) : (
                        // By-course mode
                        selectedCourse === 'all' ? (
                            <div className="px-6 py-12 text-center">
                                <UsersIcon size={28} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-xs font-semibold text-slate-500">Pick a course</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">Use the selector at the top to view that course's enrolled students.</p>
                            </div>
                        ) : loadingStudents ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#071739]" /></div>
                        ) : filteredStudents.length === 0 ? (
                            <p className="px-6 text-xs text-slate-400 font-medium text-center mt-10">No students found</p>
                        ) : (
                            filteredStudents.map((student) => {
                                const isActive = activeStudent?._id === student._id;
                                return (
                                    <button
                                        key={student._id}
                                        onClick={() => setActiveStudent(student)}
                                        className={clsx(
                                            'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left',
                                            isActive ? 'bg-[#071739] text-white shadow-md' : 'hover:bg-white text-slate-700'
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                                            <img src={student.profilePhoto || `https://ui-avatars.com/api/?name=${student.name}&background=071739&color=fff`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-900')}>{student.name}</p>
                                            <p className={clsx('text-[11px] font-medium truncate', isActive ? 'text-white/70' : 'text-slate-400')}>{student.email}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )
                    )}
                </div>
            </div>

            {/* ─── Right: chat window ─── */}
            <div className="flex-1 flex flex-col bg-white">
                {chatPeer ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                                    <img src={chatPeer.profilePhoto || `https://ui-avatars.com/api/?name=${chatPeer.name}&background=071739&color=fff`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{chatPeer.name}</p>
                                    <p className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1.5">
                                        {chatKind === 'direct' ? (
                                            <><Mail size={10} className="text-[#A68868]" /> Direct message</>
                                        ) : chatCourseTitle ? (
                                            <><BookOpen size={10} className="text-[#A68868]" /> {chatCourseTitle}</>
                                        ) : (
                                            chatPeer.email
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 custom-scrollbar">
                            {loadingMessages ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#071739]" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                                    <MessageSquare size={32} className="text-slate-200" />
                                    <p className="text-sm font-semibold text-slate-500">No messages yet — say hi!</p>
                                </div>
                            ) : (
                                messages.map(m => {
                                    const fromMe = String(m.sender?._id) === String(myId);
                                    return (
                                        <div key={m._id} className={clsx('flex', fromMe ? 'justify-end' : 'justify-start')}>
                                            <div className={clsx(
                                                'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed',
                                                fromMe
                                                    ? 'bg-[#071739] text-white rounded-br-sm'
                                                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                                            )}>
                                                {m.text}
                                                <p className={clsx(
                                                    'text-[10px] font-medium mt-1.5',
                                                    fromMe ? 'text-white/60' : 'text-slate-400'
                                                )}>
                                                    {new Date(m.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Type a reply…"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!messageText.trim() || sending}
                                className="w-11 h-11 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                            <User size={28} />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Select a conversation</p>
                        <p className="text-sm font-medium text-slate-500 mt-1 max-w-xs">
                            Pick a thread from the left to read or reply.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
