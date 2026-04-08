import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { Trophy, TrendingUp, Clock, Target, ArrowLeft, CheckCircle2, XCircle, ChevronDown, ChevronUp, Brain, RotateCcw } from 'lucide-react';
import { UserMockAttempt, Question } from '../types';

interface QuestionWithResult extends Question {
  userAnswer: string;
  isCorrect: boolean;
}

export default function Results() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<UserMockAttempt | null>(null);
  const [questionsWithResults, setQuestionsWithResults] = useState<QuestionWithResult[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [mockExamId, setMockExamId] = useState<string | null>(null);
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

    if (data) {
      setAttempt(data);
      setMockExamId(data.mock_exam_id);

      // Fetch questions for this mock exam
      const { data: mqData } = await supabase
        .from('mock_questions')
        .select('question_id, question_order')
        .eq('mock_exam_id', data.mock_exam_id)
        .order('question_order');

      if (mqData && mqData.length > 0) {
        const questionIds = mqData.map((mq) => mq.question_id);
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .in('id', questionIds);

        if (questionsData) {
          const answers: Record<string, string> = data.answers || {};
          const enriched: QuestionWithResult[] = questionsData.map((q) => ({
            ...q,
            userAnswer: answers[q.id] || '',
            isCorrect: answers[q.id] === q.correct_answer,
          }));
          // Sort by question_order
          const ordered = mqData.map((mq) => enriched.find((q) => q.id === mq.question_id)!).filter(Boolean);
          setQuestionsWithResults(ordered);
        }
      }
    }
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
  const wrongAnswers = questionsWithResults.filter((q) => !q.isCorrect);
  const correctAnswers = questionsWithResults.filter((q) => q.isCorrect);
  const unanswered = questionsWithResults.filter((q) => !q.userAnswer);

  const getPerformanceMessage = () => {
    if (percentage >= 80) return 'Excellent! Outstanding performance!';
    if (percentage >= 60) return 'Good job! A little more practice will get you to excellence.';
    if (percentage >= 40) return 'Not bad! Focus on the corrections below.';
    return 'Keep practicing! Study the explanations carefully.';
  };

  const getGradeColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-primary';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGradeLetter = () => {
    if (percentage >= 75) return 'A';
    if (percentage >= 65) return 'B';
    if (percentage >= 55) return 'C';
    if (percentage >= 45) return 'D';
    return 'F';
  };

  const getOptionLabel = (q: QuestionWithResult, key: string): string => {
    const map: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    return map[key] || '—';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          {mockExamId && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/mock/${mockExamId}`)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Exam
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Results Hero */}
        <div className="text-center mb-10">
          <div className={`w-28 h-28 mx-auto mb-5 rounded-full flex items-center justify-center shadow-lg ${
            percentage >= 60
              ? 'bg-gradient-to-br from-primary to-primary/70'
              : percentage >= 40
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
              : 'bg-gradient-to-br from-red-500 to-red-700'
          }`}>
            <div className="text-center text-white">
              <div className="text-3xl font-black">{getGradeLetter()}</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Exam Completed!</h1>
          <p className="text-muted-foreground mb-4">{getPerformanceMessage()}</p>
          <div className={`text-7xl font-black ${getGradeColor()}`}>{percentage}%</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="p-5 text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{attempt.score}/{attempt.total_questions}</p>
            <p className="text-xs text-muted-foreground mt-1">Score</p>
          </Card>

          <Card className="p-5 text-center">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">{correctAnswers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Correct</p>
          </Card>

          <Card className="p-5 text-center">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">{wrongAnswers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Wrong</p>
          </Card>

          <Card className="p-5 text-center">
            <div className="w-10 h-10 bg-science/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-science" />
            </div>
            <p className="text-2xl font-bold">{timeInMinutes}m {timeInSeconds}s</p>
            <p className="text-xs text-muted-foreground mt-1">Time Taken</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Performance Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-green-500">Correct</span>
                <span className="font-bold text-green-500">{correctAnswers.length} ({percentage}%)</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-red-500">Wrong</span>
                <span className="font-bold text-red-500">{wrongAnswers.length} ({100 - percentage - Math.round((unanswered.length / attempt.total_questions) * 100)}%)</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${(wrongAnswers.length / attempt.total_questions) * 100}%` }} />
              </div>
            </div>
            {unanswered.length > 0 && (
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium text-muted-foreground">Unanswered</span>
                  <span className="font-bold text-muted-foreground">{unanswered.length}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/30 rounded-full transition-all"
                    style={{ width: `${(unanswered.length / attempt.total_questions) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Question-by-question Review */}
        {questionsWithResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Question Review</h2>
            <p className="text-sm text-muted-foreground mb-6">Click any question to see the correct answer and explanation.</p>

            {/* Wrong answers first */}
            {wrongAnswers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Questions to Review ({wrongAnswers.length})
                </h3>
                <div className="space-y-3">
                  {wrongAnswers.map((q, idx) => (
                    <QuestionReviewCard
                      key={q.id}
                      question={q}
                      index={questionsWithResults.indexOf(q) + 1}
                      expanded={expandedQuestion === q.id}
                      onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      getOptionLabel={getOptionLabel}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Correct answers */}
            {correctAnswers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Correct Answers ({correctAnswers.length})
                </h3>
                <div className="space-y-3">
                  {correctAnswers.map((q) => (
                    <QuestionReviewCard
                      key={q.id}
                      question={q}
                      index={questionsWithResults.indexOf(q) + 1}
                      expanded={expandedQuestion === q.id}
                      onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      getOptionLabel={getOptionLabel}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TrendingUp Insights */}
        {wrongAnswers.length > 0 && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Study Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  You missed {wrongAnswers.length} question{wrongAnswers.length > 1 ? 's' : ''}. Review the explanations above and use LiftBot AI to get personalized help on topics you struggled with.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/mock-exams')} className="flex-1" size="lg">
            <Trophy className="w-4 h-4 mr-2" />
            All Mock Exams
          </Button>
          <Button onClick={() => navigate('/liftbot')} variant="outline" className="flex-1" size="lg">
            <Brain className="w-4 h-4 mr-2" />
            Ask LiftBot AI
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="ghost" className="flex-1" size="lg">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionReviewCard({
  question,
  index,
  expanded,
  onToggle,
  getOptionLabel,
}: {
  question: QuestionWithResult;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  getOptionLabel: (q: QuestionWithResult, key: string) => string;
}) {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <Card
      className={`overflow-hidden transition-all ${
        question.isCorrect ? 'border-green-500/30' : 'border-red-500/30'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-secondary/20 transition-colors"
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          question.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          {question.isCorrect
            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
            : <XCircle className="w-4 h-4 text-red-500" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Q{index}</span>
            {!question.userAnswer && (
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">Unanswered</span>
            )}
          </div>
          <p className="text-sm font-medium leading-relaxed line-clamp-2">{question.question_text}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-5 border-t border-border/50 pt-4">
          {/* Options */}
          <div className="space-y-2 mb-4">
            {options.map((opt) => {
              const isCorrect = opt === question.correct_answer;
              const isUserAnswer = opt === question.userAnswer;
              let cls = 'border-border/40 text-muted-foreground';
              if (isCorrect) cls = 'border-green-500 bg-green-500/10 text-green-400';
              else if (isUserAnswer && !isCorrect) cls = 'border-red-500 bg-red-500/10 text-red-400 line-through';

              return (
                <div key={opt} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${cls}`}>
                  <span className="font-bold flex-shrink-0">{opt}.</span>
                  <span>{getOptionLabel(question, opt)}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0 text-green-500" />}
                  {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 ml-auto flex-shrink-0 text-red-500" />}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Explanation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
