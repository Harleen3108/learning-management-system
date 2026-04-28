'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, HelpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';

export default function QuizBuilder() {
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [quizData, setQuizData] = useState({
        title: '',
        passingScore: 60,
        questions: [
            {
                questionText: '',
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false }
                ],
                explanation: ''
            }
        ]
    });

    useEffect(() => {
        // Fetch instructor courses
        const fetchCourses = async () => {
             try {
                 const res = await api.get('/courses'); // Need a filtered instructor course route
                 // For now, let's assume we need to filter if not provided by backend
                 setCourses(res.data.data);
             } catch (err) {
                 console.error(err);
             } finally {
                 setFetching(false);
             }
        };
        fetchCourses();
    }, []);

    const fetchModules = async (courseId) => {
        setSelectedCourse(courseId);
        try {
            const res = await api.get(`/courses/${courseId}/modules`);
            setModules(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addQuestion = () => {
        setQuizData({
            ...quizData,
            questions: [
                ...quizData.questions,
                {
                    questionText: '',
                    options: [
                        { text: '', isCorrect: true },
                        { text: '', isCorrect: false }
                    ],
                    explanation: ''
                }
            ]
        });
    };

    const handleSaveQuiz = async () => {
        if (!selectedModule) return alert('Please select a module');
        setLoading(true);
        try {
            await api.post('/quizzes', {
                ...quizData,
                module: selectedModule
            });
            alert('Quiz created successfully!');
        } catch (err) {
            console.error(err);
            alert('Error creating quiz');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</div>;

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quiz Builder</h1>
                <p className="text-slate-500 font-medium mt-1">Create engaging assessments for your modules.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8">
                        <h3 className="font-bold text-slate-900 text-xl mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-slate-100 text-[#071739] flex items-center justify-center text-xs">1</span>
                            Quiz Essentials
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Course</label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 appearance-none"
                                        value={selectedCourse}
                                        onChange={(e) => fetchModules(e.target.value)}
                                    >
                                        <option value="">Choose Course</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Module</label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#071739]/10 appearance-none"
                                        value={selectedModule}
                                        onChange={(e) => setSelectedModule(e.target.value)}
                                        disabled={!selectedCourse}
                                    >
                                        <option value="">Choose Module</option>
                                        {modules.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Quiz Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                                    placeholder="e.g. Final Assessment Part 1"
                                    value={quizData.title}
                                    onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 text-xl flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-100 text-[#071739] flex items-center justify-center text-xs">2</span>
                                Questions & Answers
                            </h3>
                            <button 
                                onClick={addQuestion}
                                className="flex items-center gap-2 text-[#071739] font-bold text-xs bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
                            >
                                <Plus size={16} /> Add Question
                            </button>
                        </div>

                        {quizData.questions.map((q, qIdx) => (
                            <Card key={qIdx} className="p-8">
                                <div className="space-y-6">
                                    <div className="flex justify-between gap-4">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question {qIdx + 1}</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-900 outline-none"
                                                placeholder="Enter your question here..."
                                                value={q.questionText}
                                                onChange={(e) => {
                                                    const nextQ = [...quizData.questions];
                                                    nextQ[qIdx].questionText = e.target.value;
                                                    setQuizData({...quizData, questions: nextQ});
                                                }}
                                            />
                                        </div>
                                        <button className="text-slate-300 hover:text-rose-500 mt-6"><Trash2 size={20}/></button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex gap-3">
                                                <input 
                                                    type="text"
                                                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-700 outline-none"
                                                    placeholder={`Option ${oIdx + 1}`}
                                                    value={opt.text}
                                                    onChange={(e) => {
                                                        const nextQ = [...quizData.questions];
                                                        nextQ[qIdx].options[oIdx].text = e.target.value;
                                                        setQuizData({...quizData, questions: nextQ});
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const nextQ = [...quizData.questions];
                                                        nextQ[qIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
                                                        setQuizData({...quizData, questions: nextQ});
                                                    }}
                                                    className={`p-3 rounded-xl transition-all ${opt.isCorrect ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-300'}`}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="p-8 bg-slate-900 text-white !rounded-[2.5rem]">
                        <h4 className="font-bold uppercase text-[10px] tracking-widest text-blue-400 mb-6">Quiz Settings</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Passing Score (%)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-white/10 border-none rounded-2xl p-4 text-sm font-bold text-white outline-none"
                                    value={quizData.passingScore}
                                    onChange={(e) => setQuizData({...quizData, passingScore: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={handleSaveQuiz}
                                disabled={loading}
                                className="w-full py-4 bg-[#071739] hover:opacity-90 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                                Save Assessment
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
