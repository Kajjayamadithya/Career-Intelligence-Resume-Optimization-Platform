import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Loader2, Sparkles, Award, Star, BookOpen, Clock, HelpCircle, CheckCircle, ChevronDown, ChevronUp, History, ListRestart, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MockInterview = () => {
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('Technical');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Active session states
  const [activeSession, setActiveSession] = useState(null); // sessionId, currentQuestion, index, total
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  // Intermediary review state (feedback for the question just answered)
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [nextQuestion, setNextQuestion] = useState('');

  // Finished session summary state
  const [completedSession, setCompletedSession] = useState(null);

  // Accordion toggle for review list
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/interview/history');
      if (res.data && res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      toast.error('Please enter a target role.');
      return;
    }

    try {
      setStartingSession(true);
      setCompletedSession(null);
      setLatestEvaluation(null);
      setNextQuestion('');
      setAnswerText('');

      const res = await api.post('/interview/start', { role, category });
      if (res.data && res.data.success && res.data.data) {
        const session = res.data.data;
        setActiveSession({
          sessionId: session.sessionId,
          role: session.role,
          category: session.category,
          currentQuestionIndex: session.currentQuestionIndex + 1,
          totalQuestions: session.totalQuestions,
          currentQuestion: session.nextQuestion
        });
        toast.success('Interview session initialized!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error starting interview.');
    } finally {
      setStartingSession(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) {
      toast.error('Please enter your answer.');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const res = await api.post('/interview/answer', {
        sessionId: activeSession.sessionId,
        answerText
      });

      if (res.data && res.data.success && res.data.data) {
        const result = res.data.data;
        if (result.completed) {
          setCompletedSession(result.session);
          setActiveSession(null);
          toast.success('Interview completed! Loading summary...');
          fetchHistory();
        } else {
          setLatestEvaluation(result.latestEvaluation);
          setNextQuestion(result.nextQuestion);
          toast.success('Answer graded!');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error submitting answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleProceed = () => {
    setActiveSession((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      currentQuestion: nextQuestion
    }));
    setLatestEvaluation(null);
    setNextQuestion('');
    setAnswerText('');
  };

  const viewSessionDetails = async (id) => {
    try {
      const res = await api.get(`/interview/session/${id}`);
      if (res.data && res.data.success) {
        setCompletedSession(res.data.data);
        setActiveSession(null);
        setLatestEvaluation(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      toast.error('Could not load session details.');
    }
  };

  const resetSimulator = () => {
    setCompletedSession(null);
    setActiveSession(null);
    setLatestEvaluation(null);
    setRole('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <Brain className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Mock Interview Simulator</h2>
            <p className="text-gray-400 text-xs mt-1 font-light max-w-xl">
              Conduct a sequential 5-question interview. Our LLM parses and grades your replies in real-time, providing constructive score parameters and model answers for study.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Setup & History Sidebar */}
        {!activeSession && !completedSession && (
          <div className="lg:col-span-1 space-y-6">
            {/* Input Config */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-md font-bold text-white tracking-tight">Simulator Config</h3>
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Target Job Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Node.js Developer"
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all font-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500/30 transition-all font-light"
                  >
                    <option value="Technical" className="bg-gray-950">Technical</option>
                    <option value="Behavioral" className="bg-gray-950">Behavioral</option>
                    <option value="HR" className="bg-gray-950">HR / General</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={startingSession}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
                >
                  {startingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Qs...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-violet-300" />
                      <span>Start Interview</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Past Sessions */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-violet-400" />
                <span>Session Logs</span>
              </h3>
              {loadingHistory ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {history.map((sess) => (
                    <button
                      key={sess._id}
                      onClick={() => viewSessionDetails(sess._id)}
                      className="w-full text-left p-3 bg-white/2 border border-white/5 hover:border-violet-500/20 rounded-xl text-xs flex flex-col justify-between gap-1 cursor-pointer transition-all hover:bg-white/5"
                    >
                      <span className="font-semibold text-gray-200 capitalize truncate">{sess.role}</span>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                        <span>{sess.category}</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${
                          sess.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {sess.status === 'completed' ? `Score: ${sess.overallScore}%` : 'Active'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-light">No sessions recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Main Panel Content */}
        <div className={activeSession || completedSession ? 'lg:col-span-4' : 'lg:col-span-3'}>
          <AnimatePresence mode="wait">
            {/* Active Simulation */}
            {activeSession && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass p-6 md:p-8 rounded-2xl border border-white/5 space-y-6"
              >
                {/* Progress bar */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light capitalize">{activeSession.role} ({activeSession.category})</span>
                  <span className="text-violet-400 font-semibold">Question {activeSession.currentQuestionIndex} of {activeSession.totalQuestions}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full transition-all"
                    style={{ width: `${(activeSession.currentQuestionIndex / activeSession.totalQuestions) * 100}%` }}
                  ></div>
                </div>

                {/* Question block */}
                <div className="p-5 bg-white/2 border border-white/5 rounded-xl space-y-2">
                  <span className="block text-[10px] uppercase font-bold text-violet-400 tracking-wider">Question Prompt</span>
                  <p className="text-sm font-semibold text-white leading-relaxed">{activeSession.currentQuestion}</p>
                </div>

                {/* Feedback Review between questions */}
                {latestEvaluation ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Score block */}
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="flex flex-col items-center justify-center text-center md:border-r border-white/5 py-2">
                        <span className="text-[10px] font-semibold uppercase text-gray-500">Grading</span>
                        <span className="text-3xl font-extrabold text-violet-400 mt-1">{latestEvaluation.score}%</span>
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <span className="block text-[10px] uppercase font-semibold text-gray-500">Constructive Feedback</span>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">{latestEvaluation.feedback}</p>
                      </div>
                    </div>

                    {/* Model Answer */}
                    <div className="p-5 bg-emerald-500/3 border border-emerald-500/10 rounded-xl space-y-2">
                      <span className="block text-[10px] uppercase font-semibold text-emerald-400">Suggested Model Answer</span>
                      <p className="text-xs text-gray-300 font-light leading-relaxed">{latestEvaluation.suggestedAnswer}</p>
                    </div>

                    <button
                      onClick={handleProceed}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  // Answer Input area
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Your Answer</label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer in detail here..."
                        rows="8"
                        required
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all font-light resize-none leading-relaxed"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingAnswer}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submittingAnswer ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Grading Answer...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-violet-300" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* Completed Summary Report Card */}
            {completedSession && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Score Summary */}
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Interview Completed
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-3 capitalize">{completedSession.role} Assessment</h3>
                    <p className="text-xs text-gray-500 font-light mt-1 capitalize">{completedSession.category} Interview Category</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#10b981"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * completedSession.overallScore) / 100}
                        />
                      </svg>
                      <span className="absolute text-2xl font-extrabold text-white">{completedSession.overallScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-violet-400" />
                    <span>Gemini AI Overall Session Review</span>
                  </h4>
                  <p className="text-xs text-gray-300 font-light leading-relaxed whitespace-pre-line">{completedSession.overallFeedback}</p>
                </div>

                {/* Question & Answer Accordion List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white tracking-tight">Q&A Transcript Details</h4>
                  {completedSession.answers?.map((ans, index) => {
                    const isExpanded = expandedAnswer === index;
                    return (
                      <div key={index} className="glass rounded-xl border border-white/5 overflow-hidden">
                        <button
                          onClick={() => setExpandedAnswer(isExpanded ? null : index)}
                          className="w-full px-5 py-4 flex justify-between items-center text-xs text-left cursor-pointer hover:bg-white/2 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-400">Q{index + 1}:</span>
                            <span className="font-bold text-white truncate max-w-lg md:max-w-xl">{ans.question}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              ans.score >= 70 ? 'bg-emerald-500/10 text-emerald-400' : ans.score >= 40 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {ans.score}%
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4 bg-gray-950/20">
                            {/* Candidate answer */}
                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase font-bold text-gray-500">Your Answer</span>
                              <p className="text-xs text-gray-300 font-light leading-relaxed">{ans.answer}</p>
                            </div>
                            
                            {/* Feedback */}
                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase font-bold text-violet-400">Constructive Feedback</span>
                              <p className="text-xs text-gray-300 font-light leading-relaxed">{ans.feedback}</p>
                            </div>

                            {/* Suggested Answer */}
                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase font-bold text-emerald-400 font-medium">Model Answer</span>
                              <p className="text-xs text-gray-300 font-light leading-relaxed">{ans.suggestedAnswer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reset button */}
                <div className="flex gap-4">
                  <button
                    onClick={resetSimulator}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ListRestart className="w-4 h-4" />
                    <span>Return to Config</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Waiting Selection Layout */}
            {!activeSession && !completedSession && (
              <div className="h-full min-h-[420px] border border-dashed border-white/10 rounded-2xl bg-gray-950/20 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <HelpCircle className="w-12 h-12 text-gray-600 animate-pulse" />
                <div>
                  <h3 className="text-md font-bold text-white">No Mock Session Active</h3>
                  <p className="text-gray-500 text-xs mt-1 max-w-sm leading-relaxed font-light">
                    Choose a role and category in the sidebar to start a new interview session, or select a past session from the logs to view its transcript.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
