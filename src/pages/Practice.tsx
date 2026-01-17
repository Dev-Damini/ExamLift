import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { Question, Topic } from '../types';

export default function Practice() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [stats, setStats] = useState({ correct: 0, attempted: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    updateStreak();
  }, [topicId]);

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!streakData) {
      // Create new streak
      await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_practice_date: today,
        total_practice_days: 1,
      });
    } else {
      const lastDate = new Date(streakData.last_practice_date);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        const newStreak = streakData.current_streak + 1;
        await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streakData.longest_streak),
            last_practice_date: today,
            total_practice_days: streakData.total_practice_days + 1,
          })
          .eq('id', streakData.id);
      } else if (daysDiff > 1) {
        // Streak broken
        await supabase
          .from('user_streaks')
          .update({
            current_streak: 1,
            last_practice_date: today,
            total_practice_days: streakData.total_practice_days + 1,
          })
          .eq('id', streakData.id);
      }
      // daysDiff === 0 means already practiced today, no update needed
    }
  };

  const checkAndAwardAchievements = async () => {
    if (!user) return;

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('questions_correct, questions_attempted')
      .eq('user_id', user.id);

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    if (!progressData) return;

    const totalCorrect = progressData.reduce((sum, p) => sum + p.questions_correct, 0);
    const totalAttempted = progressData.reduce((sum, p) => sum + p.questions_attempted, 0);
    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    // Get all achievements
    const { data: achievements } = await supabase.from('achievements').select('*');
    if (!achievements) return;

    // Get already earned achievements
    const { data: earnedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const earnedIds = new Set(earnedAchievements?.map((ea) => ea.achievement_id) || []);

    // Check each achievement
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue;

      let shouldAward = false;

      switch (achievement.condition_type) {
        case 'questions':
          shouldAward = totalCorrect >= achievement.condition_value;
          break;
        case 'streak':
          shouldAward = (streakData?.current_streak || 0) >= achievement.condition_value;
          break;
        case 'accuracy':
          shouldAward = totalAttempted >= 20 && accuracy >= achievement.condition_value;
          break;
      }

      if (shouldAward) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });

        toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`);
      }
    }
  };

  const fetchData = async () => {
    if (!topicId) return;

    // Get topic details
    const { data: topicData } = await supabase
      .from('topics')
      .select('*, subject:subjects(*)')
      .eq('id', topicId)
      .single();

    if (topicData) setTopic(topicData);

    // Get questions for this topic
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId)
      .limit(20);

    if (questionsData && questionsData.length > 0) {
      setQuestions(questionsData);
    } else {
      toast.error('No questions available for this topic');
    }
  };

  const handleAnswer = async (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correct_answer;
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      attempted: stats.attempted + 1,
    };
    setStats(newStats);

    // Update user progress
    if (user && topicId) {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .single();

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            questions_attempted: existingProgress.questions_attempted + 1,
            questions_correct: existingProgress.questions_correct + (isCorrect ? 1 : 0),
            last_practiced_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          topic_id: topicId,
          questions_attempted: 1,
          questions_correct: isCorrect ? 1 : 0,
        });
      }

      // Check for achievements
      await checkAndAwardAchievements();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      toast.success(`Practice completed! Score: ${stats.correct}/${stats.attempted}`);
      navigate('/dashboard');
    }
  };

  if (!topic || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = [
    { key: 'A', value: currentQuestion.option_a },
    { key: 'B', value: currentQuestion.option_b },
    { key: 'C', value: currentQuestion.option_c },
    { key: 'D', value: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="text-sm font-medium">
            Score: {stats.correct}/{stats.attempted}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Topic Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{topic.name}</h1>
          <p className="text-muted-foreground">{topic.subject?.name}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <p className="text-lg leading-relaxed mb-6">{currentQuestion.question_text}</p>

          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrect = option.key === currentQuestion.correct_answer;
              const showCorrect = showFeedback && isCorrect;
              const showWrong = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswer(option.key)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : showWrong
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold flex-shrink-0">
                      {option.key}
                    </span>
                    <span className="flex-1">{option.value}</span>
                    {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />}
                    {showWrong && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <Card className={`p-6 mb-6 ${
            selectedAnswer === currentQuestion.correct_answer
              ? 'border-green-500 bg-green-500/5'
              : 'border-red-500 bg-red-500/5'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">
                  {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect'}
                </h3>
                {currentQuestion.explanation && (
                  <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                )}
              </div>
            </div>
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'Finish Practice'
              )}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
