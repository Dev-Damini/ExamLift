export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface ExamType {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Track {
  id: string;
  name: string;
  color_code: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  track_id: string | null;
  is_compulsory: boolean;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  exam_type_id: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  created_at: string;
}

export interface MockExam {
  id: string;
  name: string;
  exam_type_id: string | null;
  duration_minutes: number;
  total_questions: number;
  created_at: string;
}

export interface UserTrackSelection {
  id: string;
  user_id: string;
  track_id: string;
  exam_type_id: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  questions_attempted: number;
  questions_correct: number;
  last_practiced_at: string;
  created_at: string;
}

export interface UserMockAttempt {
  id: string;
  user_id: string;
  mock_exam_id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  answers: Record<string, string>;
  completed_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface TopicWithSubject extends Topic {
  subject: Subject;
}

export interface QuestionWithTopic extends Question {
  topic: TopicWithSubject;
}
