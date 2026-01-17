import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { authService } from '../lib/auth';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Trophy, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      toast.error('Please fill all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signUp(email, password, username);
      if (user) {
        // Wait a bit to ensure the database trigger creates the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the created profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_admin, username')
          .eq('id', user.id)
          .single();
        
        login({
          id: user.id,
          email: user.email!,
          username: profile?.username || username,
          isAdmin: profile?.is_admin || false,
        });
        toast.success('Account created successfully!');
        navigate('/track-selection');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signInWithPassword(email, password);
      if (user) {
        // Fetch user profile for admin status
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_admin, username')
          .eq('id', user.id)
          .single();
        
        login({
          id: user.id,
          email: user.email!,
          username: profile?.username || user.user_metadata?.username || user.email!.split('@')[0],
          isAdmin: profile?.is_admin || false,
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ExamLift
          </span>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Enter your credentials to continue'
                : 'Start your exam prep journey'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a password (min 6 characters)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignUp())}
                />
              </div>
            </div>

            <Button
              onClick={mode === 'login' ? handleLogin : handleSignUp}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {mode === 'login' ? 'New to ExamLift?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="w-full"
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
