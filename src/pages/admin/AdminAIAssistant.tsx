import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Lightbulb,
  Package,
  RefreshCw,
  Send,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };
type Intelligence = {
  total_revenue?: number;
  revenue_7d?: number;
  revenue_trend?: number;
  average_order_value?: number;
  fastest_growing?: number;
  slow_selling?: number;
  restock_candidates?: number;
  promotion_candidates?: number;
  alerts?: number;
};

const quickQuestions = [
  {
    label: 'What should I do today?',
    question:
      'What are the top 3 actions I should take today to improve the business? Explain what is happening, why it matters, and what I should do next.',
    icon: Target,
  },
  {
    label: 'Restock priorities',
    question:
      'Which products should I restock first and why? Consider recent demand, sales velocity and stock risk.',
    icon: Package,
  },
  {
    label: 'Promotion opportunities',
    question:
      'Which products should I promote and why? Suggest practical promotion or bundle ideas without inventing exact discount percentages.',
    icon: Lightbulb,
  },
  {
    label: 'Growth opportunities',
    question:
      'What are the most important growth opportunities in the business right now?',
    icon: TrendingUp,
  },
];

const formatMoney = (value?: number) =>
  typeof value === 'number'
    ? `৳${value.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`
    : '—';

const formatTrend = (value?: number) =>
  typeof value === 'number' ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : '—';

const AdminAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Assalamu Alaikum! 👋 I'm Miskat International's Advanced AI Business Copilot. I can analyze sales, demand, inventory risk, promotions and business opportunities.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<Intelligence>({});
  const [briefing, setBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || loading) return;

    setInput('');
    const currentHistory = messages.slice(-10);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-ai', {
        body: { message: text, history: currentHistory },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.intelligence) setIntelligence(data.intelligence);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.reply || 'Sorry, I could not generate an admin insight right now.',
        },
      ]);
    } catch (error) {
      console.error('Admin AI error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry! Something went wrong while connecting to the Admin AI. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateBriefing = async () => {
    if (briefingLoading) return;
    setBriefingLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-ai', {
        body: {
          message:
            'Give me a concise daily business briefing. Identify the most important business issue, explain why it matters, and give me the top 3 actions I should take today. Do not invent exact discount percentages or quantities unless supported by the data.',
          history: [],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.intelligence) setIntelligence(data.intelligence);
      setBriefing(data?.reply || 'I could not generate the daily briefing right now.');
    } catch (error) {
      console.error('Briefing error:', error);
      setBriefing('Unable to generate the daily briefing. Please try again.');
    } finally {
      setBriefingLoading(false);
    }
  };

  useEffect(() => {
    void generateBriefing();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">AI Business Copilot</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered sales, inventory, demand and business decisions
          </p>
        </div>

        <button
          type="button"
          onClick={() => void generateBriefing()}
          disabled={briefingLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${briefingLoading ? 'animate-spin' : ''}`} />
          {briefingLoading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{formatMoney(intelligence.total_revenue)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">7-Day Revenue</p>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{formatMoney(intelligence.revenue_7d)}</p>
          <p className="text-xs text-muted-foreground mt-1">Trend: {formatTrend(intelligence.revenue_trend)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Restock Priorities</p>
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{intelligence.restock_candidates ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Products requiring attention</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Promotion Opportunities</p>
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{intelligence.promotion_candidates ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Products worth reviewing</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Today's AI Business Briefing</h2>
            <p className="text-xs text-muted-foreground">
              AI analyzes your business and recommends the highest-priority actions
            </p>
          </div>
        </div>
        <div className="p-5">
          {briefingLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing your business...
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-6">
              {briefing || 'No briefing available yet. Click Refresh Insights.'}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickQuestions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => void sendMessage(item.question)}
                disabled={loading}
                className="text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Icon className="h-5 w-5 text-primary mb-3" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">Ask the AI to analyze this area</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">Miskat AI Business Copilot</p>
            <p className="text-xs text-muted-foreground">Ask anything about your business</p>
          </div>
        </div>

        <div className="min-h-[420px] max-h-[540px] overflow-y-auto p-5 space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-6 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                AI is analyzing your business...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask: What should I restock? What should I promote?"
            disabled={loading}
            className="flex-1 h-11 rounded-lg border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-11 px-4 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{loading ? 'Thinking...' : 'Send'}</span>
          </button>
        </form>
      </div>

      <div className="flex items-start gap-3 bg-muted/50 border border-border rounded-xl p-4">
        <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
        <p className="text-xs text-muted-foreground leading-5">
          AI recommendations are advisory only. The AI does not automatically change prices,
          inventory, payments, refunds, offers or banners. Final business decisions remain under administrator control.
        </p>
      </div>
    </div>
  );
};

export default AdminAIAssistant;
