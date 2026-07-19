import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, Star, TrendingUp, Sparkles, BookOpen, FileText, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Format stats block
  const kpiStats = [
    {
      name: 'Latest ATS Score',
      value: stats?.ats?.recentReports?.[0]?.overallScore ? `${stats.ats.recentReports[0].overallScore}%` : 'N/A',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      desc: stats?.ats?.recentReports?.[0]?.jobTitle || 'No evaluations run yet'
    },
    {
      name: 'Parsed Skills',
      value: stats?.resume?.hasResume ? `${stats.resume.skillsCount} Skills` : 'None',
      icon: BookOpen,
      color: 'text-violet-400',
      desc: stats?.resume?.hasResume ? 'Extracted from resume' : 'Upload resume to extract'
    },
    {
      name: 'Avg Interview Score',
      value: stats?.interviews?.averageScore ? `${stats.interviews.averageScore}%` : 'N/A',
      icon: Star,
      color: 'text-indigo-400',
      desc: `${stats?.interviews?.totalCompleted || 0} completed session(s)`
    },
    {
      name: 'Mentor Activity',
      value: stats?.chat?.totalMessages ? `${stats.chat.totalMessages} Msg` : 'None',
      icon: TrendingUp,
      color: 'text-amber-400',
      desc: stats?.chat?.lastActive ? `Last message: ${new Date(stats.chat.lastActive).toLocaleDateString()}` : 'Chat history empty'
    }
  ];

  // Dynamic recommendations based on status
  const recommendations = [];
  if (!stats?.resume?.hasResume) {
    recommendations.push({
      title: 'Upload your resume',
      desc: 'Unlock skill gap analysis & ATS compatibility scoring',
      priority: 'High Priority',
      color: 'bg-rose-500',
      link: '/resumes'
    });
  }
  if (stats?.resume?.hasResume && stats?.ats?.totalEvaluations === 0) {
    recommendations.push({
      title: 'Run your first ATS match',
      desc: 'Paste a target job description to evaluate resume alignment',
      priority: 'High Priority',
      color: 'bg-amber-500',
      link: '/ats'
    });
  }
  if (stats?.interviews?.totalSessions === 0) {
    recommendations.push({
      title: 'Start a mock interview',
      desc: 'Evaluate your technical or behavioral skills under simulated pressure',
      priority: 'Medium Priority',
      color: 'bg-blue-500',
      link: '/interviews'
    });
  }
  if (stats?.resume?.hasResume && stats?.ats?.totalEvaluations > 0 && stats?.interviews?.totalCompleted > 0) {
    recommendations.push({
      title: 'Build a personalized career roadmap',
      desc: 'Use custom roadmaps to structure your skill gap studies',
      priority: 'Low Priority',
      color: 'bg-emerald-500',
      link: '/roadmaps'
    });
  }

  // Fallback default recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Practice mock interviews',
      desc: 'Consistent practice keeps you interview-ready and sharpens replies',
      priority: 'Routine',
      color: 'bg-violet-500',
      link: '/interviews'
    });
  }

  // Format Recharts data
  const chartData = stats?.ats?.recentReports
    ? [...stats.ats.recentReports]
        .reverse()
        .map((report) => ({
          name: report.jobTitle || 'Match',
          score: report.overallScore
        }))
    : [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome, {user?.name || 'Developer'}! <Sparkles className="text-violet-400 w-6 h-6 animate-pulse" />
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-light max-w-xl leading-relaxed">
            Your AI career analysis engine is online. Optimize your resume matches, master target technologies via roadmap pathways, and simulate live interviews with instant grading feedback.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-300 font-medium self-start md:self-auto">
          <Calendar className="w-4 h-4 text-violet-400" />
          <span>Last updated: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40 relative group overflow-hidden glass-hover"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{stat.name}</span>
                <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                <p className="text-[10px] text-gray-500 mt-1 font-light truncate">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-md font-bold text-white tracking-tight">Recent ATS Compatibility Trends</h3>
          <div className="h-64 bg-gray-950/20 border border-white/5 rounded-xl p-4 flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090a0f',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <FileText className="w-8 h-8 text-gray-700 animate-pulse" />
                <p className="text-gray-500 text-xs font-light">No ATS match histories computed yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-md font-bold text-white tracking-tight">Active Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <Link
                  key={i}
                  to={rec.link}
                  className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl flex gap-3 items-center transition-all cursor-pointer group"
                >
                  <div className={`w-2 h-2 rounded-full ${rec.color} flex-shrink-0`}></div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-violet-400 transition-colors">
                      {rec.title}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">{rec.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
          <Link
            to="/roadmaps"
            className="w-full mt-6 py-2.5 px-4 bg-white/5 border border-white/5 hover:bg-violet-600/10 hover:border-violet-500/25 hover:text-violet-400 rounded-xl transition-all text-xs font-semibold text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Custom Pathways</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
