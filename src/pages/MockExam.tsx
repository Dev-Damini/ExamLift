import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { MockExam as MockExamType, Question } from '../types';

export default function MockExam() {
  const { mockId } = useParams();
  const [mockExam, setMockExam] = useState<MockExamType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime] = useState(Date.now());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMockExam();
  }, [mockId]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

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

      // Get questions for this mock exam
      const { data: mockQuestions } = await supabase
        .from('mock_questions')
        .select('question_id')
        .eq('mock_exam_id', mockId)
        .order('question_order');

      if (mockQuestions && mockQuestions.length > 0) {
        const questionIds = mockQuestions.map((mq) => mq.question_id);
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .in('id', questionIds);

        if (questionsData) setQuestions(questionsData);
      }
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!user || !mockExam) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let score = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    try {
      const { data, error } = await supabase
        .from('user_mock_attempts')
        .insert({
          user_id: user.id,
          mock_exam_id: mockExam.id,
          score,
          total_questions: questions.length,
          time_taken_seconds: timeTaken,
          answers,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast.success(`Mock exam completed! Score: ${score}/${questions.length}`);
        navigate(`/results/${data.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit exam');
    }
  };

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
  const isUrgent = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`border-b backdrop-blur-sm sticky top-0 z-50 ${
        isUrgent ? 'bg-red-500/10 border-red-500/50' : 'bg-background/80 border-border/40'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
              isUrgent ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Timer Warning */}
        {isUrgent && (
          <Card className="p-4 mb-6 bg-red-500/10 border-red-500/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium">Less than 5 minutes remaining!</p>
            </div>
          </Card>
        )}

        {/* Exam Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{mockExam.name}</h1>
          <p className="text-muted-foreground">
            Answer all questions · {mockExam.duration_minutes} minutes · Answered:{' '}
            {Object.keys(answers).length}/{questions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <span className="text-sm text-muted-foreground mb-2 block">
              Question {currentIndex + 1}
            </span>
            <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
          </div>

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
                  onClick={() => handleAnswer(currentQuestion.id, option.key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold flex-shrink-0">
                      {option.key}
                    </span>
                    <span className="flex-1">{option.value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  idx === currentIndex
                    ? 'bg-primary text-white'
                    : answers[questions[idx].id]
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} size="lg">
              Submit Exam
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
