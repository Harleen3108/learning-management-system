'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Users, BookOpen, Banknote, Activity, TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownRight, Calendar, Filter, User, 
    Clock, MousePointer2, CheckCircle2, AlertCircle, ShoppingCart,
    ChevronRight, MoreHorizontal, Download, RefreshCcw, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// --- Custom Chart Components (SVG + Framer Motion) ---

const LineChart = ({ data, color = "#3b82f6", height = 200 }) => {
    const max = Math.max(...data.map(d => d.value)) * 1.2;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.value / max) * 100
    }));

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const areaData = `${pathData} L 100,100 L 0,100 Z`;

    return (
        <div className="relative w-full overflow-hidden" style={{ height }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    d={areaData}
                    fill="url(#lineGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />
                <motion.path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 mt-2">
                {data.map((d, i) => (
                    <span key={i} className="text-[10px] text-slate-400 font-medium">{d.label}</span>
                ))}
            </div>
        </div>
    );
};

const HorizontalBarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-indigo-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];
    
    return (
        <div className="space-y-4">
            {data.map((item, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{item.label}</span>
                        <span>{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / max) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={clsx("h-full rounded-full", colors[i % colors.length])}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const BarChart = ({ data, color = "#6366f1" }) => {
    const max = Math.max(...data.map(d => d.value)) * 1.1;
    return (
        <div className="flex items-end justify-between h-48 gap-2">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full h-full flex items-end">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.value / max) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className={clsx(
                                "w-full rounded-t-lg transition-all duration-300",
                                i === data.length - 1 ? "bg-indigo-600" : "bg-indigo-200 group-hover:bg-indigo-300"
                            )}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded">
                            {d.value.toLocaleString()}
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const AreaChart = ({ data, color = "#10b981" }) => {
    const max = Math.max(...data.map(d => d.value)) * 1.2;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.value / max) * 100
    }));

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const areaData = `${pathData} L 100,100 L 0,100 Z`;

    return (
        <div className="relative w-full h-40">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    d={areaData}
                    fill="url(#areaGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />
                <motion.path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                />
            </svg>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ title, value, change, icon: Icon, color, trend, iconBg }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={clsx("p-3 rounded-2xl", iconBg)}>
                <Icon size={24} className={color} />
            </div>
            <div className={clsx(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-semibold text-slate-800">{value}</h3>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon size={100} />
        </div>
    </motion.div>
);

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>
        {action && (
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal size={20} />
            </button>
        )}
    </div>
);

// --- Main Page Component ---

export default function AdminAnalytics() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Last 7 Days');
    const [exporting, setExporting] = useState(false);
    const [filterStep, setFilterStep] = useState(0);
    const [tempMonth, setTempMonth] = useState('');
    const [tempYear, setTempYear] = useState('2026');

    const formatCurrency = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        return `₹${val.toLocaleString()}`;
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hrs ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " secs ago";
    };

    const getActivityIcon = (action) => {
        if (action.includes('ENROLL')) return ShoppingCart;
        if (action.includes('COMPLETE')) return CheckCircle2;
        if (action.includes('CREATE')) return BookOpen;
        if (action.includes('PAYMENT')) return Banknote;
        return Activity;
    };

    const getActivityColor = (action) => {
        if (action.includes('ENROLL')) return 'text-blue-500';
        if (action.includes('COMPLETE')) return 'text-emerald-500';
        if (action.includes('CREATE')) return 'text-indigo-500';
        if (action.includes('PAYMENT')) return 'text-amber-500';
        return 'text-slate-500';
    };

    const getActivityBg = (action) => {
        if (action.includes('ENROLL')) return 'bg-blue-50';
        if (action.includes('COMPLETE')) return 'bg-emerald-50';
        if (action.includes('CREATE')) return 'bg-indigo-50';
        if (action.includes('PAYMENT')) return 'bg-amber-50';
        return 'bg-slate-50';
    };

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            // Simulate CSV download
            const data = "Date,Users,Revenue\n2026-04-01,120,45000\n2026-04-02,150,52000";
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', 'analytics_report.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setExporting(false);
        }, 1500);
    };

    const filterOptions = [
        { id: 'today', label: 'Today', icon: Activity },
        { id: 'week', label: 'This Week', icon: Calendar },
        { id: 'custom', label: 'Custom Range', icon: Filter }
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/analytics/admin');
                setAnalyticsData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch real analytics data:', err);
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <AdminLayout>
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 bg-white rounded-[2.5rem]" />
                    <div className="h-96 bg-white rounded-[2.5rem]" />
                </div>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 min-h-screen">
                {/* Header with Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight flex items-center gap-3">
                            Analytics Dashboard
                            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold uppercase tracking-wider">Live</span>
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium">Monitoring platform growth and engagement metrics.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap relative">
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
                            <Calendar size={18} className="text-slate-400" />
                            <select 
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-slate-600 outline-none cursor-pointer"
                            >
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Year</option>
                                <option>Custom Range</option>
                            </select>
                        </div>
                        
                        <div className="relative">
                            <div 
                                onClick={() => {
                                    setFilterOpen(!filterOpen);
                                    setFilterStep(0);
                                }}
                                className={clsx(
                                    "bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors",
                                    filterOpen && "ring-2 ring-[#071739]/10 border-[#071739]"
                                )}
                            >
                                <Filter size={18} className={clsx(filterOpen ? "text-[#071739]" : "text-slate-400")} />
                                <span className={clsx("text-sm font-semibold", filterOpen ? "text-primary" : "text-slate-600")}>Advanced Filter</span>
                            </div>

                            <AnimatePresence mode="wait">
                                {filterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 overflow-hidden"
                                    >
                                        {filterStep === 0 && (
                                            <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Quick Filters</p>
                                                    <select 
                                                        value={tempYear}
                                                        onChange={(e) => setTempYear(e.target.value)}
                                                        className="text-[10px] font-semibold bg-slate-50 border border-slate-100 rounded px-2 py-1 outline-none"
                                                    >
                                                        <option>2026</option>
                                                        <option>2025</option>
                                                        <option>2024</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    {filterOptions.map((opt) => (
                                                        <div 
                                                            key={opt.id}
                                                            onClick={() => {
                                                                setSelectedFilter(`${opt.label} (${tempYear})`);
                                                                setFilterOpen(false);
                                                            }}
                                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                                                        >
                                                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <opt.icon size={16} />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">{opt.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-4 border-t border-slate-100">
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase mb-3">Select Month</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                                            <div 
                                                                key={m} 
                                                                onClick={() => {
                                                                    setTempMonth(m);
                                                                    setFilterStep(1);
                                                                }}
                                                                className="text-xs font-semibold text-center py-2 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary cursor-pointer transition-all text-slate-500"
                                                            >
                                                                {m}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {filterStep === 1 && (
                                            <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="space-y-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <button 
                                                        onClick={() => setFilterStep(0)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                                    >
                                                        <ChevronRight className="rotate-180" size={16} />
                                                    </button>
                                                    <p className="text-sm font-semibold text-slate-800">{tempMonth} {tempYear}</p>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-2 text-center">Select Date</p>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {[...Array(31)].map((_, i) => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => {
                                                                setSelectedFilter(`${i+1} ${tempMonth}, ${tempYear}`);
                                                                setFilterOpen(false);
                                                                setFilterStep(0);
                                                            }}
                                                            className="aspect-square flex items-center justify-center text-[10px] font-semibold rounded-md hover:bg-primary hover:text-white cursor-pointer transition-all text-slate-500 bg-slate-50"
                                                        >
                                                            {i + 1}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={handleExport}
                            disabled={exporting}
                            className={clsx(
                                "bg-slate-900 text-white rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all font-semibold text-sm min-w-[120px] justify-center",
                                exporting ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-800"
                            )}
                        >
                            {exporting ? (
                                <>
                                    <RefreshCcw size={18} className="animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Export CSV
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <StatCard 
                        title="Total Users" 
                        value={analyticsData?.kpis.totalUsers.toLocaleString()} 
                        change="+8.2%" 
                        trend="up"
                        icon={Users} 
                        color="text-blue-600"
                        iconBg="bg-blue-50"
                    />
                    <StatCard 
                        title="Active Students" 
                        value={analyticsData?.kpis.activeStudents.toLocaleString()} 
                        change="+5.1%" 
                        trend="up"
                        icon={User} 
                        color="text-emerald-600"
                        iconBg="bg-emerald-50"
                    />
                    <StatCard 
                        title="Total Courses" 
                        value={analyticsData?.kpis.totalCourses.toLocaleString()} 
                        change="+12" 
                        trend="up"
                        icon={BookOpen} 
                        color="text-[#071739]"
                        iconBg="bg-[#071739]/5"
                    />
                    <StatCard 
                        title="Total Revenue" 
                        value={formatCurrency(analyticsData?.kpis.totalRevenue || 0)} 
                        change="+14.3%" 
                        trend="up"
                        icon={Banknote} 
                        color="text-[#A68868]"
                        iconBg="bg-[#A68868]/10"
                    />
                    <StatCard 
                        title="Pending Applicants" 
                        value={analyticsData?.kpis.pendingInstructors || 0} 
                        change="Review" 
                        trend="up"
                        icon={ShieldCheck} 
                        color="text-secondary"
                        iconBg="bg-secondary/10"
                        onView={() => router.push('/dashboard/admin/users')}
                    />
                    <StatCard 
                        title="New Signups" 
                        value={analyticsData?.kpis.newSignupsToday.toLocaleString()} 
                        change="Today" 
                        trend="up"
                        icon={TrendingUp} 
                        color="text-violet-600"
                        iconBg="bg-violet-50"
                    />
                </div>

                {/* Grid Layout for Analytics Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* User Growth Chart */}
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <SectionHeader 
                            title="User Growth Analytics" 
                            subtitle="Monthly student registration trends"
                            action={true}
                        />
                        <div className="mt-8">
                            {analyticsData?.charts.userGrowth.length > 0 ? (
                                <LineChart data={analyticsData.charts.userGrowth} color="#071739" height={250} />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-300 font-medium">Insufficient data for growth chart</div>
                            )}
                        </div>
                        <div className="mt-8 flex items-center gap-3 p-4 bg-[#071739]/5 rounded-2xl border border-[#071739]/10">
                            <div className="p-2 bg-primary rounded-xl text-white">
                                <TrendingUp size={16} />
                            </div>
                            <p className="text-sm font-semibold text-primary">
                                Peak growth in June, avg growth 12%
                            </p>
                        </div>
                    </div>

                    {/* Course Performance */}
                    <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <SectionHeader 
                            title="Course Performance" 
                            subtitle="Top enrollment by course"
                        />
                        {analyticsData?.charts.coursePerformance.length > 0 ? (
                            <HorizontalBarChart data={analyticsData.charts.coursePerformance} />
                        ) : (
                            <div className="py-20 text-center text-slate-300 font-medium">No enrollment data available</div>
                        )}
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <h4 className="text-sm font-semibold text-slate-800 mb-4">Quick Insights</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-slate-400 uppercase tracking-wider font-semibold">Avg Rating</span>
                                    <span className="text-slate-800 font-semibold">4.8 / 5.0</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-slate-400 uppercase tracking-wider font-semibold">Completion</span>
                                    <span className="text-slate-800 font-semibold">72% Avg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructor Performance */}
                    <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <SectionHeader 
                            title="Instructor Performance" 
                            subtitle="Revenue distribution by tutor"
                        />
                        <div className="space-y-6">
                            {analyticsData?.charts.instructorPerformance.length > 0 ? (
                                analyticsData.charts.instructorPerformance.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {item.label.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Top Tier</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.value)}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                                                <TrendingUp size={10} /> 12%
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-slate-300 font-medium">No instructor revenue data</div>
                            )}
                        </div>
                        <button className="w-full mt-10 py-3 rounded-xl border border-slate-100 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                            View All Instructors
                        </button>
                    </div>

                    {/* Student Engagement */}
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <SectionHeader 
                            title="Student Engagement" 
                            subtitle="Daily and weekly active metrics"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avg Time</p>
                                <p className="text-xl font-semibold text-slate-800">1.8 hrs/d</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">DAU</p>
                                <p className="text-xl font-semibold text-slate-800">{(analyticsData?.kpis.activeStudents * 0.3).toFixed(0)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">WAU</p>
                                <p className="text-xl font-semibold text-slate-800">{(analyticsData?.kpis.activeStudents * 0.7).toFixed(0)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Drop-off</p>
                                <p className="text-xl font-semibold text-rose-500">22%</p>
                            </div>
                        </div>
                        {analyticsData?.charts.engagementData.length > 0 ? (
                            <AreaChart data={analyticsData.charts.engagementData} color="#10b981" />
                        ) : (
                            <div className="h-40 flex items-center justify-center text-slate-300 font-medium">Insufficient engagement data</div>
                        )}
                        
                        <div className="mt-8 flex gap-4">
                            <div className="flex-1 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-emerald-700">High Engagement</span>
                                <span className="text-lg font-semibold text-emerald-700">45%</span>
                            </div>
                            <div className="flex-1 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-700">Medium</span>
                                <span className="text-lg font-semibold text-amber-700">35%</span>
                            </div>
                            <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500">Low</span>
                                <span className="text-lg font-semibold text-slate-500">20%</span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Analytics */}
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <SectionHeader 
                            title="Revenue Analytics" 
                            subtitle="Monthly platform earnings overview"
                        />
                        {analyticsData?.charts.revenueMonthly.length > 0 ? (
                            <BarChart data={analyticsData.charts.revenueMonthly} color="#071739" />
                        ) : (
                            <div className="h-48 flex items-center justify-center text-slate-300 font-medium">No revenue history available</div>
                        )}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-primary rounded-2xl text-white">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Top Earning Course</p>
                                <p className="text-sm font-semibold">{analyticsData?.charts.coursePerformance[0]?.label || 'No course data'}</p>
                                <p className="text-lg font-semibold text-accent mt-2">{formatCurrency(analyticsData?.charts.instructorPerformance[0]?.value || 0)}</p>
                            </div>
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mb-1">Refund Rate</p>
                                <p className="text-2xl font-semibold text-rose-600">3.2%</p>
                                <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold mt-1">
                                    <TrendingDown size={10} /> -0.5% from last month
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                        <SectionHeader title="Recent Activity" subtitle="Live updates from the ecosystem" />
                        <div className="flex-1 space-y-6 overflow-y-auto pr-2 max-h-[400px] scrollbar-hide">
                            <AnimatePresence>
                                {analyticsData?.activityFeed.length > 0 ? (
                                    analyticsData.activityFeed.map((activity, i) => (
                                        <motion.div 
                                            key={activity.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-4 group"
                                        >
                                            <div className={clsx(
                                                "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", 
                                                getActivityBg(activity.action), 
                                                getActivityColor(activity.action)
                                            )}>
                                                {(() => {
                                                    const Icon = getActivityIcon(activity.action);
                                                    return <Icon size={20} />;
                                                })()}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">
                                                    {activity.text}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">{getTimeAgo(activity.time)}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-slate-300 font-medium">No recent activity</div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button className="mt-8 text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                            View All Activity <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Drop-off Insights Section */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#071739] p-8 rounded-[2rem] text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <TrendingDown size={20} className="text-rose-400" />
                                </div>
                                <h4 className="font-semibold">Highest Drop-off</h4>
                            </div>
                            <p className="text-3xl font-semibold mb-2">UI/UX Design</p>
                            <p className="text-slate-400 text-sm">Module 4: Advanced Prototyping</p>
                            <div className="mt-6 flex items-center gap-2">
                                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[45%] bg-rose-500 rounded-full" />
                                </div>
                                <span className="text-xs font-bold text-rose-400">45% Drop</span>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Clock size={20} className="text-indigo-600" />
                                </div>
                                <h4 className="font-semibold text-slate-800">Avg Completion Time</h4>
                            </div>
                            <div className="text-center py-4">
                                <p className="text-5xl font-semibold text-slate-800">14</p>
                                <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs mt-1">Days Total</p>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium text-center">Across all technical courses</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-50 rounded-xl">
                                    <MousePointer2 size={20} className="text-amber-600" />
                                </div>
                                <h4 className="font-semibold text-slate-800">Most Skipped Module</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-sm font-semibold text-slate-800">Initial Environment Setup</p>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">62% Skip Rate</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-primary font-semibold cursor-pointer">
                                    <RefreshCcw size={12} /> Analyze Why?
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Custom Styles for layout */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </AdminLayout>
    );
}
