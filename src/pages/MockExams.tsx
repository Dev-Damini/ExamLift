import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, FileText, Trophy, Play, BookOpen } from 'lucide-react';

interface MockExamItem {
  id: string;
  name: string;
  duration_minutes: number;
  total_questions: number;
  exam_type: string;
  question_count: number;
}

export default function MockExams() {
  const [exams, setExams] = useState<MockExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMockExams();
  }, []);

  const fetchMockExams = async () => {
    const { data: mockExams } = await supabase
      .from('mock_exams')
      .select('id, name, duration_minutes, total_questions, exam_types(name)')
      .order('created_at', { ascending: false });

    if (mockExams) {
      // Get question counts for each mock exam
      const examsWithCounts = await Promise.all(
        mockExams.map(async (exam) => {
          const { count } = await supabase
            .from('mock_questions')
            .select('*', { count: 'exact', head: true })
            .eq('mock_exam_id', exam.id);

          return {
            id: exam.id,
            name: exam.name,
            duration_minutes: exam.duration_minutes,
            total_questions: exam.total_questions,
            exam_type: (exam.exam_types as any)?.name || 'WAEC',
            question_count: count || 0,
          };
        })
      );
      setExams(examsWithCounts);
    }
    setLoading(false);
  };

  const getDifficultyBadge = (duration: number) => {
    if (duration <= 20) return { label: 'Quick Test', color: 'bg-green-500/10 text-green-500' };
    if (duration <= 45) return { label: 'Standard', color: 'bg-primary/10 text-primary' };
    return { label: 'Full Exam', color: 'bg-red-500/10 text-red-500' };
  };

  const getExamTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      WAEC: 'bg-blue-500/10 text-blue-400',
      JAMB: 'bg-purple-500/10 text-purple-400',
      NECO: 'bg-green-500/10 text-green-400',
      GCE: 'bg-orange-500/10 text-orange-400',
    };
    return colors[type] || 'bg-primary/10 text-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Mock Exams</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-3">Practice Under Real Conditions</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Timed mock exams that simulate real WAEC, NECO, and JAMB exam conditions. Timer auto-submits when time is up.
          </p>
        </div>

        {/* Exam Tips */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Card className="p-4 text-center bg-primary/5 border-primary/20">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Timed</p>
            <p className="text-xs text-muted-foreground">Auto-submits at 0:00</p>
          </Card>
          <Card className="p-4 text-center bg-green-500/5 border-green-500/20">
            <FileText className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Detailed Results</p>
            <p className="text-xs text-muted-foreground">Score + breakdown</p>
          </Card>
          <Card className="p-4 text-center bg-art/5 border-art/20">
            <BookOpen className="w-6 h-6 text-art mx-auto mb-2" />
            <p className="text-sm font-medium">Explanations</p>
            <p className="text-xs text-muted-foreground">Learn from mistakes</p>
          </Card>
        </div>

        {/* Exams List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : exams.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No mock exams available yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const difficulty = getDifficultyBadge(exam.duration_minutes);
              return (
                <Card
                  key={exam.id}
                  className="p-6 hover:shadow-lg hover:border-primary/40 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 transition-colors">
                      <Trophy className="w-7 h-7 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getExamTypeBadge(exam.exam_type)}`}>
                          {exam.exam_type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-2">{exam.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exam.duration_minutes} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {exam.question_count} questions
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => navigate(`/mock/${exam.id}`)}
                      className="flex-shrink-0 gap-2"
                      size="lg"
                      disabled={exam.question_count === 0}
                    >
                      <Play className="w-4 h-4" />
                      Start Exam
                    </Button>
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
