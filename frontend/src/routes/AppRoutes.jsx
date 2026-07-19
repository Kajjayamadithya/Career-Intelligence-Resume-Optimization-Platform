import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import ResumeManager from '../pages/ResumeManager';
import ATSEvaluator from '../pages/ATSEvaluator';
import CareerRoadmap from '../pages/CareerRoadmap';
import MentorChat from '../pages/MentorChat';
import MockInterview from '../pages/MockInterview';
import Analytics from '../pages/Analytics';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="resumes" element={<ResumeManager />} />
        <Route path="ats" element={<ATSEvaluator />} />
        <Route path="roadmaps" element={<CareerRoadmap />} />
        <Route path="mentor" element={<MentorChat />} />
        <Route path="interviews" element={<MockInterview />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
