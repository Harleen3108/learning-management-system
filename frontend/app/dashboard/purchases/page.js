'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Receipt,
    Search,
    Calendar,
    Download,
    ExternalLink,
    Filter,
    PackageX,
    Wallet,
    BookOpen
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { clsx } from 'clsx';

// EduFlow palette: navy #071739, tan #A68868. Typography: font-semibold for headings/values, font-medium for body.

export default function MyPurchasesPage() {
    const [tab, setTab] = useState('history'); // 'subscriptions' | 'history'
    const [rows, setRows] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/profile/purchases');
                setRows(res.data.data || []);
                setTotalSpent(res.data.totalSpent || 0);
            } catch (err) {
                console.error('Failed to load purchases');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Year filter options derived from the actual data
    const years = useMemo(() => {
        const set = new Set(rows.map(r => new Date(r.enrolledAt).getFullYear()));
        return ['all', ...[...set].sort((a, b) => b - a)];
    }, [rows]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(r => {
            const yearOK = yearFilter === 'all' || String(new Date(r.enrolledAt).getFullYear()) === String(yearFilter);
            const titleOK = !q
                || r.course?.title?.toLowerCase().includes(q)
                || r.paymentId?.toLowerCase().includes(q)
                || r.orderId?.toLowerCase().includes(q);
            return yearOK && titleOK;
        });
    }, [rows, search, yearFilter]);

    // Stats
    const paidCount = rows.filter(r => r.amount > 0).length;
    const freeCount = rows.filter(r => !r.amount).length;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-20 space-y-8">
                {/* ───── Header ───── */}
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-[#071739] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#071739]/15">
                            <Receipt size={18} />
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">My Purchases</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        Need help? Visit the{' '}
                        <Link href="/dashboard/support" className="text-[#071739] font-semibold hover:underline">Learner Help Center</Link>{' '}
                        or read our{' '}
                        <Link href="#" className="text-[#071739] font-semibold hover:underline">Terms of Use</Link>.
                    </p>
                </header>

                {/* ───── Stat tiles ───── */}
                {!loading && rows.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatTile
                            icon={<Wallet size={16} />}
                            label="Total spent"
                            value={`₹${totalSpent.toLocaleString()}`}
                        />
                        <StatTile
                            icon={<BookOpen size={16} />}
                            label="Paid courses"
                            value={paidCount}
                        />
                        <StatTile
                            icon={<BookOpen size={16} />}
                            label="Free enrollments"
                            value={freeCount}
                            tone="tan"
                        />
                    </div>
                )}

                {/* ───── Tabs ───── */}
                <div className="flex gap-1 border-b border-slate-100">
                    {[
                        { id: 'subscriptions', label: 'Subscriptions' },
                        { id: 'history', label: 'Payment History' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={clsx(
                                'pb-3 px-4 text-xs uppercase tracking-widest font-semibold transition-all relative',
                                tab === t.id ? 'text-[#071739]' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            {t.label}
                            {tab === t.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#071739] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ───── Subscriptions tab ───── */}
                {tab === 'subscriptions' && (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
                            <PackageX size={28} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No active subscriptions</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto">
                            Subscriptions aren't enabled on your account yet. Browse the catalog to enroll in individual courses.
                        </p>
                        <Link
                            href="/dashboard/explore"
                            className="inline-flex mt-5 items-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all"
                        >
                            Browse courses
                        </Link>
                    </div>
                )}

                {/* ───── Payment History tab ───── */}
                {tab === 'history' && (
                    <div className="space-y-5">
                        {/* Filters */}
                        {!loading && rows.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by course, payment ID, or order ID…"
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                        className="appearance-none bg-white border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 cursor-pointer"
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>
                                                {y === 'all' ? 'All years' : y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Loading */}
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredRows.length === 0 ? (
                            // Empty state
                            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
                                    <Receipt size={28} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {rows.length === 0 ? 'No purchases yet' : 'Nothing matches your filters'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    {rows.length === 0
                                        ? 'Browse courses offering certificates now.'
                                        : 'Try clearing the search or year filter.'}
                                </p>
                                {rows.length === 0 && (
                                    <Link
                                        href="/dashboard/explore"
                                        className="inline-flex mt-5 items-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all"
                                    >
                                        Browse courses
                                    </Link>
                                )}
                            </div>
                        ) : (
                            // Transaction list
                            <>
                                {/* Desktop: table */}
                                <div className="hidden md:block bg-white rounded-3xl border border-slate-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Course</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Payment ID</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredRows.map(r => (
                                                <PurchaseRow key={r._id} row={r} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile: cards */}
                                <div className="md:hidden space-y-3">
                                    {filteredRows.map(r => (
                                        <PurchaseCardMobile key={r._id} row={r} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

// ─────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────

function StatTile({ icon, label, value, tone }) {
    const toneCls = tone === 'tan'
        ? 'bg-[#A68868]/10 text-[#A68868] border-[#A68868]/20'
        : 'bg-[#071739]/5 text-[#071739] border-[#071739]/10';
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', toneCls)}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-semibold text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
            </div>
        </div>
    );
}

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function StatusPill({ status }) {
    const map = {
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        pending:   'bg-amber-50 text-amber-700 border-amber-100',
        cancelled: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return (
        <span className={clsx(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest border',
            map[status] || 'bg-slate-50 text-slate-600 border-slate-100'
        )}>
            {status}
        </span>
    );
}

function PurchaseRow({ row }) {
    const thumb = row.course?.thumbnail && row.course.thumbnail !== 'no-photo.jpg'
        ? row.course.thumbnail
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200';
    return (
        <tr className="hover:bg-slate-50/50 transition-all">
            <td className="px-6 py-4">
                <Link href={`/dashboard/courses/${row.course?._id}?view=learn`} className="flex items-center gap-3 group min-w-0">
                    <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#071739] transition-colors">
                            {row.course?.title || 'Course'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                            {row.course?.instructor?.name || 'EduFlow Mentor'}
                        </p>
                    </div>
                </Link>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                {fmtDate(row.enrolledAt)}
            </td>
            <td className="px-6 py-4 text-xs font-medium text-slate-500 max-w-[180px]">
                {row.paymentId ? (
                    <span className="font-mono truncate block" title={row.paymentId}>{row.paymentId}</span>
                ) : (
                    <span className="text-slate-400 italic">—</span>
                )}
            </td>
            <td className="px-6 py-4 text-right whitespace-nowrap">
                {row.amount > 0 ? (
                    <span className="text-sm font-semibold text-slate-900">₹{row.amount.toLocaleString()}</span>
                ) : (
                    <span className="text-sm font-semibold text-emerald-600">Free</span>
                )}
                <div className="mt-1">
                    <StatusPill status={row.status} />
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <Link
                    href={`/dashboard/courses/${row.course?._id}?view=learn`}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#071739] hover:underline"
                >
                    Open <ExternalLink size={10} />
                </Link>
            </td>
        </tr>
    );
}

function PurchaseCardMobile({ row }) {
    const thumb = row.course?.thumbnail && row.course.thumbnail !== 'no-photo.jpg'
        ? row.course.thumbnail
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200';
    return (
        <Link
            href={`/dashboard/courses/${row.course?._id}?view=learn`}
            className="block bg-white rounded-2xl border border-slate-100 p-4 active:bg-slate-50"
        >
            <div className="flex items-start gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{row.course?.title || 'Course'}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{row.course?.instructor?.name || 'EduFlow Mentor'}</p>
                </div>
                <div className="text-right shrink-0">
                    {row.amount > 0 ? (
                        <p className="text-sm font-semibold text-slate-900">₹{row.amount}</p>
                    ) : (
                        <p className="text-sm font-semibold text-emerald-600">Free</p>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <Calendar size={11} />
                    {fmtDate(row.enrolledAt)}
                </div>
                <StatusPill status={row.status} />
            </div>
            {row.paymentId && (
                <p className="mt-2 text-[10px] text-slate-400 font-mono truncate" title={row.paymentId}>
                    {row.paymentId}
                </p>
            )}
        </Link>
    );
}
