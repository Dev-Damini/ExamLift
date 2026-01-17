import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import { Topic, Question, ExamType } from '../../types';

export default function AdminQuestions() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    exam_type_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchQuestions();
    }
  }, [selectedTopic]);

  const fetchData = async () => {
    const [topicsRes, examTypesRes] = await Promise.all([
      supabase.from('topics').select('*, subject:subjects(*)').order('name'),
      supabase.from('exam_types').select('*'),
    ]);

    if (topicsRes.data) setTopics(topicsRes.data);
    if (examTypesRes.data) setExamTypes(examTypesRes.data);
  };

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', selectedTopic)
      .order('created_at', { ascending: false });

    if (data) setQuestions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }

    try {
      const { error } = await supabase.from('questions').insert({
        topic_id: selectedTopic,
        exam_type_id: formData.exam_type_id || null,
        question_text: formData.question_text,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c,
        option_d: formData.option_d,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation || null,
        difficulty: formData.difficulty,
      });

      if (error) throw error;

      toast.success('Question added successfully!');
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        difficulty: 'medium',
        exam_type_id: '',
      });
      setShowForm(false);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add question');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;

      toast.success('Question deleted');
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete question');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTopic) {
      toast.error('Please select a topic first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        const questionsToInsert = [];

        for (const line of dataLines) {
          // CSV format: question,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty,examTypeId
          const [question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, exam_type_id] = 
            line.split(',').map(s => s.trim());

          if (question_text && option_a && option_b && option_c && option_d && correct_answer) {
            questionsToInsert.push({
              topic_id: selectedTopic,
              question_text,
              option_a,
              option_b,
              option_c,
              option_d,
              correct_answer: correct_answer.toUpperCase() as 'A' | 'B' | 'C' | 'D',
              explanation: explanation || null,
              difficulty: (difficulty || 'medium') as 'easy' | 'medium' | 'hard',
              exam_type_id: exam_type_id || null,
            });
          }
        }

        if (questionsToInsert.length === 0) {
          toast.error('No valid questions found in CSV');
          return;
        }

        const { error } = await supabase.from('questions').insert(questionsToInsert);
        if (error) throw error;

        toast.success(`Successfully uploaded ${questionsToInsert.length} questions!`);
        fetchQuestions();
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload CSV');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Questions</h1>
          <Link to="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Topic Selection */}
        <Card className="p-6 mb-6">
          <Label className="mb-2 block">Select Topic</Label>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic: any) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.subject?.name} - {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {selectedTopic && (
          <>
            {/* Actions */}
            <div className="flex gap-4 mb-6">
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question Manually
              </Button>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                </label>
              </Button>
            </div>

            {/* CSV Format Guide */}
            <Card className="p-4 mb-6 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>CSV Format:</strong> question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D), explanation, difficulty (easy/medium/hard), examTypeId (optional)
              </p>
              <p className="text-xs text-muted-foreground">
                First row should be headers. Each question on a new line.
              </p>
            </Card>

            {/* Add Question Form */}
            {showForm && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Add New Question</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Option A</Label>
                      <Input
                        value={formData.option_a}
                        onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Option B</Label>
                      <Input
                        value={formData.option_b}
                        onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Option C</Label>
                      <Input
                        value={formData.option_c}
                        onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Option D</Label>
                      <Input
                        value={formData.option_d}
                        onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Correct Answer</Label>
                      <Select
                        value={formData.correct_answer}
                        onValueChange={(v) => setFormData({ ...formData, correct_answer: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v) => setFormData({ ...formData, difficulty: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Exam Type (Optional)</Label>
                      <Select
                        value={formData.exam_type_id}
                        onValueChange={(v) => setFormData({ ...formData, exam_type_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
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
                  </div>

                  <div>
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit">Add Question</Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">
                Questions ({questions.length})
              </h3>
              {questions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No questions yet for this topic.</p>
                </Card>
              ) : (
                questions.map((q) => (
                  <Card key={q.id} className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <p className="flex-1 font-medium">{q.question_text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 mb-3">
                      <div className={q.correct_answer === 'A' ? 'text-green-500 font-medium' : ''}>
                        A. {q.option_a}
                      </div>
                      <div className={q.correct_answer === 'B' ? 'text-green-500 font-medium' : ''}>
                        B. {q.option_b}
                      </div>
                      <div className={q.correct_answer === 'C' ? 'text-green-500 font-medium' : ''}>
                        C. {q.option_c}
                      </div>
                      <div className={q.correct_answer === 'D' ? 'text-green-500 font-medium' : ''}>
                        D. {q.option_d}
                      </div>
                    </div>
                    {q.explanation && (
                      <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3 mt-3">
                        {q.explanation}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {q.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                        Answer: {q.correct_answer}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
