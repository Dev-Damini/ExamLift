import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Award, Lock, Trophy, Target, Flame, Zap, Star, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  badge_color: string;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState({
    totalCorrect: 0,
    totalAttempted: 0,
    currentStreak: 0,
    accuracy: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch all achievements
    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*')
      .order('condition_value', { ascending: true });

    if (achievementsData) setAchievements(achievementsData);

    // Fetch user's earned achievements
    const { data: earnedData } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id);

    if (earnedData) setEarnedAchievements(earnedData);

    // Fetch user stats
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('questions_correct, questions_attempted')
      .eq('user_id', user.id);

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    if (progressData) {
      const totalCorrect = progressData.reduce((sum, p) => sum + p.questions_correct, 0);
      const totalAttempted = progressData.reduce((sum, p) => sum + p.questions_attempted, 0);
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      setStats({
        totalCorrect,
        totalAttempted,
        currentStreak: streakData?.current_streak || 0,
        accuracy,
      });
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Target: Target,
      Trophy: Trophy,
      Award: Award,
      Crown: Crown,
      Flame: Flame,
      Zap: Zap,
      Star: Star,
    };
    return icons[iconName] || Award;
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      gold: 'from-yellow-500 to-yellow-600',
      orange: 'from-orange-500 to-orange-600',
      green: 'from-green-500 to-green-600',
    };
    return colors[color] || colors.blue;
  };

  const isEarned = (achievementId: string) => {
    return earnedAchievements.some((ea) => ea.achievement_id === achievementId);
  };

  const getProgress = (achievement: Achievement) => {
    let current = 0;
    let target = achievement.condition_value;

    switch (achievement.condition_type) {
      case 'questions':
        current = stats.totalCorrect;
        break;
      case 'streak':
        current = stats.currentStreak;
        break;
      case 'accuracy':
        current = stats.accuracy;
        break;
      default:
        current = 0;
    }

    const percentage = Math.min((current / target) * 100, 100);
    return { current, target, percentage };
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Achievements
          </h1>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Overview */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{earnedAchievements.length}</p>
              <p className="text-sm text-muted-foreground">Achievements Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCorrect}</p>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </Card>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon = getIcon(achievement.icon);
            const earned = isEarned(achievement.id);
            const progress = getProgress(achievement);

            return (
              <Card
                key={achievement.id}
                className={`p-6 transition-all ${
                  earned ? 'bg-gradient-to-br border-2' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      earned
                        ? `bg-gradient-to-br ${getBadgeColor(achievement.badge_color)}`
                        : 'bg-muted'
                    }`}
                  >
                    {earned ? (
                      <Icon className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {!earned && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {progress.current} / {progress.target}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {earned && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>Unlocked</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
