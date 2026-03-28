import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Upload, Briefcase, Mail, Home, Sparkles, LogOut, User } from 'lucide-react';
import './App.css';

// Context
import { useAuth } from './context/AuthContext';

// Components
import LoginModal from './components/LoginModal';

// Pages
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobsFinder from './pages/JobsFinder';
import ColdEmail from './pages/ColdEmail';

function App() {
  const { currentUser, isAuthenticated, logout, authRequired, clearAuthRequirement } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle protected actions (called from child components)
  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setResumeData(null);
  };

  // Successful login callback
  const handleLoginSuccess = () => {
    clearAuthRequirement();
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 opacity-50" />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal || authRequired}
        onClose={() => {
          setShowLoginModal(false);
          clearAuthRequirement();
        }}
        onSuccess={handleLoginSuccess}
      />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <nav className="fixed left-0 top-0 h-screen w-20 bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 gap-8">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-4 mt-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Home className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/resume"
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Upload className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Briefcase className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/email"
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Mail className="w-5 h-5" />
            </NavLink>
          </div>

          {/* User Section - Bottom of sidebar */}
          <div className="mt-auto flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-12 h-12 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-12 h-12 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Sign In"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="ml-20 flex-1 min-h-screen p-8">
          {/* User Banner (when logged in) */}
          {isAuthenticated && (
            <div className="mb-4 flex justify-end">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Signed in as {currentUser?.email || 'Demo User'}</span>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard resumeData={resumeData} />} />
            <Route
              path="/resume"
              element={
                <ResumeUpload
                  setResumeData={setResumeData}
                  resumeData={resumeData}
                  onAuthRequired={handleAuthRequired}
                />
              }
            />
            <Route
              path="/jobs"
              element={
                <JobsFinder
                  resumeData={resumeData}
                  onAuthRequired={handleAuthRequired}
                />
              }
            />
            <Route
              path="/email"
              element={
                <ColdEmail
                  resumeData={resumeData}
                  onAuthRequired={handleAuthRequired}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
