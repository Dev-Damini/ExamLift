import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Trophy, Medal, Crown, Flame, Target, Users } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  total_correct: number;
  total_attempted: number;
  accuracy_percentage: number;
  current_streak: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Fetch all user profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username');

      if (!profiles) return;

      // Fetch all progress data
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('user_id, questions_correct, questions_attempted');

      // Fetch streaks
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak');

      // Aggregate per user
      const progressMap: Record<string, { correct: number; attempted: number }> = {};
      (progressData || []).forEach((p) => {
        if (!progressMap[p.user_id]) progressMap[p.user_id] = { correct: 0, attempted: 0 };
        progressMap[p.user_id].correct += p.questions_correct;
        progressMap[p.user_id].attempted += p.questions_attempted;
      });

      const streakMap: Record<string, number> = {};
      (streakData || []).forEach((s) => {
        streakMap[s.user_id] = s.current_streak;
      });

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = profiles
        .map((profile) => {
          const prog = progressMap[profile.id] || { correct: 0, attempted: 0 };
          return {
            id: profile.id,
            username: profile.username || 'Student',
            total_correct: prog.correct,
            total_attempted: prog.attempted,
            accuracy_percentage: prog.attempted > 0 ? Math.round((prog.correct / prog.attempted) * 100) : 0,
            current_streak: streakMap[profile.id] || 0,
            rank: 0,
          };
        })
        .sort((a, b) => {
          if (b.total_correct !== a.total_correct) return b.total_correct - a.total_correct;
          return b.accuracy_percentage - a.accuracy_percentage;
        })
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

      setLeaderboard(entries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const myEntry = leaderboard.find((e) => e.id === user?.id);
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/40';
    if (rank === 2) return 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/40';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400/20 to-orange-500/10 border-orange-400/40';
    return '';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h1 className="text-xl font-bold">Leaderboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{leaderboard.length} students</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Your Rank Banner */}
        {myEntry && (
          <Card className="p-4 mb-6 bg-primary/10 border-primary/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center font-bold text-primary text-lg">
                #{myEntry.rank}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Your Current Rank</p>
                <p className="text-xs text-muted-foreground">
                  {myEntry.total_correct} correct answers · {myEntry.accuracy_percentage}% accuracy
                  {myEntry.current_streak > 0 && ` · 🔥 ${myEntry.current_streak} day streak`}
                </p>
              </div>
              {myEntry.rank <= 3 && <Crown className="w-6 h-6 text-yellow-400" />}
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-semibold mb-2">No rankings yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to practice and claim the top spot!
            </p>
          </Card>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {topThree.map((entry) => {
                  const isMe = entry.id === user?.id;
                  return (
                    <Card
                      key={entry.id}
                      className={`p-4 text-center ${getRankBg(entry.rank)} ${isMe ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex justify-center mb-2">{getRankIcon(entry.rank)}</div>
                      <p className="font-bold text-sm truncate">
                        {entry.username}{isMe && ' (You)'}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{entry.total_correct}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.accuracy_percentage}%</p>
                      {entry.current_streak > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-orange-400">{entry.current_streak}d</span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.id === user?.id;

                return (
                  <Card
                    key={entry.id}
                    className={`p-4 transition-all ${
                      isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-secondary/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        entry.rank === 1 ? 'bg-yellow-500/10' :
                        entry.rank === 2 ? 'bg-gray-400/10' :
                        entry.rank === 3 ? 'bg-orange-400/10' : 'bg-secondary'
                      }`}>
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate flex items-center gap-2">
                          {entry.username}
                          {isCurrentUser && (
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">You</span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {entry.total_correct} correct
                          </span>
                          <span>{entry.accuracy_percentage}% accuracy</span>
                          {entry.current_streak > 0 && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-3 h-3" />
                              {entry.current_streak}d streak
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="font-bold text-primary">{entry.total_attempted}</p>
                        <p className="text-xs text-muted-foreground">attempted</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
