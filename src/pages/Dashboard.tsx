import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../lib/auth';
import toast from 'react-hot-toast';
import {
  Trophy,
  BookOpen,
  Brain,
  TrendingUp,
  Clock,
  Target,
  Award,
  LogOut,
  Settings,
  BarChart3,
  Flame,
  Medal,
} from 'lucide-react';
import { Subject, Topic, UserTrackSelection, UserProgress, Track } from '../types';

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [trackSelection, setTrackSelection] = useState<UserTrackSelection | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    topicsCount: 0,
  });
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    // Get user track selection
    const { data: selection } = await supabase
      .from('user_track_selection')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!selection) {
      navigate('/track-selection');
      return;
    }

    setTrackSelection(selection);

    // Get track details
    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', selection.track_id)
      .single();

    if (trackData) setTrack(trackData);

    // Get subjects (compulsory + track-specific)
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('*')
      .or(`is_compulsory.eq.true,track_id.eq.${selection.track_id}`);

    if (subjectsData) setSubjects(subjectsData);

    // Get all topics for these subjects
    if (subjectsData && subjectsData.length > 0) {
      const subjectIds = subjectsData.map((s) => s.id);
      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .in('subject_id', subjectIds);

      if (topicsData) setTopics(topicsData);
    }

    // Get user progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (progressData) {
      setProgress(progressData);
      const totalQuestions = progressData.reduce((sum, p) => sum + p.questions_attempted, 0);
      const correctAnswers = progressData.reduce((sum, p) => sum + p.questions_correct, 0);
      setStats({
        totalQuestions,
        correctAnswers,
        topicsCount: progressData.length,
      });
    }

    // Get streak data
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    if (streakData) {
      setStreak(streakData.current_streak);
    }

    // Get achievements count
    const { data: achievementsData } = await supabase
      .from('user_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (achievementsData) {
      setAchievements(achievementsData.count || 0);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getSubjectTopics = (subjectId: string) => {
    return topics.filter((t) => t.subject_id === subjectId);
  };

  const getTrackColor = () => {
    if (!track) return 'bg-primary';
    const colors: Record<string, string> = {
      blue: 'bg-science',
      purple: 'bg-art',
      green: 'bg-commercial',
    };
    return colors[track.color_code] || 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ExamLift
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-muted-foreground">
            {track?.name} Track · Continue your exam preparation journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalQuestions > 0
                    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Medal className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{achievements}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link to="/liftbot">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">LiftBot AI Tutor</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant help, explanations, and study tips from your AI tutor
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-science/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-science" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Mock Exams</h3>
                <p className="text-sm text-muted-foreground">
                  Take full-length practice exams with real timer
                </p>
              </div>
            </div>
          </Card>

          <Link to="/achievements">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Medal className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock badges and track your learning milestones
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link to="/leaderboard">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full bg-gradient-to-br from-primary/5 to-science/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Compete with other students and see your ranking
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-art/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-art" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Performance Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress and identify improvement areas
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Subjects */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Subjects</h2>
          {subjects.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No subjects available yet.</p>
              <p className="text-sm text-muted-foreground">
                Admin needs to add topics and questions for your track.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => {
                const subjectTopics = getSubjectTopics(subject.id);
                return (
                  <Card key={subject.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 ${getTrackColor()}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <BookOpen className={`w-6 h-6 ${getTrackColor().replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{subject.name}</h3>
                        {subject.is_compulsory && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Compulsory
                          </span>
                        )}
                      </div>
                    </div>
                    {subjectTopics.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-3">
                          {subjectTopics.length} topics available
                        </p>
                        {subjectTopics.slice(0, 3).map((topic) => (
                          <Link key={topic.id} to={`/practice/${topic.id}`}>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                              <Target className="w-4 h-4 mr-2" />
                              {topic.name}
                            </Button>
                          </Link>
                        ))}
                        {subjectTopics.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{subjectTopics.length - 3} more topics
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No topics available yet</p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
