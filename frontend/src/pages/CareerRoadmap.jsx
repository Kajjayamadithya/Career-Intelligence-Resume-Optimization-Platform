import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Loader2, Sparkles, Calendar, BookOpen, CheckCircle, FolderOpen, Award, ArrowRight, ExternalLink, History, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CareerRoadmap = () => {
  const [careerGoal, setCareerGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'projects' | 'resources'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/career/history');
      if (res.data && res.data.success) {
        setHistory(res.data.history);
        if (res.data.history.length > 0 && !roadmap) {
          setRoadmap(res.data.history[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!careerGoal.trim()) {
      toast.error('Please enter a target career role.');
      return;
    }

    try {
      setGenerating(true);
      setRoadmap(null);
      const res = await api.post('/career/roadmap', { careerGoal });
      if (res.data && res.data.success) {
        setRoadmap(res.data.roadmap);
        toast.success('Roadmap generated successfully!');
        fetchHistory();
      } else {
        toast.error('Failed to generate learning path.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error generating roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const selectHistoryRoadmap = (path) => {
    setRoadmap(path);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <Compass className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Career Learning Paths</h2>
            <p className="text-gray-400 text-xs mt-1 font-light max-w-xl">
              Tell our AI your career transition goals. We map your current skill gaps into an interactive timeline complete with milestones, projects, and certified resource links.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Input & History */}
        <div className="lg:col-span-1 space-y-6">
          {/* Input Form */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-md font-bold text-white tracking-tight">New Transition Pathway</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Target Goal Role</label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. DevOps Engineer"
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all font-light"
                />
              </div>
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Gaps...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    <span>Build Roadmap</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past History */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              <span>Roadmap History</span>
            </h3>
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((hist) => (
                  <button
                    key={hist._id}
                    onClick={() => selectHistoryRoadmap(hist)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1 cursor-pointer ${
                      roadmap?._id === hist._id
                        ? 'bg-violet-600/10 border-violet-500/30 text-violet-400'
                        : 'bg-white/2 border-white/5 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-semibold text-gray-200 capitalize truncate">{hist.careerGoal}</span>
                    <div className="flex justify-between text-[10px] text-gray-500 font-light mt-1">
                      <span>{hist.estimatedCompletion || 'N/A'}</span>
                      <span>{new Date(hist.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-light">No roadmaps generated yet.</p>
            )}
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {roadmap ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Roadmap Metadata */}
                <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                      Active Path
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2 capitalize">{roadmap.careerGoal} Transition</h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="p-3 bg-white/3 border border-white/5 rounded-xl flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Duration</p>
                        <p className="text-sm font-bold text-white">{roadmap.estimatedCompletion || '8 Weeks'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Navigation */}
                <div className="flex border-b border-white/5 gap-6 text-sm">
                  {[
                    { id: 'timeline', label: 'Timeline Pathway', icon: Calendar },
                    { id: 'projects', label: 'Capstones & Milestones', icon: FolderOpen },
                    { id: 'resources', label: 'Learning Resources', icon: BookOpen }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 flex items-center gap-2 cursor-pointer font-medium border-b-2 transition-all ${
                          activeTab === tab.id
                            ? 'border-violet-500 text-violet-400'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Renderings */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {/* Weekly Plan list */}
                    <div className="relative border-l border-white/5 pl-6 ml-4 space-y-8">
                      {roadmap.weeklyPlan?.map((week, idx) => (
                        <div key={idx} className="relative">
                          {/* Indicator dot */}
                          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-violet-600 border-2 border-gray-950 flex items-center justify-center shadow-lg">
                            <span className="text-[8px] font-bold text-white">{week.week}</span>
                          </div>
                          
                          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[10px] font-semibold text-violet-400">WEEK {week.week} FOCUS</span>
                                <h4 className="text-md font-bold text-white mt-1 leading-relaxed">{week.topic}</h4>
                              </div>
                              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/5 text-gray-400 rounded-lg">
                                {week.estimatedHours || 12} hrs/wk
                              </span>
                            </div>

                            {/* Objectives */}
                            <div className="space-y-2">
                              <span className="block text-[10px] uppercase font-semibold text-gray-500">Learning Objectives</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {week.objectives?.map((obj, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300 font-light">
                                    <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                                    <span>{obj}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Mini Project */}
                            {week.miniProject && (
                              <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-gray-200">Mini Project: {week.miniProject.title}</span>
                                  <span className="text-[10px] px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full">
                                    {week.miniProject.difficulty}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 font-light leading-relaxed">{week.miniProject.expectedOutcome}</p>
                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                  {week.miniProject.skillsCovered?.map((sk) => (
                                    <span key={sk} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-gray-400">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    {/* Capstone Projects */}
                    <div className="space-y-4">
                      <h4 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-violet-400" />
                        <span>Recommended Capstone Projects</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {roadmap.projects?.map((proj, i) => (
                          <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-48 space-y-4">
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <h5 className="text-xs font-bold text-white capitalize leading-tight">{proj.title}</h5>
                                <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-medium">
                                  {proj.difficulty}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-2 font-light leading-relaxed">{proj.expectedOutcome}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {proj.skillsCovered?.map((sk) => (
                                <span key={sk} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-gray-400">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones & Certifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Milestones */}
                      <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Key Milestones</span>
                        </h4>
                        <div className="space-y-3">
                          {roadmap.milestones?.map((ms, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs text-gray-300 font-light leading-relaxed">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{ms}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          <Award className="w-4 h-4 text-indigo-400" />
                          <span>Suggested Certifications</span>
                        </h4>
                        <div className="space-y-3">
                          {roadmap.certifications?.map((cert, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs text-gray-300 font-light leading-relaxed">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      <span>Verified Learning Resources</span>
                    </h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      We have compiled official documentation and learning resource links mapped to the technologies suggested in your learning pathway.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roadmap.learningResources && Object.keys(roadmap.learningResources).length > 0 ? (
                        Object.entries(roadmap.learningResources).map(([tech, link]) => (
                          <a
                            key={tech}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-white/3 border border-white/5 hover:border-violet-500/25 hover:bg-violet-600/5 rounded-xl flex items-center justify-between text-xs text-gray-200 transition-all cursor-pointer group"
                          >
                            <span className="font-semibold capitalize">{tech} Official Docs</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                          </a>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 font-light col-span-2">No resource links mapped. Search for official documentation online.</p>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            ) : (
              <div className="h-full min-h-[350px] border border-dashed border-white/10 rounded-2xl bg-gray-950/20 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <Compass className="w-12 h-12 text-gray-600 animate-pulse" />
                <div>
                  <h3 className="text-md font-bold text-white">No Pathway Loaded</h3>
                  <p className="text-gray-500 text-xs mt-1 max-w-sm leading-relaxed font-light">
                    Select a transition role in the input form or choose a historical roadmap to display the interactive learning path.
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

export default CareerRoadmap;
