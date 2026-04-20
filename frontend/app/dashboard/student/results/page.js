'use client';
import { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import Link from 'next/link';

export default function QuizResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/quizzes/results/me');
        setResults(res.data.data);
      } catch (err) {
        console.error('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalPassed = results.filter(r => r.passed).length;
  const avgScore = results.length > 0 ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Assessment History</h1>
                <p className="text-slate-500 font-medium mt-1">Review your performance across all challenges.</p>
            </div>
            <div className="flex gap-4">
                <div className="px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Quizzes Passed</p>
                    <p className="text-2xl font-black text-emerald-700">{totalPassed}</p>
                </div>
                <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-3xl text-center">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Average Score</p>
                    <p className="text-2xl font-black text-blue-700">{avgScore}%</p>
                </div>
            </div>
        </header>

        <section className="space-y-6">
            {loading ? (
                [1, 2, 3].map(i => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-[2rem] h-24 animate-pulse"></div>
                ))
            ) : results.length > 0 ? (
                <div className="space-y-4">
                    {results.map((result) => (
                        <Card key={result._id} className="p-0 border-slate-50 overflow-hidden group">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center">
                                <div className={`w-full md:w-32 py-6 md:py-0 flex items-center justify-center font-black text-2xl ${result.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {Math.round(result.score)}%
                                </div>
                                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                            {result.quiz?.title || 'Quiz Assessment'}
                                        </h3>
                                        <div className="flex items-center gap-6 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <Calendar size={14} /> {new Date(result.attemptedAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <TrendingUp size={14} /> {result.correctAnswers} / {result.totalQuestions} Correct
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            result.passed 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {result.passed ? 'Success' : 'Incomplete'}
                                        </div>
                                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                        <Award size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No quiz history</h3>
                        <p className="text-slate-500 font-medium">Complete lessons and attempt quizzes to track your performance here.</p>
                    </div>
                </div>
            )}
        </section>
      </div>
    </DashboardLayout>
  );
}
