import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, BookOpen, FileQuestion, Clock, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalTopics: 0,
    totalMockExams: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [questions, topics, mocks, users] = await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('topics').select('id', { count: 'exact', head: true }),
      supabase.from('mock_exams').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalQuestions: questions.count || 0,
      totalTopics: topics.count || 0,
      totalMockExams: mocks.count || 0,
      totalUsers: users.count || 0,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-science/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-science" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTopics}</p>
                <p className="text-sm text-muted-foreground">Total Topics</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-art/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-art" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMockExams}</p>
                <p className="text-sm text-muted-foreground">Mock Exams</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-commercial/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-commercial" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/admin/questions">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileQuestion className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Manage Questions</h3>
                  <p className="text-muted-foreground mb-4">
                    Add, edit, and organize practice questions by topic
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Upload questions via CSV</li>
                    <li>• Add questions manually</li>
                    <li>• Edit existing questions</li>
                    <li>• Organize by topic and subject</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/mocks">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-science/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-8 h-8 text-science" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Manage Mock Exams</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and manage full-length mock examinations
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create new mock exams</li>
                    <li>• Set exam duration and questions</li>
                    <li>• Assign questions to exams</li>
                    <li>• Configure exam settings</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
