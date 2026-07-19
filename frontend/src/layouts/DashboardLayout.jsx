import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { logoutUser } from '../redux/slices/authSlice';
import {
  Sparkles,
  LayoutDashboard,
  FileUp,
  Brain,
  Compass,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  LogOut,
  User as UserIcon,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Manager', path: '/resumes', icon: FileUp },
    { name: 'ATS Evaluator', path: '/ats', icon: ShieldCheck },
    { name: 'Career Roadmaps', path: '/roadmaps', icon: Compass },
    { name: 'Career Mentor', path: '/mentor', icon: MessageSquare },
    { name: 'Mock Interviews', path: '/interviews', icon: Brain },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-premium flex text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col fixed h-screen z-20">
        {/* Brand Logo */}
        <div className="p-6 border-b border-white/5 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/10">
            <Sparkles className="text-white w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-md tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Career Intel
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-violet-600/15 text-violet-400 border border-violet-500/25'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center space-x-3 p-2 bg-gray-950/20 rounded-xl border border-white/5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center border border-violet-500/25">
              <UserIcon className="text-violet-400 w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Student'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-rose-500/10 hover:text-rose-400 text-gray-400 rounded-xl transition-all text-sm font-medium border border-transparent cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white tracking-tight">AI Career Intelligence Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full font-medium tracking-wide">
              Production Build v1.0
            </span>
          </div>
        </header>

        {/* Page Routing Target */}
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
