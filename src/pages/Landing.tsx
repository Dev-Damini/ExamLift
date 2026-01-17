import { Link } from 'react-router-dom';
import { BookOpen, Brain, Trophy, TrendingUp, Sparkles, Target, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ExamLift
            </span>
          </div>
          <Link to={user ? '/dashboard' : '/auth'}>
            <Button size="lg">{user ? 'Dashboard' : 'Get Started'}</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Exam Prep</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Ace Your{' '}
              <span className="bg-gradient-to-r from-primary via-science to-art bg-clip-text text-transparent">
                Nigerian Exams
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Master WAEC, NECO, GCE, JAMB, and POST-UTME with AI-powered practice, mock exams, and personalized study guidance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={user ? '/dashboard' : '/auth'}>
                <Button size="lg" className="text-lg px-8 py-6">
                  {user ? 'Go to Dashboard' : 'Start Learning Free'}
                </Button>
              </Link>
              <Link to="/liftbot">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Brain className="w-5 h-5 mr-2" />
                  Meet LiftBot AI
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-art/20 rounded-3xl blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&q=80"
              alt="Students studying"
              className="relative rounded-3xl shadow-2xl border border-border/50"
            />
          </div>
        </div>
      </section>

      {/* Exam Types */}
      <section className="container mx-auto px-4 py-16 bg-card/30 rounded-3xl border border-border/40 my-16">
        <h2 className="text-3xl font-bold text-center mb-4">Comprehensive Exam Coverage</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Practice for all major Nigerian examinations with real exam-style questions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {['WAEC', 'NECO', 'GCE', 'JAMB', 'POST-UTME'].map((exam) => (
            <div key={exam} className="bg-background/60 border border-border rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{exam}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Study Tracks */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Choose Your Study Track</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Personalized learning paths for Science, Art, and Commercial students
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-science/20 to-science/5 border-2 border-science/30 rounded-3xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-science rounded-2xl flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Science</h3>
            <p className="text-muted-foreground mb-4">Physics, Chemistry, Biology, Agricultural Science, Geography</p>
            <ul className="space-y-2 text-sm">
              <li>✓ Compulsory subjects included</li>
              <li>✓ 5 core science subjects</li>
              <li>✓ Practical-focused questions</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-art/20 to-art/5 border-2 border-art/30 rounded-3xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-art rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Art</h3>
            <p className="text-muted-foreground mb-4">Literature, Government, History, CRS/IRS, Economics</p>
            <ul className="space-y-2 text-sm">
              <li>✓ Compulsory subjects included</li>
              <li>✓ 5 core art subjects</li>
              <li>✓ Essay-focused preparation</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-commercial/20 to-commercial/5 border-2 border-commercial/30 rounded-3xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-commercial rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Commercial</h3>
            <p className="text-muted-foreground mb-4">Economics, Accounting, Commerce, Business Studies, Marketing</p>
            <ul className="space-y-2 text-sm">
              <li>✓ Compulsory subjects included</li>
              <li>✓ 5 business subjects</li>
              <li>✓ Real-world applications</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Succeed</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="AI Tutor - LiftBot"
            description="Get instant explanations, study tips, and personalized guidance"
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Timed Mock Exams"
            description="Practice under real exam conditions with auto-submit timers"
          />
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Topic Practice"
            description="Master concepts with instant feedback and explanations"
          />
          <FeatureCard
            icon={<Award className="w-6 h-6" />}
            title="Progress Analytics"
            description="Track your performance and identify areas to improve"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <div className="bg-gradient-to-br from-primary/20 via-science/10 to-art/10 border border-primary/30 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Lift Your Grades?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian students achieving their exam goals with ExamLift
          </p>
          <Link to={user ? '/dashboard' : '/auth'}>
            <Button size="lg" className="text-lg px-12 py-6">
              {user ? 'Continue Learning' : 'Start Free Today'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 ExamLift. Empowering Nigerian students to achieve excellence.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
