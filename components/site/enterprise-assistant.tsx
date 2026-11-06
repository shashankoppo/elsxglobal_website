'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { syncLeadToOdoo } from '@/lib/odoo';
import { cn } from '@/lib/utils';

type Msg = { role: 'bot' | 'user'; text: string };

const SUGGESTED = [
  'How can AI improve our operations?',
  'What ERP solution fits our business?',
  'Tell me about your cybersecurity services',
  'I want to book a consultation',
];

const BOT_REPLIES: Record<string, string> = {
  'How can AI improve our operations?':
    'AI can transform your operations in three key ways: (1) Predictive analytics that forecast demand and risk, (2) Intelligent automation that eliminates repetitive tasks, and (3) AI assistants that support decisions across every team. Most clients see 40% faster decision cycles within 6 months. Would you like to explore what this looks like for your organization?',
  'What ERP solution fits our business?':
    'We implement unified ERP systems that connect finance, inventory, operations, and HR in real time. The right solution depends on your size, industry, and growth trajectory. Our ERP transformation starts with a needs assessment, then architecture design, then zero-downtime migration. Would you like to schedule a discovery call to discuss your specific needs?',
  'Tell me about your cybersecurity services':
    'Our cybersecurity practice covers zero-trust architecture, continuous threat monitoring, compliance (SOC 2, ISO 27001, GDPR, HIPAA), security audits, and incident response. We design security into your systems from the ground up — not bolt it on after. Would you like a security assessment for your organization?',
  'I want to book a consultation':
    'Excellent. I can connect you with a senior transformation advisor for a 45-minute strategy session. To get started, could you share your name and work email so we can set that up?',
};

const GENERIC_REPLY =
  'Great question. To give you the most relevant answer, could you share your name and work email? I\u2019ll connect you with a senior advisor who can address your specific situation.';

export function EnterpriseAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msgCount, setMsgCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 25000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleOpen() {
    setOpen(true);
    setShowPrompt(false);
    if (messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          text: "I'm the ELSxGlobal Enterprise Assistant. What business challenge can I help you think through?",
        },
      ]);
    }
  }

  function sendSuggested(text: string) {
    setInput(text);
    setTimeout(() => handleSend(text), 100);
  }

  function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;

    setMessages((prev) => [...prev, { role: 'user', text: content }]);
    setInput('');
    setMsgCount((c) => c + 1);

    const reply = BOT_REPLIES[content] ?? GENERIC_REPLY;
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    }, 600);
  }

  async function captureLead() {
    if (!name || !email) return;
    const { error } = await supabase.from('leads').insert({
      full_name: name,
      work_email: email,
      intent: 'chatbot',
      source: 'chatbot',
      message: messages.map((m) => `${m.role}: ${m.text}`).join('\n'),
    });
    if (!error) {
      setLeadCaptured(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `Thank you, ${name.split(' ')[0]}. A senior advisor will reach out within one business day. Is there anything else you'd like to know in the meantime?`,
        },
      ]);

      syncLeadToOdoo({
        full_name: name,
        work_email: email,
        intent: 'chatbot',
        source: 'chatbot',
        message: messages.map((m) => `${m.role}: ${m.text}`).join('\n'),
      });
    }
  }

  return (
    <>
      {/* Prompt bubble */}
      {showPrompt && !open && (
        <div className="fixed bottom-24 right-6 z-40 max-w-[280px] animate-slide-up">
          <div
            className="rounded-2xl p-4 shadow-xl"
            style={{
              background: 'rgba(10,14,26,0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderTop: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', boxShadow: '0 0 12px hsl(var(--primary)/0.5)' }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90 leading-relaxed">
                  I&apos;m the ELSxGlobal Enterprise Assistant. What business
                  challenge can I help you think through?
                </p>
                <button
                  onClick={handleOpen}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Start conversation →
                </button>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-white/30 hover:text-white/70 shrink-0 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-110 isolate"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
          boxShadow: '0 8px 24px hsl(var(--primary)/0.45)',
          willChange: 'transform',
        }}
        aria-label="Open AI assistant"
      >
        {open ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <MessageSquare className="h-6 w-6 relative z-10" />
        )}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'hsl(var(--primary)/0.5)', animationDuration: '2.5s' }}
          />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm animate-scale-in"
          style={{ willChange: 'transform' }}
        >
          <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxHeight: '520px',
              /* Premium glass: 96% opaque dark base + backdrop-blur = no page bleed, premium look */
              background: 'rgba(10, 14, 26, 0.96)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{
                background: 'rgba(14,22,44,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    boxShadow: '0 0 16px hsl(var(--primary)/0.5)',
                  }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400"
                  style={{ border: '2px solid rgba(14,22,44,0.98)', boxShadow: '0 0 6px rgba(52,211,153,0.7)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">ELSxGlobal Assistant</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(52,211,153,0.9)' }}>
                  ● Online — replies instantly
                </p>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]"
              style={{ background: 'rgba(8,11,22,0.6)' }}
            >
              {messages.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      m.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))',
                            color: 'white',
                            boxShadow: '0 2px 12px hsl(var(--primary)/0.3)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.88)',
                          }
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {msgCount >= 2 && !leadCaptured && (
                <div
                  className="rounded-xl p-3 space-y-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsl(var(--primary)/0.25)' }}
                >
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    To continue, share your name and email:
                  </p>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-sm border-0 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-primary/50"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  />
                  <Input
                    placeholder="Work email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 text-sm border-0 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-primary/50"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  />
                  <Button size="sm" onClick={captureLead} disabled={!name || !email} className="w-full h-8 text-xs">
                    Continue
                  </Button>
                </div>
              )}
            </div>

            {/* ── Suggested chips ── */}
            {messages.length <= 1 && (
              <div
                className="px-4 pb-3 pt-1 flex flex-wrap gap-1.5"
                style={{ background: 'rgba(8,11,22,0.6)' }}
              >
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendSuggested(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full transition-all duration-150"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'hsl(var(--primary)/0.5)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input bar ── */}
            <div
              className="flex items-center gap-2 px-3 py-3 shrink-0"
              style={{ background: 'rgba(14,18,32,0.98)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                className="h-9 text-sm border-0 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
              <button
                onClick={() => handleSend()}
                className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  boxShadow: '0 4px 14px hsl(var(--primary)/0.4)',
                }}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
