import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Brain, MessageSquare, FileUp, BarChart3, TrendingUp, RefreshCw, Star, Info } from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import toast from 'react-hot-toast';

const Analytics = () => {
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
      console.error(err);
      toast.error('Could not retrieve analytics stats.');
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

  // Formatting chart data
  const atsChartData = stats?.ats?.recentReports
    ? [...stats.ats.recentReports]
        .reverse()
        .map((report) => ({
          name: report.jobTitle || 'Evaluation',
          score: report.overallScore,
          date: new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }))
    : [];

  const interviewChartData = stats?.interviews?.recentSessions
    ? [...stats.interviews.recentSessions]
        .filter((s) => s.status === 'completed')
        .reverse()
        .map((session) => ({
          name: session.role || 'Mock',
          score: session.overallScore,
          category: session.category,
          date: new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }))
    : [];

  // KPI card configuration
  const kpis = [
    {
      name: 'Latest ATS Score',
      val: stats?.ats?.recentReports?.[0]?.overallScore ? `${stats.ats.recentReports[0].overallScore}%` : 'N/A',
      desc: stats?.ats?.recentReports?.[0]?.jobTitle || 'No evaluations run yet',
      icon: ShieldCheck,
      color: 'text-emerald-400'
    },
    {
      name: 'Parsed Resume Skills',
      val: stats?.resume?.hasResume ? `${stats.resume.skillsCount} Skills` : 'No Resume',
      desc: stats?.resume?.fullName || 'Upload resume to check gaps',
      icon: FileUp,
      color: 'text-violet-400'
    },
    {
      name: 'Avg Interview Rating',
      val: stats?.interviews?.averageScore ? `${stats.interviews.averageScore}%` : 'N/A',
      desc: `${stats?.interviews?.totalCompleted || 0} sessions graded`,
      icon: Brain,
      color: 'text-indigo-400'
    },
    {
      name: 'Mentor Messages',
      val: stats?.chat?.totalMessages ? `${stats.chat.totalMessages} Logs` : '0 Messages',
      desc: stats?.chat?.lastActive
        ? `Last active: ${new Date(stats.chat.lastActive).toLocaleDateString()}`
        : 'Stateful chat inactive',
      icon: MessageSquare,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">System Analytics Overview</h2>
            <p className="text-gray-400 text-xs mt-1 font-light max-w-xl leading-relaxed">
              Real-time analytics dashboard mapping your skill gap profiles, past ATS compatibility reports, and mock interview performance ratings.
            </p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-violet-600/10 hover:text-violet-400 border border-white/5 hover:border-violet-500/25 rounded-xl text-xs font-semibold text-gray-300 transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40 relative overflow-hidden glass-hover group"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{kpi.name}</span>
                <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white tracking-tight">{kpi.val}</span>
                <p className="text-[10px] text-gray-500 mt-1 font-light truncate">{kpi.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ATS Score Chart */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>ATS Compatibility Match Progression</span>
          </h3>
          <div className="h-64 bg-gray-950/20 border border-white/5 rounded-xl p-4 flex items-center justify-center">
            {atsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={atsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
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
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <Info className="w-8 h-8 text-gray-700" />
                <p className="text-gray-500 text-xs font-light">No ATS match history available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mock Interview Chart */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-400" />
            <span>Mock Interview Ratings History</span>
          </h3>
          <div className="h-64 bg-gray-950/20 border border-white/5 rounded-xl p-4 flex items-center justify-center">
            {interviewChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
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
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <Info className="w-8 h-8 text-gray-700" />
                <p className="text-gray-500 text-xs font-light">No completed mock interview history available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
