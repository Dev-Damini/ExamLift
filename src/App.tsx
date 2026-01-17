import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import TrackSelection from './pages/TrackSelection';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import MockExam from './pages/MockExam';
import Results from './pages/Results';
import LiftBot from './pages/LiftBot';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminMockExams from './pages/admin/AdminMockExams';
import { useEffect } from 'react';

function App() {
  const { loading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/track-selection" element={<ProtectedRoute><TrackSelection /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/practice/:topicId" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
          <Route path="/mock/:mockId" element={<ProtectedRoute><MockExam /></ProtectedRoute>} />
          <Route path="/results/:attemptId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/liftbot" element={<ProtectedRoute><LiftBot /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
          <Route path="/admin/mocks" element={<AdminRoute><AdminMockExams /></AdminRoute>} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export default App;
