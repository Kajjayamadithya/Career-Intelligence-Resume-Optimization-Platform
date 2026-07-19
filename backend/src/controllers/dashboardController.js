const Resume = require('../models/resume');
const ATSReport = require('../models/atsReport');
const InterviewSession = require('../models/interviewSession');
const CareerChat = require('../models/careerChat');

/**
 * Aggregates and returns statistics across resumes, ATS matching, mock interviews, and mentoring
 */
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // 1. Get Resume Stats
    const latestResume = await Resume.findOne({ userId, isLatest: true });
    const resumeStats = {
      hasResume: !!latestResume,
      fullName: latestResume?.normalizedData?.fullName || '',
      skillsCount: latestResume?.normalizedData?.skills?.length || 0,
      experienceCount: latestResume?.normalizedData?.experience?.length || 0,
      projectsCount: latestResume?.normalizedData?.projects?.length || 0,
      latestSkills: latestResume?.normalizedData?.skills || []
    };

    // 2. Get ATS Stats
    const atsReports = await ATSReport.find({ userId }).sort({ createdAt: -1 });
    let totalAtsScore = 0;
    const recentAtsReports = atsReports.map(report => {
      totalAtsScore += report.scores.overall;
      return {
        jobTitle: report.jobTitle,
        overallScore: report.scores.overall,
        createdAt: report.createdAt
      };
    });
    
    const atsStats = {
      totalEvaluations: atsReports.length,
      averageScore: atsReports.length > 0 ? Math.round(totalAtsScore / atsReports.length) : 0,
      recentReports: recentAtsReports.slice(0, 5) // Last 5 reports
    };

    // 3. Get Interview Stats
    const interviewSessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    let totalInterviewScore = 0;
    let completedCount = 0;
    let activeCount = 0;
    const categoryDistribution = { Technical: 0, Behavioral: 0, HR: 0 };

    const recentInterviews = interviewSessions.map(session => {
      if (session.status === 'completed') {
        completedCount++;
        totalInterviewScore += session.overallScore;
      } else {
        activeCount++;
      }

      if (categoryDistribution[session.category] !== undefined) {
        categoryDistribution[session.category]++;
      } else {
        categoryDistribution[session.category] = 1;
      }

      return {
        sessionId: session._id,
        role: session.role,
        category: session.category,
        overallScore: session.overallScore,
        status: session.status,
        createdAt: session.createdAt
      };
    });

    const interviewStats = {
      totalSessions: interviewSessions.length,
      totalCompleted: completedCount,
      activeCount: activeCount,
      averageScore: completedCount > 0 ? Math.round(totalInterviewScore / completedCount) : 0,
      categoryBreakdown: categoryDistribution,
      recentSessions: recentInterviews.slice(0, 5) // Last 5 sessions
    };

    // 4. Get Chat/Mentor Stats
    const chat = await CareerChat.findOne({ userId });
    const chatStats = {
      totalMessages: chat?.messages?.length || 0,
      lastActive: chat?.updatedAt || null
    };

    // Return all aggregated stats
    res.status(200).json({
      success: true,
      data: {
        resume: resumeStats,
        ats: atsStats,
        interviews: interviewStats,
        chat: chatStats
      }
    });
  } catch (error) {
    next(error);
  }
};
