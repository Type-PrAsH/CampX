import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Send, RefreshCw, CheckCircle2, Info, 
  Terminal, User, Target, Clock, Users, MessageSquare,
  AlertCircle, Loader2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { CampaignData, ActivityLog, ScheduleSettings } from '../types';
import ScheduleSection from './ScheduleSection';

const INITIAL_SCHEDULE: ScheduleSettings = {
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  type: 'one-time',
};

const INITIAL_LOGS: ActivityLog[] = [
  { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'System ready. Waiting for campaign brief...', status: 'info' },
];

export default function CampaignWorkspace() {
  const [brief, setBrief] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSettings>(INITIAL_SCHEDULE);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, status: 'info' | 'success' | 'loading' = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      status
    }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const generateCampaign = async (isRegeneration = false) => {
    if (!brief.trim()) return;

    setIsGenerating(true);
    setError(null);
    if (!isRegeneration) setCampaign(null);
    
    addLog(isRegeneration ? 'Processing feedback and regenerating...' : 'Parsing campaign brief...', 'loading');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      addLog('Fetching customer cohort data...', 'loading');
      await new Promise(r => setTimeout(r, 800));
      
      addLog('Creating customer segments...', 'loading');
      await new Promise(r => setTimeout(r, 600));

      addLog('Generating campaign strategy...', 'loading');
      
      const prompt = `
        You are an AI Marketing Assistant. Based on the following brief, generate a comprehensive email campaign.
        Brief: ${brief}
        ${isRegeneration ? `Feedback for improvement: ${feedback}` : ''}

        Return the response in JSON format with the following structure:
        {
          "strategy": "A brief overview of the marketing strategy",
          "targetSegment": "The specific audience segment targeted",
          "sendTime": "Optimal time to send (e.g., 7:00 PM)",
          "estimatedAudience": "Number of people in this segment (e.g., 45,000)",
          "subject": "Compelling email subject line",
          "body": "The full email body content",
          "explanation": {
            "audience": "Reason for choosing this audience",
            "sendTime": "Reason for choosing this send time",
            "tone": "Reason for the chosen email tone"
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strategy: { type: Type.STRING },
              targetSegment: { type: Type.STRING },
              sendTime: { type: Type.STRING },
              estimatedAudience: { type: Type.STRING },
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              explanation: {
                type: Type.OBJECT,
                properties: {
                  audience: { type: Type.STRING },
                  sendTime: { type: Type.STRING },
                  tone: { type: Type.STRING }
                }
              }
            },
            required: ["strategy", "targetSegment", "sendTime", "estimatedAudience", "subject", "body", "explanation"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      setCampaign(result);
      addLog('Email content generated successfully.', 'success');
      addLog('Waiting for human approval...', 'info');
    } catch (err) {
      console.error(err);
      setError('Failed to generate campaign. Please check your API key or try again.');
      addLog('Error during generation process.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Campaign Workspace</h2>
          <p className="text-slate-500 font-medium">Collaborate with AI to create high-performing email campaigns.</p>
        </div>
      </div>

      {/* Brief Input Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-sm">
          <MessageSquare className="w-5 h-5 text-[#6366F1]" />
          <h3>Campaign Brief</h3>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g., Run email campaign for launching XDeposit. Offer 1% higher returns than competitors. Give additional 0.25% benefits to female senior citizens. Optimize for open rate and click rate. Include this link: https://superbfsi.com/xdeposit/explore/"
          className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all resize-none text-slate-700 placeholder:text-slate-400 font-medium outline-none"
        />
        <div className="flex justify-end">
          <button
            onClick={() => generateCampaign()}
            disabled={isGenerating || !brief.trim()}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-200 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Workspace Content */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {isGenerating && !campaign && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm"
              >
                <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin" />
                <div>
                  <h4 className="text-xl font-bold text-slate-900">AI is crafting your campaign...</h4>
                  <p className="text-slate-500 font-medium">Analyzing brief, segments, and historical data.</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 text-red-700 shadow-sm"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold">Generation Error</h4>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </motion.div>
            )}

            {campaign && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Campaign Strategy Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Segment</p>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Users className="w-4 h-4 text-[#6366F1]" />
                        {campaign.targetSegment}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send Time</p>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Clock className="w-4 h-4 text-[#6366F1]" />
                        {campaign.sendTime}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Audience</p>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Target className="w-4 h-4 text-[#6366F1]" />
                        {campaign.estimatedAudience}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategy</p>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm truncate">
                        <Sparkles className="w-4 h-4 text-[#6366F1]" />
                        {campaign.strategy}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-sm">
                      <Mail className="w-5 h-5 text-[#6366F1]" />
                      <h3>Email Preview</h3>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                        <p className="text-lg font-bold text-slate-900">{campaign.subject}</p>
                      </div>
                      <div className="h-px bg-slate-200 w-full" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Body</p>
                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                          {campaign.body}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm">
                    <RefreshCw className="w-5 h-5 text-indigo-400" />
                    <h3>Manual Feedback & Regeneration</h3>
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g., Keep tone formal, shorten the email, add urgency, remove emojis..."
                    className="w-full h-24 p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all resize-none placeholder:text-slate-500 font-medium outline-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => generateCampaign(true)}
                      disabled={isGenerating || !feedback.trim()}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-slate-700"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                      Regenerate
                    </button>
                    <button
                      onClick={() => {
                        addLog('Campaign approved and scheduled.', 'success');
                        setIsApproved(true);
                        setTimeout(() => setIsApproved(false), 5000);
                      }}
                      className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm & Approve
                    </button>
                  </div>
                  <AnimatePresence>
                    {isApproved && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Campaign has been scheduled successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-8">
          {/* Scheduling Section */}
          <ScheduleSection settings={schedule} onChange={setSchedule} />

          {/* Explainable AI Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-sm">
              <Info className="w-5 h-5 text-[#6366F1]" />
              <h3>AI Strategy Explanation</h3>
            </div>
            
            {campaign ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Audience</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{campaign.explanation.audience}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send Time</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{campaign.explanation.sendTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Tone</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{campaign.explanation.tone}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic font-medium">Generate a campaign to see AI reasoning.</p>
            )}
          </div>

          {/* Agent Activity Logs */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl space-y-4 h-[400px] flex flex-col">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3>Agent Activity Logs</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] custom-scrollbar pr-2">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span className={cn(
                    "flex items-center gap-2",
                    log.status === 'success' ? 'text-emerald-400' : 
                    log.status === 'loading' ? 'text-indigo-400' : 'text-slate-300'
                  )}>
                    {log.status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {log.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mail(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
