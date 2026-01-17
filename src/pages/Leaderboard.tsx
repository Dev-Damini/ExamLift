import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  total_correct: number;
  total_attempted: number;
  accuracy_percentage: number;
  current_streak: number;
  longest_streak: number;
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
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;
      if (data) setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-primary/10 text-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Leaderboard
          </h1>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            Top performers based on correct answers and accuracy
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No rankings yet. Be the first to practice and climb the leaderboard!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.id === user?.id;
              
              return (
                <Card
                  key={entry.id}
                  className={`p-6 transition-all ${
                    isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-2xl ${getRankBadge(entry.rank)}`}>
                      {getRankIcon(entry.rank) || `#${entry.rank}`}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate flex items-center gap-2">
                        {entry.username}
                        {isCurrentUser && (
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{entry.total_correct} correct</span>
                        <span>•</span>
                        <span>{entry.accuracy_percentage}% accuracy</span>
                        {entry.current_streak > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {entry.current_streak} day streak
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right hidden md:block">
                      <div className="text-2xl font-bold text-primary">
                        {entry.total_attempted}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Questions
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
