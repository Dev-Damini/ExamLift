import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Brain, Loader2, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';

export default function LiftBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to UI
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      message: userMessage,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Save user message to database
    await supabase.from('chat_history').insert({
      user_id: user.id,
      message: userMessage,
      role: 'user',
    });

    try {
      // Call LiftBot Edge Function
      const { data, error } = await supabase.functions.invoke('liftbot', {
        body: { message: userMessage },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof Error && 'context' in error) {
          try {
            const context = (error as any).context;
            const statusCode = context?.status ?? 500;
            const textContent = await context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = error.message || 'Failed to get response';
          }
        }
        throw new Error(errorMessage);
      }

      const aiResponse = data?.response || 'Sorry, I could not generate a response.';

      // Add AI response to UI
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        message: aiResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message to database
      await supabase.from('chat_history').insert({
        user_id: user.id,
        message: aiResponse,
        role: 'assistant',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to get response from LiftBot');
      console.error('LiftBot error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to clear your chat history?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error: any) {
      toast.error('Failed to clear history');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">LiftBot</h1>
                <p className="text-xs text-muted-foreground">Your AI Study Companion</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Hi {user?.username}! I'm LiftBot</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your AI-powered study companion for exam preparation
              </p>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="p-4 hover:border-primary/50 cursor-pointer" onClick={() => setInput("Explain photosynthesis")}>
                  <p className="font-medium mb-1">💡 Explain Topics</p>
                  <p className="text-sm text-muted-foreground">Get clear explanations for difficult concepts</p>
                </Card>
                <Card className="p-4 hover:border-primary/50 cursor-pointer" onClick={() => setInput("Generate practice questions on mathematics")}>
                  <p className="font-medium mb-1">📝 Practice Questions</p>
                  <p className="text-sm text-muted-foreground">Get AI-generated questions for any topic</p>
                </Card>
                <Card className="p-4 hover:border-primary/50 cursor-pointer" onClick={() => setInput("Give me study tips for JAMB")}>
                  <p className="font-medium mb-1">🎯 Study Tips</p>
                  <p className="text-sm text-muted-foreground">Receive personalized study strategies</p>
                </Card>
                <Card className="p-4 hover:border-primary/50 cursor-pointer" onClick={() => setInput("What are the key concepts in physics?")}>
                  <p className="font-medium mb-1">🔍 Topic Summaries</p>
                  <p className="text-sm text-muted-foreground">Get quick summaries of important topics</p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <Card
                    className={`p-4 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-card'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </Card>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-science/20 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                      <span className="font-bold text-science">
                        {user?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mr-3">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <Card className="p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask LiftBot anything about your studies..."
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} size="lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            LiftBot is powered by AI. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
