'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, Video, BookOpen, ClipboardList, Plus, Trash2, Check,
    Paperclip, FileText, ListChecks, ChevronUp, ChevronDown, Loader2, AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

// EduFlow palette: navy #071739, tan #A68868. font-semibold/font-medium typography.
//
// Configures a single lesson regardless of type. Mirrors Coursera's content-block model:
//   • video       → upload + notes + downloads
//   • reading     → rich text body + estimated minutes + notes + downloads
//   • assignment  → questions, marks, attempts, passing %, notes/explanations
//
// Caller passes { lesson, onSave, onClose, onUpload }. We never mutate the parent's
// state directly — `onSave` receives the merged lesson object.

const TYPE_OPTIONS = [
    { id: 'video',      label: 'Video',      Icon: Video,         hint: 'Upload an MP4 or paste a hosted URL.' },
    { id: 'reading',    label: 'Reading',    Icon: BookOpen,      hint: 'Add formatted text, study notes or articles.' },
    { id: 'assignment', label: 'Assignment', Icon: ClipboardList, hint: 'Build a graded quiz with multiple-choice questions.' }
];

export default function LessonEditor({ lesson, onClose, onSave, onUploadVideo, onUploadAttachment, onUploadDownload }) {
    const [draft, setDraft] = useState(() => buildInitial(lesson));
    const [error, setError] = useState('');

    // Reset when a different lesson is opened
    useEffect(() => { setDraft(buildInitial(lesson)); setError(''); }, [lesson?.id]);

    const update = (k, v) => setDraft(d => ({ ...d, [k]: v }));

    const setType = (type) => {
        setDraft(d => {
            const next = { ...d, type };
            if (type === 'assignment' && !d.assignment) {
                next.assignment = { instructions: '', questions: [], maxAttempts: 5, passingScore: 50 };
            }
            return next;
        });
    };

    // ── Assignment helpers ──
    const addQuestion = () => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: [
                    ...(d.assignment?.questions || []),
                    {
                        id: `q_${Date.now()}`,
                        questionText: '',
                        options: [
                            { text: '', isCorrect: true },
                            { text: '', isCorrect: false }
                        ],
                        explanation: '',
                        marks: 1
                    }
                ]
            }
        }));
    };

    const updateQuestion = (qIdx, patch) => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: d.assignment.questions.map((q, i) => i === qIdx ? { ...q, ...patch } : q)
            }
        }));
    };

    const removeQuestion = (qIdx) => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: d.assignment.questions.filter((_, i) => i !== qIdx)
            }
        }));
    };

    const addOption = (qIdx) => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: d.assignment.questions.map((q, i) =>
                    i === qIdx ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q
                )
            }
        }));
    };

    const updateOption = (qIdx, oIdx, patch) => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: d.assignment.questions.map((q, i) =>
                    i === qIdx
                        ? {
                            ...q,
                            options: q.options.map((o, j) => {
                                if (j !== oIdx) return o;
                                return { ...o, ...patch };
                            })
                        }
                        : q
                )
            }
        }));
    };

    const setCorrect = (qIdx, oIdx) => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: d.assignment.questions.map((q, i) =>
                    i === qIdx
                        ? {
                            ...q,
                            options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx }))
                        }
                        : q
                )
            }
        }));
    };

    const removeOption = (qIdx, oIdx) => {
        setDraft(d => ({
            ...d,
            assignment: {
                ...d.assignment,
                questions: d.assignment.questions.map((q, i) =>
                    i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q
                )
            }
        }));
    };

    const totalMarks = draft.type === 'assignment'
        ? (draft.assignment?.questions || []).reduce((s, q) => s + (Number(q.marks) || 0), 0)
        : 0;

    // Validate and persist
    const handleSave = () => {
        setError('');
        if (!draft.title?.trim()) return setError('Lesson title is required.');
        if (draft.type === 'video' && !draft.videoUrl) {
            return setError('Upload a video or provide a video URL.');
        }
        if (draft.type === 'reading' && !draft.readingContent?.trim()) {
            return setError('Add reading content.');
        }
        if (draft.type === 'assignment') {
            const qs = draft.assignment?.questions || [];
            if (qs.length === 0) return setError('Add at least one question.');
            for (let i = 0; i < qs.length; i++) {
                const q = qs[i];
                if (!q.questionText?.trim()) return setError(`Question ${i + 1} is empty.`);
                if (q.options.length < 2) return setError(`Question ${i + 1} needs at least 2 options.`);
                if (!q.options.some(o => o.isCorrect)) return setError(`Question ${i + 1} needs a correct answer.`);
                if (q.options.some(o => !o.text?.trim())) return setError(`Question ${i + 1} has an empty option.`);
            }
        }
        onSave(draft);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">Lesson editor</p>
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Configure lesson</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Type picker */}
                    <Field label="Lesson type">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {TYPE_OPTIONS.map(opt => {
                                const active = draft.type === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setType(opt.id)}
                                        className={clsx(
                                            'flex flex-col items-start gap-1 p-3 rounded-2xl border-2 text-left transition-all',
                                            active ? 'border-[#071739] bg-[#071739]/5' : 'border-slate-100 hover:border-slate-200'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <opt.Icon size={16} className={active ? 'text-[#071739]' : 'text-slate-400'} />
                                            <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-medium leading-snug">{opt.hint}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </Field>

                    {/* Title */}
                    <Field label="Title" required>
                        <input
                            value={draft.title}
                            onChange={e => update('title', e.target.value)}
                            placeholder="e.g. Basic Python Syntax introduction"
                            className={inputCls}
                        />
                    </Field>

                    {/* Per-type sections */}
                    {draft.type === 'video' && (
                        <>
                            <Field label="Video">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => onUploadVideo && onUploadVideo((url, publicId) => {
                                                setDraft(d => ({ ...d, videoUrl: url, videoPublicId: publicId, videoAccessType: 'upload' }));
                                            })}
                                            className={clsx(
                                                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all',
                                                draft.videoUrl
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-[#071739] text-white hover:bg-[#020a1a]'
                                            )}
                                        >
                                            {draft.videoUrl ? <Check size={13} /> : <Video size={13} />}
                                            {draft.videoUrl ? 'Video uploaded' : 'Upload video'}
                                        </button>
                                        {draft.videoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => update('videoUrl', '')}
                                                className="text-xs font-semibold text-slate-500 hover:text-rose-500 underline"
                                            >
                                                Replace
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        value={draft.videoUrl || ''}
                                        onChange={e => update('videoUrl', e.target.value)}
                                        placeholder="…or paste a YouTube / Vimeo / direct video URL"
                                        className={inputCls}
                                    />
                                </div>
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Duration (seconds)">
                                    <input
                                        type="number"
                                        value={draft.duration || ''}
                                        onChange={e => update('duration', Number(e.target.value) || 0)}
                                        placeholder="e.g. 140"
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Free preview?">
                                    <button
                                        type="button"
                                        onClick={() => update('isFree', !draft.isFree)}
                                        className={clsx(
                                            'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all',
                                            draft.isFree ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 bg-slate-50/40'
                                        )}
                                    >
                                        <span className="text-xs font-semibold text-slate-700">
                                            {draft.isFree ? 'Anyone can preview' : 'Enrolled-only'}
                                        </span>
                                        <span className={clsx(
                                            'w-9 h-5 rounded-full p-0.5 transition-all',
                                            draft.isFree ? 'bg-emerald-500' : 'bg-slate-300'
                                        )}>
                                            <span className={clsx(
                                                'block w-4 h-4 rounded-full bg-white shadow transition-transform',
                                                draft.isFree ? 'translate-x-4' : 'translate-x-0'
                                            )} />
                                        </span>
                                    </button>
                                </Field>
                            </div>
                        </>
                    )}

                    {draft.type === 'reading' && (
                        <>
                            <Field label="Reading content" required>
                                <textarea
                                    rows={12}
                                    value={draft.readingContent || ''}
                                    onChange={e => update('readingContent', e.target.value)}
                                    placeholder={'Write the reading body. You can use markdown:\n\n# Heading\n**Bold** and *italic* text.\n- Bullet point\n1. Numbered item\n[Link](https://example.com)'}
                                    className={inputCls + ' font-mono text-xs leading-relaxed'}
                                />
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    Markdown supported. Students will see a "Mark as completed" button below the article.
                                </p>
                            </Field>
                            <Field label="Estimated reading time (minutes)">
                                <input
                                    type="number"
                                    value={draft.readingMinutes || 4}
                                    onChange={e => update('readingMinutes', Math.max(1, Number(e.target.value) || 1))}
                                    className={inputCls}
                                />
                            </Field>
                        </>
                    )}

                    {draft.type === 'assignment' && (
                        <AssignmentEditor
                            assignment={draft.assignment || { instructions: '', questions: [], maxAttempts: 5, passingScore: 50 }}
                            totalMarks={totalMarks}
                            onChange={(patch) => update('assignment', { ...draft.assignment, ...patch })}
                            addQuestion={addQuestion}
                            updateQuestion={updateQuestion}
                            removeQuestion={removeQuestion}
                            addOption={addOption}
                            updateOption={updateOption}
                            setCorrect={setCorrect}
                            removeOption={removeOption}
                        />
                    )}

                    {/* Common: notes + downloads */}
                    <div className="border-t border-slate-100 pt-6 space-y-6">
                        <Field label="Instructor notes (optional)">
                            <textarea
                                rows={4}
                                value={draft.notes || ''}
                                onChange={e => update('notes', e.target.value)}
                                placeholder="Notes shown to students under the Notes tab on the learning page."
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Downloads (PDFs, slides, code samples)">
                            <div className="space-y-2">
                                {(draft.downloads || []).map((d, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                        <Paperclip size={12} className="text-slate-400 shrink-0" />
                                        <input
                                            value={d.name}
                                            onChange={e => {
                                                const next = [...draft.downloads];
                                                next[i] = { ...next[i], name: e.target.value };
                                                update('downloads', next);
                                            }}
                                            placeholder="Download name"
                                            className="flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                        />
                                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest hover:underline">View</a>
                                        <button
                                            type="button"
                                            onClick={() => update('downloads', draft.downloads.filter((_, j) => j !== i))}
                                            className="text-slate-300 hover:text-rose-500"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => onUploadDownload && onUploadDownload((url, name) => {
                                        update('downloads', [...(draft.downloads || []), { name: name || 'Resource', url }]);
                                    })}
                                    className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-[#071739] hover:border-[#071739]/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={12} /> Add download
                                </button>
                            </div>
                        </Field>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                    >
                        <Save size={13} /> Save lesson
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Assignment editor block
// ──────────────────────────────────────────────
function AssignmentEditor({ assignment, totalMarks, onChange, addQuestion, updateQuestion, removeQuestion, addOption, updateOption, setCorrect, removeOption }) {
    return (
        <div className="space-y-5">
            <Field label="Instructions to students (optional)">
                <textarea
                    rows={3}
                    value={assignment.instructions || ''}
                    onChange={e => onChange({ instructions: e.target.value })}
                    placeholder="e.g. Pick the best option for each question. You have 5 attempts."
                    className={inputCls}
                />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Max attempts">
                    <input
                        type="number"
                        min={1}
                        value={assignment.maxAttempts ?? 5}
                        onChange={e => onChange({ maxAttempts: Math.max(1, Number(e.target.value) || 5) })}
                        className={inputCls}
                    />
                </Field>
                <Field label="Passing score (%)">
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={assignment.passingScore ?? 50}
                        onChange={e => onChange({ passingScore: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                        className={inputCls}
                    />
                </Field>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Questions
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700 normal-case tracking-normal text-[11px]">
                        {assignment.questions?.length || 0} · {totalMarks} marks
                    </span>
                </p>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="text-[11px] font-semibold uppercase tracking-widest text-[#071739] hover:underline flex items-center gap-1"
                >
                    <Plus size={12} /> Add question
                </button>
            </div>

            {(assignment.questions || []).length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                    <ListChecks size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No questions yet</p>
                    <p className="text-xs text-slate-500 font-medium">Click "Add question" to start building the test.</p>
                </div>
            )}

            <div className="space-y-4">
                {(assignment.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#071739] text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-1">
                                {qIdx + 1}
                            </div>
                            <textarea
                                rows={2}
                                value={q.questionText}
                                onChange={e => updateQuestion(qIdx, { questionText: e.target.value })}
                                placeholder="Question text"
                                className="flex-1 bg-white border border-slate-100 rounded-xl py-2 px-3 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10"
                            />
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIdx)}
                                className="p-2 text-slate-300 hover:text-rose-500"
                                title="Delete question"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="space-y-2 pl-9">
                            {q.options.map((o, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCorrect(qIdx, oIdx)}
                                        className={clsx(
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                            o.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                        )}
                                        title={o.isCorrect ? 'Correct answer' : 'Mark as correct'}
                                    >
                                        {o.isCorrect && <Check size={11} className="text-white" />}
                                    </button>
                                    <input
                                        value={o.text}
                                        onChange={e => updateOption(qIdx, oIdx, { text: e.target.value })}
                                        placeholder={`Option ${oIdx + 1}`}
                                        className="flex-1 bg-white border border-slate-100 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#071739]/10"
                                    />
                                    {q.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(qIdx, oIdx)}
                                            className="p-1 text-slate-300 hover:text-rose-500"
                                            title="Remove option"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption(qIdx)}
                                className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:text-[#071739]"
                            >
                                + Add option
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">Marks</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={q.marks ?? 1}
                                    onChange={e => updateQuestion(qIdx, { marks: Math.max(0, Number(e.target.value) || 0) })}
                                    className="w-20 bg-white border border-slate-100 rounded-lg py-1.5 px-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#071739]/10"
                                />
                            </div>
                            <input
                                value={q.explanation || ''}
                                onChange={e => updateQuestion(qIdx, { explanation: e.target.value })}
                                placeholder="Explanation shown after submission (optional)"
                                className="bg-white border border-slate-100 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#071739]/10"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────
function buildInitial(lesson) {
    return {
        ...lesson,
        type: lesson?.type || 'video',
        title: lesson?.title || '',
        videoUrl: lesson?.videoUrl || '',
        videoPublicId: lesson?.videoPublicId || '',
        videoAccessType: lesson?.videoAccessType || 'upload',
        duration: lesson?.duration || 0,
        readingContent: lesson?.readingContent || '',
        readingMinutes: lesson?.readingMinutes || 4,
        notes: lesson?.notes || '',
        downloads: lesson?.downloads || [],
        attachments: lesson?.attachments || [],
        isFree: lesson?.isFree || false,
        assignment: lesson?.assignment || undefined
    };
}

const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all";

function Field({ label, required, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}
