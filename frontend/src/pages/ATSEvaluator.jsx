import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, Sparkles, TrendingUp, Award, CheckCircle2, AlertCircle, ArrowRight, Star, HelpCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ATSEvaluator = () => {
  const [hasResume, setHasResume] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const fetchLatestResume = async () => {
    try {
      setLoadingLatest(true);
      const res = await api.get('/resume/latest');
      if (res.data && res.data.success && res.data.resume) {
        setHasResume(true);
      }
    } catch (err) {
      setHasResume(false);
    } finally {
      setLoadingLatest(false);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!jobDescriptionText.trim()) {
      toast.error('Please enter a job description.');
      return;
    }

    try {
      setEvaluating(true);
      setReport(null);
      const res = await api.post('/ats/calculate', {
        jobTitle: jobTitle || 'Target Role',
        jobDescriptionText
      });

      if (res.data && res.data.success) {
        setReport(res.data.report);
        toast.success('ATS Evaluation completed!');
      } else {
        toast.error('Failed to run evaluation.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error processing evaluation.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loadingLatest) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div className="glass p-8 rounded-2xl border border-white/5 max-w-2xl mx-auto text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-amber-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white tracking-tight">No Active Resume Found</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          The ATS Evaluator runs mathematical and semantic matching against your uploaded resume. Please upload your resume first to unlock the evaluator.
        </p>
        <Link
          to="/resumes"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          <span>Upload Resume</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">ATS Evaluation Engine</h2>
            <p className="text-gray-400 text-xs mt-1 font-light max-w-xl">
              Paste a target job description below. Our offline semantic matcher runs high-fidelity sentence transformers and mathematical weighting to assess your exact match rate.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass p-6 rounded-2xl border border-white/5 h-fit space-y-4">
          <h3 className="text-md font-bold text-white tracking-tight">Evaluation Target</h3>
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all font-light"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Job Description (JD)</label>
              <textarea
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full job requirements here..."
                rows="10"
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all font-light resize-none leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={evaluating}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-300" />
                  <span>Analyze Compatibility</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Score Summary */}
                <div className="glass p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-white/5 space-y-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Match Rating</span>
                    <div className="relative flex items-center justify-center w-28 h-28 mt-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="url(#atsGrad)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={301.6}
                          strokeDashoffset={301.6 - (301.6 * report.scores.overall) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute text-3xl font-extrabold text-white">{report.scores.overall}%</span>
                    </div>
                  </div>

                  {/* Sub-Scores Breakdowns */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {[
                      { name: 'Skill Match', val: report.scores.skillMatch, col: 'bg-violet-500' },
                      { name: 'Semantic Match', val: report.scores.semanticMatch, col: 'bg-indigo-500' },
                      { name: 'Experience', val: report.scores.experience, col: 'bg-blue-500' },
                      { name: 'Projects & Certs', val: report.scores.projects, col: 'bg-emerald-500' }
                    ].map((stat) => (
                      <div key={stat.name} className="space-y-1.5 p-3 rounded-xl bg-white/2 border border-white/5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-light">{stat.name}</span>
                          <span className="font-semibold text-white">{stat.val}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.col} rounded-full`} style={{ width: `${stat.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Skills */}
                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Matched Skills ({report.analysis.matchedSkills.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.analysis.matchedSkills.length > 0 ? (
                        report.analysis.matchedSkills.map((sk) => (
                          <span key={sk} className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg capitalize">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 font-light">No direct matches identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Missing Key Skills ({report.analysis.missingSkills.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.analysis.missingSkills.length > 0 ? (
                        report.analysis.missingSkills.map((sk) => (
                          <span key={sk} className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg capitalize">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 font-light">No critical gaps flagged.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <Award className="w-4 h-4 text-violet-400" />
                      <span>Strengths Highlighted</span>
                    </h4>
                    <ul className="space-y-2">
                      {report.analysis.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-gray-300 font-light leading-relaxed flex gap-2">
                          <span className="text-violet-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <span>Opportunities to Refine</span>
                    </h4>
                    <ul className="space-y-2">
                      {report.analysis.weaknesses.map((weak, i) => (
                        <li key={i} className="text-xs text-gray-300 font-light leading-relaxed flex gap-2">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Improvement Tips */}
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Gemini AI Actionable Recommendations</span>
                  </h4>
                  <div className="space-y-3">
                    {report.analysis.improvementTips.map((tip, i) => (
                      <div key={i} className="p-3 bg-white/3 border border-white/5 rounded-xl flex gap-3 items-start">
                        <div className="p-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg text-xs font-semibold mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full min-h-[350px] border border-dashed border-white/10 rounded-2xl bg-gray-950/20 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <HelpCircle className="w-12 h-12 text-gray-600" />
                <div>
                  <h3 className="text-md font-bold text-white">Awaiting Analysis</h3>
                  <p className="text-gray-500 text-xs mt-1 max-w-sm leading-relaxed font-light">
                    Select a target title and paste the job description details in the left panel to trigger the evaluation.
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

export default ATSEvaluator;
