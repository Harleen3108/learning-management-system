'use client';
import { useState, useEffect } from 'react';
import { Trophy, Medal, Target, Star, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import api from '@/services/api';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/student/leaderboard');
                setLeaderboard(res.data.data);
            } catch (err) {
                console.error('Failed to fetch leaderboard');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getPrizeColor = (index) => {
        switch (index) {
            case 0: return 'text-amber-500 bg-amber-50'; // Gold
            case 1: return 'text-slate-400 bg-slate-50'; // Silver
            case 2: return 'text-orange-600 bg-orange-50'; // Bronze
            default: return 'text-slate-900 bg-slate-50';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-10">
                <header>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Leaderboard</h1>
                    <p className="text-slate-500 font-medium mt-1">See how you rank against the top minds in the community.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Top 3 Podiums */}
                    {leaderboard.length >= 3 && [1, 0, 2].map(i => {
                        const user = leaderboard[i];
                        if (!user) return null;
                        const isFirst = i === 0;
                        return (
                            <Card key={user._id} className={`relative pt-12 pb-8 px-6 text-center ${isFirst ? 'border-amber-200 bg-amber-50/20 md:-translate-y-4 shadow-xl' : ''}`}>
                                {isFirst && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                        <Trophy size={24} />
                                    </div>
                                )}
                                <div className="w-20 h-20 rounded-[2rem] bg-white border-2 border-slate-100 mx-auto mb-4 overflow-hidden shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg">{user.name}</h3>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Rank #{i + 1}</p>
                                <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                                    <Star className="text-amber-500" size={14} fill="currentColor" />
                                    <span className="font-black text-slate-900 text-sm">{user.completedCount} Lessons</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Badges</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="4" className="px-8 py-6 h-16 bg-white"></td>
                                        </tr>
                                    ))
                                ) : leaderboard.map((user, index) => (
                                    <tr key={user._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${getPrizeColor(index)}`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Community Learner</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, user.completedCount * 5)}%` }}></div>
                                                </div>
                                                <span className="font-black text-slate-900 text-xs">{user.completedCount} pts</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                {index < 3 && <Trophy size={16} className={index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-orange-600'} />}
                                                {user.completedCount > 10 && <Target size={16} className="text-blue-500" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
