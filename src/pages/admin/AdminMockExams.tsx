import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import { MockExam, ExamType } from '../../types';

export default function AdminMockExams() {
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    exam_type_id: '',
    duration_minutes: 90,
    total_questions: 40,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [mocksRes, examTypesRes] = await Promise.all([
      supabase.from('mock_exams').select('*').order('created_at', { ascending: false }),
      supabase.from('exam_types').select('*'),
    ]);

    if (mocksRes.data) setMockExams(mocksRes.data);
    if (examTypesRes.data) setExamTypes(examTypesRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('mock_exams').insert({
        name: formData.name,
        exam_type_id: formData.exam_type_id || null,
        duration_minutes: formData.duration_minutes,
        total_questions: formData.total_questions,
      });

      if (error) throw error;

      toast.success('Mock exam created successfully!');
      setFormData({
        name: '',
        exam_type_id: '',
        duration_minutes: 90,
        total_questions: 40,
      });
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create mock exam');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Mock Exams</h1>
          <Link to="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Mock Exam
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Create New Mock Exam</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Exam Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., JAMB Physics Mock 2025"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Exam Type</Label>
                  <Select
                    value={formData.exam_type_id}
                    onValueChange={(v) => setFormData({ ...formData, exam_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <Label>Total Questions</Label>
                  <Input
                    type="number"
                    value={formData.total_questions}
                    onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">Create Mock Exam</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Mock Exams List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Mock Exams ({mockExams.length})</h3>
          {mockExams.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No mock exams created yet.</p>
            </Card>
          ) : (
            mockExams.map((mock) => (
              <Card key={mock.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg mb-2">{mock.name}</h4>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>⏱️ {mock.duration_minutes} minutes</span>
                      <span>📝 {mock.total_questions} questions</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Add Questions
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="p-6 mt-8 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> After creating a mock exam, you need to assign questions to it. This feature will be available in the next update. For now, you can manually add questions via the database.
          </p>
        </Card>
      </div>
    </div>
  );
}
