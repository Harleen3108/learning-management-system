'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, X, Trophy, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/services/api';

// EduFlow palette: navy #071739, tan #A68868. font-semibold/font-medium typography.
//
// Coursera-style practice assignment runner.
//   - Renders MCQ questions, one option selectable per question.
//   - Submits to /api/v1/student/progress/:lessonId/submit-assignment.
//   - Shows score, correct/incorrect per question, attempts remaining.
//   - Re-take button until maxAttempts is reached.
//   - On pass (or last attempt), notifies parent via onComplete so the curriculum
//     can mark a green tick + auto-advance.

export default function AssignmentRunner({ lesson, onComplete }) {
    const assignment = lesson?.assignment;
    const questions = assignment?.questions || [];
    const maxAttempts = assignment?.maxAttempts ?? 5;
    const passingScore = assignment?.passingScore ?? 50;

    // 'idle' = ready to start, 'taking' = answering, 'submitted' = showing results
    const [phase, setPhase] = useState('idle');
    const [answers, setAnswers] = useState({});       // { questionId: selectedOptionIndex }
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);       // server response on submit
    const [progress, setProgress] = useState(null);   // { attempts, bestScore }

    // On mount, pull existing progress to know attempt count + best score
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!lesson?._id) return;
            try {
                const res = await api.get(`/student/progress/lesson/${lesson._id}`);
                if (!cancelled) setProgress(res.data?.data);
            } catch (err) {
                // 404 is fine — first attempt
            }
        })();
        return () => { cancelled = true; };
    }, [lesson?._id]);

    const attemptsUsed = progress?.attempts?.length || 0;
    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);
    const bestScore = progress?.bestScore || 0;
    const hasPassed = (progress?.attempts || []).some(a => a.passed);
    const exhausted = attemptsRemaining === 0 && !hasPassed;

    const startAttempt = () => {
        setAnswers({});
        setResult(null);
        setError('');
        setPhase('taking');
    };

    const selectOption = (questionId, optionIndex) => {
        setAnswers(a => ({ ...a, [questionId]: optionIndex }));
    };

    const submit = async () => {
        setError('');
        // Require an answer for every question
        const unanswered = questions.filter(q => !(q._id in answers));
        if (unanswered.length > 0) {
            return setError(`Please answer all questions before submitting (${unanswered.length} remaining).`);
        }
        setSubmitting(true);
        try {
            const payload = {
                answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
                    questionId,
                    selectedOptionIndex
                }))
            };
            const res = await api.post(`/student/progress/${lesson._id}/submit-assignment`, payload);
            const data = res.data?.data;
            setResult(data);
            // Re-fetch progress so attempts counter updates
            const pRes = await api.get(`/student/progress/lesson/${lesson._id}`);
            setProgress(pRes.data?.data);
            setPhase('submitted');
            // Notify parent (curriculum) — if completed, parent will tick + advance
            if (data?.isCompleted && onComplete) onComplete({ passed: data.passed });
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit your attempt.');
        } finally {
            setSubmitting(false);
        }
    };

    if (questions.length === 0) {
        return (
            <div className="p-10 text-center">
                <AlertCircle size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">This assignment has no questions yet.</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Ask your instructor to publish the questions.</p>
            </div>
        );
    }

    // ────────────────────────────────────────
    // IDLE: assignment overview / start screen
    // ────────────────────────────────────────
    if (phase === 'idle') {
        return (
            <div className="p-6 md:p-10 max-w-3xl mx-auto">
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-6 mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Practice assignment</p>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{lesson.title}</h2>
                    {assignment.instructions && (
                        <p className="text-sm font-medium text-slate-600 mt-3 leading-relaxed">
                            {assignment.instructions}
                        </p>
                    )}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                        <Stat label="Questions" value={questions.length} />
                        <Stat label="Total marks" value={questions.reduce((s, q) => s + (q.marks || 1), 0)} />
                        <Stat label="Pass at" value={`${passingScore}%`} />
                    </div>
                </div>

                {progress && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Stat label="Attempts used" value={`${attemptsUsed} / ${maxAttempts}`} />
                        <Stat label="Best score" value={`${bestScore}%`} accent={hasPassed ? 'emerald' : 'navy'} />
                        <Stat label="Status" value={hasPassed ? 'Passed' : exhausted ? 'No more attempts' : 'In progress'} accent={hasPassed ? 'emerald' : exhausted ? 'rose' : 'navy'} />
                    </div>
                )}

                {hasPassed ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-3">
                        <Trophy size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-700">You've already passed this assignment.</p>
                            <p className="text-xs text-emerald-600 font-medium mt-1">Best score: {bestScore}%. You can re-attempt to improve it if attempts remain.</p>
                        </div>
                    </div>
                ) : exhausted ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3">
                        <AlertCircle size={20} className="text-rose-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-rose-700">All attempts used.</p>
                            <p className="text-xs text-rose-600 font-medium mt-1">Best score: {bestScore}%. Reach out to your instructor if you need another shot.</p>
                        </div>
                    </div>
                ) : null}

                <div className="flex items-center justify-end gap-3 mt-6">
                    {!exhausted && (
                        <button
                            onClick={startAttempt}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                        >
                            {attemptsUsed > 0 ? <><RotateCcw size={13} /> Retake</> : <>Start <ArrowRight size={13} /></>}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────
    // TAKING: answering questions
    // ────────────────────────────────────────
    if (phase === 'taking') {
        return (
            <div className="p-6 md:p-10 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">Attempt {attemptsUsed + 1} of {maxAttempts}</p>
                        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{lesson.title}</h2>
                    </div>
                </div>

                <div className="space-y-5">
                    {questions.map((q, qIdx) => (
                        <div key={q._id} className="bg-white border border-slate-100 rounded-2xl p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-[#071739] text-white text-sm font-semibold flex items-center justify-center shrink-0">
                                    {qIdx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-slate-900 leading-snug">{q.questionText}</p>
                                    <p className="text-[10px] font-semibold text-[#A68868] uppercase tracking-widest mt-1">{q.marks || 1} mark{(q.marks || 1) === 1 ? '' : 's'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {q.options.map((opt, oIdx) => {
                                    const selected = answers[q._id] === oIdx;
                                    return (
                                        <button
                                            key={oIdx}
                                            type="button"
                                            onClick={() => selectOption(q._id, oIdx)}
                                            className={clsx(
                                                'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                                                selected ? 'border-[#071739] bg-[#071739]/5' : 'border-slate-100 hover:border-slate-200'
                                            )}
                                        >
                                            <span className={clsx(
                                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                                selected ? 'border-[#071739] bg-[#071739]' : 'border-slate-300'
                                            )}>
                                                {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                                            </span>
                                            <span className="text-sm font-medium text-slate-700">{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between mt-6 gap-3">
                    <button
                        onClick={() => setPhase('idle')}
                        disabled={submitting}
                        className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        {submitting && <Loader2 size={13} className="animate-spin" />}
                        Submit attempt
                    </button>
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────
    // SUBMITTED: results
    // ────────────────────────────────────────
    const attempt = result?.attempt;
    const review = result?.review || [];
    const reviewMap = Object.fromEntries(review.map(r => [String(r.questionId), r]));

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto">
            <div className={clsx(
                'rounded-3xl p-6 mb-6 border',
                attempt?.passed ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            )}>
                <div className="flex items-center gap-3 mb-3">
                    {attempt?.passed ? (
                        <Trophy size={28} className="text-emerald-600" />
                    ) : (
                        <AlertCircle size={28} className="text-amber-600" />
                    )}
                    <div>
                        <p className={clsx(
                            'text-[10px] font-semibold uppercase tracking-widest',
                            attempt?.passed ? 'text-emerald-700' : 'text-amber-700'
                        )}>
                            {attempt?.passed ? 'Passed' : 'Keep going'}
                        </p>
                        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            {attempt?.percentage}% · {attempt?.score} / {attempt?.totalMarks}
                        </h2>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat label="Correct" value={`${attempt?.correctCount} / ${attempt?.totalQuestions}`} />
                    <Stat label="Best score" value={`${result?.bestScore || 0}%`} accent="emerald" />
                    <Stat label="Attempts used" value={`${result?.attemptsUsed} / ${maxAttempts}`} />
                    <Stat label="Pass at" value={`${passingScore}%`} />
                </div>
            </div>

            <div className="space-y-4">
                {questions.map((q, qIdx) => {
                    const userAnswer = attempt?.answers?.find(a => String(a.questionId) === String(q._id));
                    const reviewItem = reviewMap[String(q._id)];
                    const correctIdx = reviewItem?.correctOptionIndex;
                    return (
                        <div key={q._id} className="bg-white border border-slate-100 rounded-2xl p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <div className={clsx(
                                    'w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0',
                                    userAnswer?.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                                )}>
                                    {userAnswer?.isCorrect ? <CheckCircle2 size={16} /> : <X size={16} />}
                                </div>
                                <p className="text-base font-semibold text-slate-900 flex-1 leading-snug">{q.questionText}</p>
                            </div>
                            <div className="space-y-2">
                                {q.options.map((opt, oIdx) => {
                                    const isUserPick = userAnswer?.selectedOptionIndex === oIdx;
                                    const isCorrect = correctIdx === oIdx;
                                    return (
                                        <div
                                            key={oIdx}
                                            className={clsx(
                                                'flex items-center gap-3 p-3 rounded-xl border-2',
                                                isCorrect ? 'border-emerald-300 bg-emerald-50/50'
                                                    : isUserPick ? 'border-rose-300 bg-rose-50/50'
                                                    : 'border-slate-100'
                                            )}
                                        >
                                            <span className={clsx(
                                                'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                                                isCorrect ? 'bg-emerald-500 text-white'
                                                    : isUserPick ? 'bg-rose-500 text-white'
                                                    : 'bg-slate-200 text-transparent'
                                            )}>
                                                {isCorrect ? <CheckCircle2 size={12} /> : isUserPick ? <X size={12} /> : '·'}
                                            </span>
                                            <span className={clsx('text-sm font-medium', isCorrect ? 'text-emerald-800' : isUserPick ? 'text-rose-700' : 'text-slate-700')}>
                                                {opt.text}
                                            </span>
                                            {isUserPick && <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-slate-500">Your answer</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            {reviewItem?.explanation && (
                                <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">Explanation</p>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{reviewItem.explanation}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
                {result?.attemptsRemaining > 0 && !attempt?.passed && (
                    <button
                        onClick={startAttempt}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-widest"
                    >
                        <RotateCcw size={13} /> Try again ({result?.attemptsRemaining} left)
                    </button>
                )}
                <button
                    onClick={() => setPhase('idle')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

function Stat({ label, value, accent = 'navy' }) {
    const accentCls = {
        navy: 'text-[#071739]',
        emerald: 'text-emerald-600',
        rose: 'text-rose-500',
        tan: 'text-[#A68868]'
    }[accent] || 'text-slate-900';
    return (
        <div className="bg-white/60 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <p className={clsx('text-base font-semibold mt-1', accentCls)}>{value}</p>
        </div>
    );
}
