'use client';
import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { Card } from './UIElements';
import api from '@/services/api';

export default function QuizTaker({ quiz, onComplete }) {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz && quiz.questions) {
      let questions = [...quiz.questions];
      if (quiz.randomize) {
        // Fisher-Yates shuffle
        for (let i = questions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }
      }
      setShuffledQuestions(questions);
    }
  }, [quiz]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create an array that maps original question indices to the user's answers
      const submission = new Array(quiz.questions.length).fill(null);
      
      shuffledQuestions.forEach((q, shuffledIdx) => {
          // Find original index of this question
          const originalIdx = quiz.questions.findIndex(oq => oq._id === q._id);
          if (originalIdx !== -1) {
              submission[originalIdx] = answers[shuffledIdx];
          }
      });
      
      const res = await api.post(`/quizzes/${quiz.id}/submit`, { answers: submission });
      setResult(res.data.data);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!shuffledQuestions.length) return null;

  if (isSubmitted && result) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Trophy size={48} className="text-amber-500" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Quiz Completed!</h2>
        <p className="text-slate-500 font-medium mt-2 mb-10">You've reached the end of this assessment.</p>
        
        <div className="grid grid-cols-2 gap-6 mb-10 text-left">
          <Card className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Score</p>
            <p className={`text-4xl font-black ${result.passed ? 'text-emerald-500' : 'text-slate-900'}`}>{Math.round(result.score)}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <p className={`text-4xl font-black ${result.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setCurrentIdx(0);
              setAnswers({});
              setResult(null);
            }}
            className="w-full py-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Try Again
          </button>
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            Next Content <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Quiz Progress */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{quiz.title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Question {currentIdx + 1} of {shuffledQuestions.length}</p>
        </div>
        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${((currentIdx + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-10 shadow-xl border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 leading-relaxed mb-10">
          {currentQ.questionText}
        </h3>

        <div className="space-y-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers({ ...answers, [currentIdx]: idx })}
              className={`w-full p-6 rounded-[1.5rem] border-2 text-left transition-all flex items-center gap-4 group ${
                answers[currentIdx] === idx 
                ? 'bg-blue-50 border-blue-600 text-blue-900' 
                : 'bg-white border-slate-100 hover:border-blue-200 text-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                answers[currentIdx] === idx ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-400 group-hover:border-blue-200'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-bold">{opt.text}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-6 py-3 font-bold text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-0"
          >
            Previous
          </button>
          
          {currentIdx === shuffledQuestions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading || answers[currentIdx] === undefined}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => prev + 1)}
              disabled={answers[currentIdx] === undefined}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
            >
              Next Question <ArrowRight size={18} />
            </button>
          )}
        </div>
      </Card>

      <div className="mt-8 flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
        <AlertCircle size={18} className="text-blue-600" />
        <p className="text-[10px] font-bold text-blue-700 tracking-wide uppercase">
          Tip: {quiz.randomize ? "Questions are shuffled for each attempt." : "You can review your answers before submitting."}
        </p>
      </div>
    </div>
  );
}
