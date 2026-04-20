'use client';
import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Upload, 
  CheckCircle2, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '@/components/UIElements';

export default function QuizEditor({ quiz, onSave, onClose }) {
  const [editedQuiz, setEditedQuiz] = useState({
    ...quiz,
    questions: quiz.questions || []
  });
  const [activeQuestion, setActiveQuestion] = useState(null);

  const addQuestion = () => {
    const newQ = {
      questionText: 'New Question',
      options: [
        { text: 'Option 1', isCorrect: true },
        { text: 'Option 2', isCorrect: false }
      ],
      explanation: ''
    };
    setEditedQuiz({
      ...editedQuiz,
      questions: [...editedQuiz.questions, newQ]
    });
    setActiveQuestion(editedQuiz.questions.length);
  };

  const removeQuestion = (idx) => {
    const nextQ = [...editedQuiz.questions];
    nextQ.splice(idx, 1);
    setEditedQuiz({ ...editedQuiz, questions: nextQ });
    if (activeQuestion === idx) setActiveQuestion(null);
  };

  const updateQuestion = (idx, field, value) => {
    const nextQ = [...editedQuiz.questions];
    nextQ[idx][field] = value;
    setEditedQuiz({ ...editedQuiz, questions: nextQ });
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      
      // Expected Format: Question, Option 1, Option 2, Option 3, Option 4, CorrectIndex (0-3)
      const newQuestions = rows.slice(1).map(row => {
        const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 3) return null;

        const questionText = cols[0];
        const options = cols.slice(1, -1).map((opt, i) => ({
          text: opt,
          isCorrect: i === parseInt(cols[cols.length - 1])
        }));

        return { questionText, options, explanation: '' };
      }).filter(q => q);

      setEditedQuiz({
        ...editedQuiz,
        questions: [...editedQuiz.questions, ...newQuestions]
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <HelpCircle className="text-amber-500" />
              Quiz Editor
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage assessment questions and bulk uploads.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar: Question List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions ({editedQuiz.questions.length})</h4>
                <div className="flex gap-2">
                  <label className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all cursor-pointer">
                    <Upload size={14} />
                    <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                  </label>
                  <button onClick={addQuestion} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {editedQuiz.questions.map((q, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveQuestion(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${activeQuestion === idx ? 'bg-white border-blue-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                  >
                    <span className="text-xs font-bold text-slate-700 truncate pr-4">
                      {idx + 1}. {q.questionText}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Editor */}
            <div className="md:col-span-2">
              {activeQuestion !== null ? (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question Text</label>
                    <textarea 
                      value={editedQuiz.questions[activeQuestion].questionText}
                      onChange={(e) => updateQuestion(activeQuestion, 'questionText', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Options (Click circle to set correct)</label>
                    <div className="space-y-3">
                      {editedQuiz.questions[activeQuestion].options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-3 items-center group">
                          <button 
                            onClick={() => {
                              const nextQ = [...editedQuiz.questions];
                              nextQ[activeQuestion].options = nextQ[activeQuestion].options.map((o, i) => ({
                                ...o, isCorrect: i === oIdx
                              }));
                              setEditedQuiz({ ...editedQuiz, questions: nextQ });
                            }}
                            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-blue-400'}`}
                          >
                            {opt.isCorrect && <CheckCircle2 size={14} />}
                          </button>
                          <input 
                            value={opt.text}
                            onChange={(e) => {
                              const nextQ = [...editedQuiz.questions];
                              nextQ[activeQuestion].options[oIdx].text = e.target.value;
                              setEditedQuiz({ ...editedQuiz, questions: nextQ });
                            }}
                            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-blue-100"
                          />
                          <button 
                            onClick={() => {
                              if (editedQuiz.questions[activeQuestion].options.length <= 2) return;
                              const nextQ = [...editedQuiz.questions];
                              nextQ[activeQuestion].options.splice(oIdx, 1);
                              setEditedQuiz({ ...editedQuiz, questions: nextQ });
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const nextQ = [...editedQuiz.questions];
                          nextQ[activeQuestion].options.push({ text: 'New Option', isCorrect: false });
                          setEditedQuiz({ ...editedQuiz, questions: nextQ });
                        }}
                        className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mt-2 hover:translate-x-1 transition-transform"
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Explanation (Optional)</label>
                    <input 
                      value={editedQuiz.questions[activeQuestion].explanation || ''}
                      onChange={(e) => updateQuestion(activeQuestion, 'explanation', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                      placeholder="Why is it correct?"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                    <HelpCircle size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-bold">Select a Question</h3>
                  <p className="text-slate-500 text-xs font-medium max-w-[200px] mt-2">Select or add a question to begin editing the MCQ content.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <label className="flex items-center gap-4 mr-auto cursor-pointer group">
             <div className="relative w-10 h-6 bg-slate-200 rounded-full group-hover:bg-slate-300 transition-colors">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={editedQuiz.randomize}
                  onChange={(e) => setEditedQuiz({ ...editedQuiz, randomize: e.target.checked })}
                />
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${editedQuiz.randomize ? 'translate-x-4 bg-blue-600' : ''}`} />
             </div>
             <span className="text-xs font-bold text-slate-600">Shuffle Questions</span>
          </label>
          <button 
            onClick={() => onSave(editedQuiz)}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
