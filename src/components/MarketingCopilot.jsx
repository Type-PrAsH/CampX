import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Bot,
    X,
    Send,
    Sparkles,
    Loader2,
    AlertCircle,
    ChevronDown,
    Zap,
    Users,
    Clock,
    TrendingUp,
    Target,
    MessageSquare,
} from "lucide-react";
import Groq from "groq-sdk";
import { useRealData } from "../hooks/useRealData";

import { getCustomerCohort } from "../services/campaignx";

// ─── Suggested Quick Questions ────────────────────────────────────────────────

const QUICK_QUESTIONS = [
    { label: "Analyze campaign performance", icon: TrendingUp },
    { label: "Best send time?", icon: Clock },
    { label: "Improve open rate", icon: Zap },
    { label: "Find best audience", icon: Users },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCohortSummary() {
    try {
        const data = await getCustomerCohort();
        if (!Array.isArray(data)) return { size: 0, sample: [] };
        return { size: data.length, sample: data.slice(0, 5) };
    } catch (e) {
        console.error("MarketingCopilot failed to fetch live cohort summary:", e);
        return { size: 0, sample: [] };
    }
}

function getCampaignHistoryCount() {
    try {
        const raw = localStorage.getItem("campaignx_history");
        if (!raw) return 0;
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data.length : 0;
    } catch {
        return 0;
    }
}

async function buildSystemPrompt(metrics, chartData) {
    const cohort = await getCohortSummary();
    const historyCount = getCampaignHistoryCount();

    const genderStr = (chartData?.genderEngagement || [])
        .map((g) => `${g.name}: ${g.value} opens`)
        .join(", ");

    const ageStr = (chartData?.ageGroupEngagement || [])
        .map((a) => `${a.name}: ${a.value} opens`)
        .join(", ");

    const segmentStr = (chartData?.clickRateBySegment || [])
        .map((s) => `${s.name}: ${s.value}% click rate`)
        .join(", ");

    const bestTimeOfDay = (chartData?.timeOfDayData || []).reduce(
        (best, cur) => (cur.value > (best?.value || 0) ? cur : best),
        null
    );

    const engTrend = (chartData?.engagementTrend || [])
        .map((e) => `${e.name}: ${e.value}`)
        .join(", ");

    return `You are a professional marketing strategist AI working inside the CampX platform.

You specialize in:
- Email marketing
- Customer segmentation
- Campaign optimization
- Engagement growth

You analyze campaign data and provide actionable marketing insights.

Always answer in this structured format:
**Insight:** <short marketing insight>
**Explanation:** <why this is happening based on the data>
**Recommended Action:** <specific action to improve the campaign>

Do NOT hallucinate numbers. Use ONLY the data provided below.

--- LIVE CAMPAIGN DATA ---

Total Emails Sent: ${metrics?.totalSent || "0"}
Open Rate: ${metrics?.openRate || "0%"}
Click Rate: ${metrics?.clickRate || "0%"}
Unsubscribe Rate: ${metrics?.unsubscribes || "0%"}
Open Rate Trend: ${metrics?.openRateTrend || "neutral"}
Click Rate Trend: ${metrics?.clickRateTrend || "neutral"}

Total Campaigns Run: ${historyCount}
Audience Size (Cohort): ${cohort.size} customers

Gender Engagement: ${genderStr || "No data"}
Age Group Engagement: ${ageStr || "No data"}
Click Rate by Segment: ${segmentStr || "No data"}
Best Time of Day to Send: ${bestTimeOfDay ? bestTimeOfDay.name : "Unknown"}
Engagement Trend (Weekly): ${engTrend || "No data"}

--- END OF DATA ---`;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, index }) {
    const isUser = msg.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, delay: index * 0.03 }}
            className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
        >
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-md shadow-teal-200">
                    <Bot className="w-3.5 h-3.5 text-white" />
                </div>
            )}
            <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                    ? "bg-gradient-to-br from-teal-700 to-teal-500 text-white rounded-br-sm shadow-lg shadow-teal-200 dark:shadow-teal-900/20"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-sm"
                    }`}
            >
                {isUser ? (
                    msg.content
                ) : (
                    <FormattedAIMessage content={msg.content} />
                )}
            </div>
        </motion.div>
    );
}

function FormattedAIMessage({ content }) {
    // Bold **text** and render structured lines nicely
    const lines = content.split("\n").filter((l) => l.trim() !== "");
    return (
        <div className="space-y-1.5">
            {lines.map((line, i) => {
                // Bold section headers like **Insight:**
                const formatted = line.replace(
                    /\*\*(.*?)\*\*/g,
                    '<span class="font-semibold text-teal-700 dark:text-teal-400">$1</span>'
                );
                return (
                    <p
                        key={i}
                        className="text-slate-700 dark:text-slate-300 text-[13px] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                );
            })}
        </div>
    );
}

// ─── Main Copilot Component ───────────────────────────────────────────────────

export default function MarketingCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hey! 👋 I'm your CampX Marketing Copilot. I can analyze your campaign data, suggest improvements, and answer any marketing questions.\n\nWhat would you like to explore today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const { metrics, chartData } = useRealData();

    // Listen for sidebar "AI Copilot" button
    useEffect(() => {
        const handler = () => setIsOpen(true);
        window.addEventListener("campx:open-copilot", handler);
        return () => window.removeEventListener("campx:open-copilot", handler);
    }, []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (userText) => {
        const text = (userText || input).trim();
        if (!text || isLoading) return;

        setInput("");
        setError(null);

        const newMessages = [...messages, { role: "user", content: text }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const settingsKey = localStorage.getItem("groq_api_key");
            const envKey = import.meta.env.VITE_GROQ_API_KEY;
            const apiKey = settingsKey || envKey;

            if (!apiKey) {
                throw new Error(
                    "Groq API key required for AI Copilot. Please add it in Settings."
                );
            }

            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

            const systemPrompt = await buildSystemPrompt(metrics, chartData);

            // Build conversation history for multi-turn (keep last 10 turns)
            const conversationHistory = newMessages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                temperature: 0.4,
                max_tokens: 800,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory,
                ],
            });

            const aiReply =
                response.choices[0]?.message?.content ||
                "I couldn't generate a response. Please try again.";

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: aiReply },
            ]);
        } catch (err) {
            console.error("Copilot error:", err);
            const errMsg = err.message || "Failed to get AI response.";
            setError(errMsg);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `⚠️ ${errMsg}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* ── Floating Toggle Button ── */}
            <motion.button
                onClick={() => setIsOpen((o) => !o)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-500 shadow-2xl shadow-teal-300 flex items-center justify-center text-white transition-all"
                title="AI Marketing Copilot"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <ChevronDown className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse indicator */}
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            </motion.button>

            {/* ── Copilot Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-300/60 dark:shadow-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                        style={{ maxHeight: "580px" }}
                    >
                        {/* ── Header ── */}
                        <div className="bg-gradient-to-r from-teal-700 to-teal-500 p-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-tight">
                                        CampX Marketing Copilot
                                    </p>
                                    <p className="text-teal-100 text-[11px]">
                                        Powered by Groq · llama-3.3-70b
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ── Chat Area ── */}
                        <div
                            className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-1 scroll-smooth"
                            style={{ minHeight: 0 }}
                        >
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} index={i} />
                            ))}

                            {/* Loading indicator */}
                            <AnimatePresence>
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="flex items-center gap-2 mb-3"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-200 dark:shadow-teal-900/20">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />
                                            <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                                                Analyzing your data...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={chatEndRef} />
                        </div>

                        {/* ── Quick Questions ── */}
                        <div className="px-4 pt-3 pb-1 flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">
                                Quick Insights
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_QUESTIONS.map(({ label, icon: Icon }) => (
                                    <button
                                        key={label}
                                        onClick={() => sendMessage(label)}
                                        disabled={isLoading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-[11px] font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-teal-100 dark:border-teal-800/50 hover:border-teal-200 dark:hover:border-teal-700"
                                    >
                                        <Icon className="w-3 h-3" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Input Area ── */}
                        <div className="p-3 flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-end gap-2">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask about campaign insights..."
                                        rows={1}
                                        disabled={isLoading}
                                        className="w-full resize-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:opacity-60 leading-relaxed"
                                        style={{ maxHeight: "80px", overflowY: "auto" }}
                                        onInput={(e) => {
                                            e.target.style.height = "auto";
                                            e.target.style.height =
                                                Math.min(e.target.scrollHeight, 80) + "px";
                                        }}
                                    />
                                </div>
                                <motion.button
                                    onClick={() => sendMessage()}
                                    disabled={isLoading || !input.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </motion.button>
                            </div>
                            <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-2 font-medium">
                                Press Enter to send · Shift+Enter for new line
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
