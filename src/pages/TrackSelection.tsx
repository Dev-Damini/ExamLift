import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Trophy, BookOpen, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { ExamType, Track } from '../types';

export default function TrackSelection() {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    checkExistingSelection();
  }, []);

  const fetchData = async () => {
    const [examsRes, tracksRes] = await Promise.all([
      supabase.from('exam_types').select('*'),
      supabase.from('tracks').select('*'),
    ]);

    if (examsRes.data) setExamTypes(examsRes.data);
    if (tracksRes.data) setTracks(tracksRes.data);
  };

  const checkExistingSelection = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_track_selection')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    if (!selectedExam || !selectedTrack) {
      toast.error('Please select both exam type and study track');
      return;
    }

    if (!user) {
      toast.error('Please log in to continue');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to save track selection:', {
        user_id: user.id,
        track_id: selectedTrack,
        exam_type_id: selectedExam,
      });

      // Verify user profile exists first
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('User profile not found:', profileError);
        toast.error('Account setup incomplete. Please try logging in again.');
        navigate('/auth');
        return;
      }

      // Verify auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Please log in again.');
        navigate('/auth');
        return;
      }

      console.log('Auth session verified, user_id:', session.user.id);

      // Now insert the track selection
      const { data, error } = await supabase
        .from('user_track_selection')
        .insert({
          user_id: user.id,
          track_id: selectedTrack,
          exam_type_id: selectedExam,
        })
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Track selection saved successfully:', data);
      toast.success('Track selected successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving track selection:', error);
      toast.error(error.message || 'Failed to save selection. Please try again.');
      setLoading(false);
    }
  };

  const getTrackIcon = (name: string) => {
    if (name === 'Science') return Target;
    if (name === 'Art') return BookOpen;
    return TrendingUp;
  };

  const getTrackColor = (colorCode: string) => {
    const colors: Record<string, string> = {
      blue: 'from-science/20 to-science/5 border-science/30',
      purple: 'from-art/20 to-art/5 border-art/30',
      green: 'from-commercial/20 to-commercial/5 border-commercial/30',
    };
    return colors[colorCode] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ExamLift
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Choose Your Path</h1>
            <p className="text-xl text-muted-foreground">
              Select your exam type and study track to get personalized content
            </p>
          </div>

          {/* Exam Type Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Exam Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {examTypes.map((exam) => (
                <Card
                  key={exam.id}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                    selectedExam === exam.id
                      ? 'border-primary border-2 bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold">{exam.name}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Track Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Study Track</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tracks.map((track) => {
                const Icon = getTrackIcon(track.name);
                return (
                  <Card
                    key={track.id}
                    className={`p-8 cursor-pointer transition-all hover:scale-105 bg-gradient-to-br ${getTrackColor(
                      track.color_code
                    )} border-2 ${
                      selectedTrack === track.id
                        ? 'ring-4 ring-primary/50'
                        : ''
                    }`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div className="space-y-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        track.color_code === 'blue' ? 'bg-science' :
                        track.color_code === 'purple' ? 'bg-art' : 'bg-commercial'
                      }`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">{track.name}</h3>
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <span>Select Track</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedExam || !selectedTrack || loading}
              className="px-12 py-6 text-lg"
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
