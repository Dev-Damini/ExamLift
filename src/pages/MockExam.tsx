import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, AlertCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { MockExam as MockExamType, Question } from '../types';

export default function MockExam() {
  const { mockId } = useParams();
  const [mockExam, setMockExam] = useState<MockExamType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const startTimeRef = useRef(Date.now());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMockExam();
  }, [mockId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining > 0]);

  const fetchMockExam = async () => {
    if (!mockId) return;

    const { data: mockData } = await supabase
      .from('mock_exams')
      .select('*')
      .eq('id', mockId)
      .single();

    if (mockData) {
      setMockExam(mockData);
      setTimeRemaining(mockData.duration_minutes * 60);
      startTimeRef.current = Date.now();

      const { data: mockQuestions } = await supabase
        .from('mock_questions')
        .select('question_id, question_order')
        .eq('mock_exam_id', mockId)
        .order('question_order');

      if (mockQuestions && mockQuestions.length > 0) {
        const questionIds = mockQuestions.map((mq) => mq.question_id);
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .in('id', questionIds);

        if (questionsData) {
          // Sort by question_order
          const ordered = mockQuestions
            .map((mq) => questionsData.find((q) => q.id === mq.question_id))
            .filter(Boolean) as Question[];
          setQuestions(ordered);
        }
      }
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    // Auto-advance after short delay (UX: shows selected state briefly)
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev < questions.length - 1) return prev + 1;
        return prev;
      });
    }, 350);
  };

  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const currentUser = user;
    const currentMock = mockExam;

    if (!currentUser || !currentMock) {
      toast.error('Session error. Please try again.');
      setSubmitting(false);
      return;
    }

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let score = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score++;
    });

    const { data, error } = await supabase
      .from('user_mock_attempts')
      .insert({
        user_id: currentUser.id,
        mock_exam_id: currentMock.id,
        score,
        total_questions: questions.length,
        time_taken_seconds: timeTaken,
        answers,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to submit: ' + error.message);
      setSubmitting(false);
      return;
    }

    toast.success(`Submitted! Score: ${score}/${questions.length}`);
    navigate(`/results/${data.id}`);
  }, [user, mockExam, questions, answers, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mockExam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeRemaining > 0 && timeRemaining < 300;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className={`border-b backdrop-blur-sm sticky top-0 z-50 ${
        isUrgent ? 'bg-red-500/10 border-red-500/50' : 'bg-background/90 border-border/40'
      }`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/mock-exams')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Exit
          </Button>

          {/* Timer — center */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
            isUrgent ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-primary/10 text-primary'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>

          {/* Submit button — always visible */}
          <Button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Send className="w-4 h-4 mr-1" />
            Submit
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-8 max-w-sm w-full text-center shadow-2xl border-primary/30">
            <Send className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Submit Exam?</h2>
            <p className="text-muted-foreground mb-2">
              You have answered <span className="font-bold text-foreground">{answeredCount}</span> of <span className="font-bold text-foreground">{questions.length}</span> questions.
            </p>
            {unansweredCount > 0 && (
              <p className="text-yellow-500 text-sm mb-4">
                ⚠️ {unansweredCount} question{unansweredCount > 1 ? 's' : ''} unanswered
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Keep Going
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={() => { setShowSubmitModal(false); submitExam(); }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-3xl flex-1">
        {/* Urgent Warning */}
        {isUrgent && (
          <Card className="p-3 mb-4 bg-red-500/10 border-red-500/40 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-400">Less than 5 minutes remaining! Exam will auto-submit.</p>
          </Card>
        )}

        {/* Exam title + progress */}
        <div className="mb-5">
          <h1 className="text-xl font-bold leading-tight mb-1">{mockExam.name}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length} · Answered {answeredCount}/{questions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-6 mb-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            Question {currentIndex + 1}
          </p>
          <p className="text-base md:text-lg leading-relaxed font-medium mb-6">
            {currentQuestion.question_text}
          </p>

          <div className="space-y-3">
            {[
              { key: 'A', value: currentQuestion.option_a },
              { key: 'B', value: currentQuestion.option_b },
              { key: 'C', value: currentQuestion.option_c },
              { key: 'D', value: currentQuestion.option_d },
            ].map((option) => {
              const isSelected = answers[currentQuestion.id] === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {option.key}
                    </span>
                    <span className={`flex-1 text-sm md:text-base ${isSelected ? 'font-medium' : ''}`}>
                      {option.value}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">✓</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex-1 max-w-[120px]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question grid */}
          <div className="flex-1 flex flex-wrap gap-1.5 justify-center">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                  idx === currentIndex
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-1 ring-offset-background'
                    : answers[q.id]
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
              } else {
                setShowSubmitModal(true);
              }
            }}
            className="flex-1 max-w-[120px]"
            variant={currentIndex === questions.length - 1 ? 'default' : 'outline'}
          >
            {currentIndex < questions.length - 1 ? (
              <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Finish <Send className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-primary/20 border border-primary/40 inline-block"></span>
            Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-secondary inline-block"></span>
            Unanswered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-primary inline-block"></span>
            Current
          </span>
        </div>
      </div>
    </div>
  );
}
