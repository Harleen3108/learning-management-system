'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  AlertCircle,
  VideoOff,
  CheckCircle2
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { clsx } from 'clsx';

// EduFlow palette: navy #071739, tan #A68868
// Typography matches admin pages: font-semibold for emphasis, font-medium for body.
// Live state accent uses emerald-500 to communicate "active / scheduled".

export default function StudentLivePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setSessions(res.data.data.upcomingLive || []);
      } catch (err) {
        console.error('Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchLive();

    // Refresh "now" every minute so the countdown updates without a reload
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const grouped = useMemo(() => {
    const upcoming = [];
    const live = [];
    const past = [];
    sessions.forEach(s => {
      const start = new Date(s.scheduledAt).getTime();
      const end = start + (Number(s.duration) || 60) * 60_000;
      if (now < start) upcoming.push(s);
      else if (now >= start && now <= end) live.push(s);
      else past.push(s);
    });
    return { upcoming, live, past };
  }, [sessions, now]);

  const formatCountdown = (ts) => {
    const diff = new Date(ts).getTime() - now;
    if (diff <= 0) return 'Starting soon';
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hrs = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    if (days >= 1) return `In ${days}d ${hrs}h`;
    if (hrs >= 1) return `In ${hrs}h ${mins}m`;
    return `In ${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* ───────── Header ───────── */}
        <header className="flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Video size={18} />
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Live Classes</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">Join real-time interactive lectures with your instructors.</p>
          </div>

          {/* Stat tiles */}
          {!loading && sessions.length > 0 && (
            <div className="hidden md:flex gap-3">
              <StatTile label="Live now" value={grouped.live.length} accent="emerald" />
              <StatTile label="Upcoming" value={grouped.upcoming.length} accent="navy" />
              <StatTile label="Past" value={grouped.past.length} accent="slate" />
            </div>
          )}
        </header>

        {/* ───────── Loading ───────── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-slate-100 rounded-3xl h-32 animate-pulse" />
            ))}
          </div>
        )}

        {/* ───────── Live Now (highlighted) ───────── */}
        {!loading && grouped.live.length > 0 && (
          <section className="space-y-4">
            <SectionHeading
              label="Live now"
              subtitle="Sessions in progress — join immediately."
              accent="emerald"
              count={grouped.live.length}
            />
            <div className="grid grid-cols-1 gap-4">
              {grouped.live.map(s => (
                <SessionCard key={s._id} session={s} state="live" countdown="Live" />
              ))}
            </div>
          </section>
        )}

        {/* ───────── Upcoming ───────── */}
        {!loading && grouped.upcoming.length > 0 && (
          <section className="space-y-4">
            <SectionHeading
              label="Upcoming sessions"
              subtitle="Add these to your calendar."
              accent="navy"
              count={grouped.upcoming.length}
            />
            <div className="grid grid-cols-1 gap-4">
              {grouped.upcoming.map(s => (
                <SessionCard key={s._id} session={s} state="upcoming" countdown={formatCountdown(s.scheduledAt)} />
              ))}
            </div>
          </section>
        )}

        {/* ───────── Past ───────── */}
        {!loading && grouped.past.length > 0 && (
          <section className="space-y-4">
            <SectionHeading
              label="Past sessions"
              subtitle="Completed — recordings (when available) appear in your course."
              accent="slate"
              count={grouped.past.length}
            />
            <div className="grid grid-cols-1 gap-4">
              {grouped.past.map(s => (
                <SessionCard key={s._id} session={s} state="past" />
              ))}
            </div>
          </section>
        )}

        {/* ───────── Empty state ───────── */}
        {!loading && sessions.length === 0 && (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <VideoOff size={36} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">No live classes scheduled</h3>
              <p className="text-sm text-slate-500 font-medium">Keep an eye on this space for upcoming real-time learning opportunities.</p>
            </div>
          </div>
        )}

        {/* ───────── Note ───────── */}
        <div className="flex items-start gap-3 bg-[#071739]/[0.03] p-5 rounded-2xl border border-[#071739]/10">
          <AlertCircle size={18} className="text-[#A68868] flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Access to live sessions is restricted to students enrolled in the respective course. We recommend logging in 5 minutes before the start time to test your audio and video.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────

function StatTile({ label, value, accent = 'navy' }) {
  const tone = accent === 'emerald'
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : accent === 'slate'
      ? 'bg-slate-50 text-slate-500 border-slate-100'
      : 'bg-[#071739]/5 text-[#071739] border-[#071739]/10';
  return (
    <div className={clsx('rounded-2xl border px-4 py-3 flex items-center gap-3 min-w-[120px]', tone)}>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
}

function SectionHeading({ label, subtitle, accent = 'navy', count = 0 }) {
  const dotColor = accent === 'emerald' ? 'bg-emerald-500' : accent === 'slate' ? 'bg-slate-400' : 'bg-[#071739]';
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className={clsx('w-2 h-2 rounded-full', dotColor, accent === 'emerald' && 'animate-pulse')} />
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{label}</h2>
        </div>
        {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {count} session{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function SessionCard({ session, state, countdown }) {
  const date = new Date(session.scheduledAt);
  const isLive = state === 'live';
  const isPast = state === 'past';

  return (
    <div
      className={clsx(
        'bg-white rounded-3xl border transition-all p-6 flex flex-col md:flex-row items-start md:items-center gap-5',
        isLive
          ? 'border-emerald-200 shadow-lg shadow-emerald-100/40'
          : isPast
            ? 'border-slate-100 opacity-75'
            : 'border-slate-100 hover:border-[#071739]/20 hover:shadow-md'
      )}
    >
      {/* Date tile */}
      <div
        className={clsx(
          'w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border',
          isLive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-[#071739]'
        )}
      >
        <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70">
          {date.toLocaleString('default', { month: 'short' })}
        </span>
        <span className="text-xl font-semibold leading-none mt-0.5">
          {date.getDate()}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-semibold uppercase tracking-widest rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
            </span>
          )}
          {!isLive && !isPast && countdown && (
            <span className="inline-flex items-center px-2.5 py-1 bg-[#A68868]/15 text-[#A68868] text-[9px] font-semibold uppercase tracking-widest rounded-full">
              {countdown}
            </span>
          )}
          {isPast && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 text-[9px] font-semibold uppercase tracking-widest rounded-full">
              <CheckCircle2 size={10} /> Completed
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 leading-tight line-clamp-1">{session.title}</h3>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#A68868]" />
            {date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#A68868]" />
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {session.duration ? ` · ${session.duration} min` : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-[#A68868]" />
            Enrolled students
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="w-full md:w-auto shrink-0">
        {isPast ? (
          <button
            disabled
            className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-semibold text-xs uppercase tracking-widest cursor-not-allowed"
          >
            Session ended
          </button>
        ) : (
          <a
            href={session.meetingUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all w-full md:w-auto',
              isLive
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                : 'bg-[#071739] hover:bg-[#020a1a] text-white shadow-md shadow-[#071739]/15'
            )}
          >
            {isLive ? 'Join now' : 'Join session'} <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
