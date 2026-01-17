import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { Trophy, TrendingUp, Clock, Target, ArrowLeft } from 'lucide-react';
import { UserMockAttempt } from '../types';

export default function Results() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<UserMockAttempt | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    if (!attemptId) return;

    const { data } = await supabase
      .from('user_mock_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (data) setAttempt(data);
  };

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
  const timeInMinutes = Math.floor(attempt.time_taken_seconds / 60);
  const timeInSeconds = attempt.time_taken_seconds % 60;

  const getPerformanceMessage = () => {
    if (percentage >= 80) return 'Excellent! Keep up the great work!';
    if (percentage >= 60) return 'Good job! A bit more practice will get you to excellence.';
    if (percentage >= 40) return 'Not bad! Focus on your weak areas.';
    return 'Keep practicing! You will improve with consistent effort.';
  };

  const getGradeColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-primary';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Results Hero */}
        <div className="text-center mb-12">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            percentage >= 60 ? 'bg-gradient-to-br from-primary to-primary/60' : 'bg-gradient-to-br from-yellow-500 to-orange-500'
          }`}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Exam Completed!</h1>
          <p className="text-xl text-muted-foreground mb-2">{getPerformanceMessage()}</p>
          <div className={`text-6xl font-bold ${getGradeColor()}`}>
            {percentage}%
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attempt.score}/{attempt.total_questions}</p>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-science/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-science" />
              </div>
              <div>
                <p className="text-2xl font-bold">{timeInMinutes}m {timeInSeconds}s</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-art/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-art" />
              </div>
              <div>
                <p className="text-2xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Breakdown */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Performance Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Correct Answers</span>
                <span className="text-green-500 font-bold">{attempt.score}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Incorrect Answers</span>
                <span className="text-red-500 font-bold">{attempt.total_questions - attempt.score}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${100 - percentage}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/dashboard')} className="flex-1" size="lg">
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate('/liftbot')} variant="outline" className="flex-1" size="lg">
            Get Help from LiftBot
          </Button>
        </div>
      </div>
    </div>
  );
}
