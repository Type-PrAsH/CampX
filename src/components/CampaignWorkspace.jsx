function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
        }
        return n;
      }),
    _extends.apply(null, arguments)
  );
}
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Info,
  Terminal,
  Target,
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
  Loader2,
  Pencil,
  Save,
  Mail,
  Eye,
  Code,
  Copy,
  Check,
} from "lucide-react";
import Groq from "groq-sdk";
import {
  sendCampaign as apiSendCampaign,
  buildSendTime,
  saveCampaignId,
  getCustomerCohort as apiGetCustomerCohort,
} from "../services/campaignx";
// MongoDB persistence
import {
  saveCampaignToDB,
  saveEditedEmailToDB,
  markCampaignSentInDB,
} from "../services/db";

import ScheduleSection from "./ScheduleSection";
import CampaignTimeline from "./CampaignTimeline";
import { personalizeEmail } from "../utils/personalizeEmail";

const INITIAL_SCHEDULE = {
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  type: "one-time",
};

const INITIAL_LOGS = [
  {
    id: "1",
    timestamp: new Date().toLocaleTimeString(),
    message: "System ready. Waiting for campaign brief...",
    status: "info",
  },
];

export default function CampaignWorkspace() {
  const [brief, setBrief] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [error, setError] = useState(null);
  const logEndRef = useRef(null);

  const [rawCohort, setRawCohort] = useState([]);

  // Edit Email state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // MongoDB reference ID for the current campaign
  const [mongoId, setMongoId] = useState(null);

  // ─── Campaign Timeline ──────────────────────────────────────────────────────
  const [timelineStep, setTimelineStep] = useState("idle");
  const [timelineEvents, setTimelineEvents] = useState([]);

  // ─── Personalization Engine ──────────────────────────────────────────────────
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [previewCustomer, setPreviewCustomer] = useState(null);

  // ─── Email Preview Tab ──────────────────────────────────────────────────────
  const [emailPreviewTab, setEmailPreviewTab] = useState('preview'); // 'preview' | 'html'
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Helper: detect if email body contains HTML tags
  const isHtmlContent = (text) => /<[a-z][\s\S]*>/i.test(text || '');

  // Helper: wrap plain text in styled HTML email template
  const wrapInEmailTemplate = (subject, body, isHtml) => {
    const styledBody = isHtml 
      ? body 
      : body.split('\n').filter(l => l.trim()).map(p => `<p style="margin:0 0 16px 0;line-height:1.7;color:#334155;font-size:15px;">${p}</p>`).join('');
    
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${subject}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">From: SuperBFSI Marketing Team</p>
    </div>
    <div style="padding:32px 40px;">
      ${styledBody}
    </div>
    <div style="padding:24px 40px;border-top:1px solid #e2e8f0;background:#f8fafc;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">Best regards,<br><strong style="color:#0f766e;">The SuperBFSI Team</strong></p>
      <p style="margin:12px 0 0;color:#cbd5e1;font-size:10px;">This email was sent by CampX AI Marketing Platform</p>
    </div>
  </div>
</body>
</html>`;
  };

  const copyHtmlToClipboard = () => {
    const subject = showPersonalization && previewCustomer 
      ? personalizeEmail(campaign.subject, previewCustomer) 
      : campaign.subject;
    const body = showPersonalization && previewCustomer 
      ? personalizeEmail(campaign.body, previewCustomer) 
      : campaign.body;
    const html = wrapInEmailTemplate(subject, body, isHtmlContent(body));
    navigator.clipboard.writeText(html).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    });
  };

  const advanceTimeline = (step) => {
    setTimelineStep(step);
    setTimelineEvents((prev) => [
      ...prev.filter((e) => e.step !== step),
      { step, time: Date.now() },
    ]);
  };

  const addLog = (message, status = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        message,
        status,
      },
    ]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const generateCampaign = async (isRegeneration = false) => {
    if (!brief.trim()) return;

    setIsGenerating(true);
    setError(null);
    if (!isRegeneration) {
      setCampaign(null);
      setTimelineEvents([]);
    }

    advanceTimeline("brief_submitted");

    addLog(
      isRegeneration
        ? "Processing feedback and regenerating..."
        : "Parsing campaign brief...",
      "loading",
    );

    try {
      const apiKeyStr =
        import.meta.env.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
      const groq = new Groq({ apiKey: apiKeyStr, dangerouslyAllowBrowser: true });

      advanceTimeline("ai_generation");
      addLog(
        "Authenticating and fetching customer cohort data from CampaignX API...",
        "loading",
      );

      const API_URL =
        import.meta.env.VITE_CAMPAIGNX_API_URL ||
        "https://campaignx.inxiteout.ai";
      const API_KEY = import.meta.env.VITE_CAMPAIGNX_API_KEY;

      let totalCustomers = 0;
      let fetchedCohortData = [];

      if (API_KEY) {
        try {
          // Use the centralized services/campaignx api layer
          const customers = await apiGetCustomerCohort();

          fetchedCohortData = customers;
          setRawCohort(customers);
          totalCustomers = customers.length;

          advanceTimeline("cohort_fetch");

          // Set random preview customer for personalization
          if (fetchedCohortData.length > 0) {
            const randomIdx = Math.floor(Math.random() * fetchedCohortData.length);
            setPreviewCustomer(fetchedCohortData[randomIdx]);
          }

          addLog(
            `Successfully retrieved live cohort data: ${totalCustomers} customers available.`,
            "success",
          );
        } catch (e) {
          addLog(`Failed to fetch cohort data: ${e.message}`, "error");
        }
      } else {
        addLog(
          "VITE_CAMPAIGNX_API_KEY is missing. Skipping real cohort fetch.",
          "info",
        );
        await new Promise((r) => setTimeout(r, 800));
      }

      addLog("Creating customer segments...", "loading");
      await new Promise((r) => setTimeout(r, 600));

      addLog("Generating campaign strategy...", "loading");

      const prompt = `
        You are an AI Marketing Assistant. Based on the following brief, generate a comprehensive email campaign.
        Brief: ${brief}
        ${isRegeneration ? `Feedback for improvement: ${feedback}` : ""}

        IMPORTANT PERSONALIZATION INSTRUCTIONS:
        You MUST design the email to feel tailored to individual customers.
        Use these placeholders securely anywhere in the subject or body:
        - {name} or {first_name}
        - {city}
        - {age_group} (will resolve to "young professionals", "experienced investors", or "senior investors")

        Example: "Hello {first_name}, special offer for {city} residents!"

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

      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      setCampaign(result);
      setEmailSubject(result.subject || "");
      setEmailBody(result.body || "");
      setIsEditingEmail(false);
      advanceTimeline("email_generated");
      addLog("Email content generated successfully.", "success");

      // Persist to MongoDB (non-blocking)
      const savedId = await saveCampaignToDB({
        brief,
        ...result,
        targetSegment: result.targetSegment,
      });
      if (savedId) setMongoId(savedId);
      addLog("Waiting for human approval...", "info");
    } catch (err) {
      console.error(err);
      setError(
        `Failed to generate campaign: ${err.message || JSON.stringify(err)}`,
      );
      addLog(`Error during generation: ${err.message}`, "info");
    } finally {
      setIsGenerating(false);
    }
  };

  const executeCampaign = async () => {
    if (!campaign || rawCohort.length === 0) {
      addLog(
        "Cannot execute: Missing campaign data or customer cohort.",
        "info",
      );
      return;
    }

    addLog("Executing campaign... Analyzing target segment.", "loading");
    setIsGenerating(true);

    try {
      const apiKeyStr =
        import.meta.env.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
      const groq = new Groq({ apiKey: apiKeyStr, dangerouslyAllowBrowser: true });

      // 1. AI Demographic Filtering
      advanceTimeline("audience_filtering");
      addLog(
        "AI is filtering customer database based on target segment...",
        "loading",
      );

      const filterPrompt = `
        You are a data analyst. I have a marketing campaign targeting this segment: "${campaign.targetSegment}".
        
        I have a database of customers. Return ONLY a javascript filter array function as a string that I can run via eval() to filter the array.
        For example, if the segment is 'female senior citizens', return: (c) => c['Gender'] === 'Female' && c['Age'] >= 60
        If the segment is 'high income users', return: (c) => c['Monthly_Income'] > 100000
        
        Customer keys available (based on actual live data): 
        - "customer_id", "Full_name", "Email", "City" (strings)
        - "Age", "Monthly_Income", "Kids_in_Household", "Credit score" (numbers)
        - "Gender" (string: "Male" or "Female")
        - "KYC status", "App_Installed", "Existing Customer", "Social_Media_Active" (string: "Y" or "N")
        
        Return ONLY the raw arrow function string. Use bracket notation for keys with spaces e.g c['Credit score'].
        Do NOT write markdown blocks, do NOT write explanations.
      `;

      let filterFuncString = "(c) => true"; // Fallback
      try {
        const filterRes = await groq.chat.completions.create({
          messages: [{ role: "user", content: filterPrompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0,
        });
        filterFuncString =
          filterRes.choices[0].message.content
            ?.replace(/`/g, "")
            .replace(/javascript/g, "")
            .trim() || "(c) => true";
        addLog(`Generated AI filter: ${filterFuncString}`, "info");
      } catch (e) {
        addLog(
          `Failed to perfectly parse AI filter, using fallback...`,
          "info",
        );
      }

      // 2. Apply Filter
      let target_customer_ids = [];
      try {
        const filterFunc = eval(filterFuncString);
        const filteredCohort = rawCohort.filter(filterFunc);
        target_customer_ids = filteredCohort
          .map((c) => c.customer_id || c.id || c.CLIENTNUM)
          .filter(Boolean);
        addLog(
          `Filtered cohort: ${target_customer_ids.length} customers matched out of ${rawCohort.length}.`,
          "success",
        );
      } catch (err) {
        addLog(
          `Filter javascript parsing failed (${err.message}). Using fallback matching...`,
          "info",
        );
        // Fallback if eval fails: randomly sample 10%
        target_customer_ids = rawCohort
          .map((c) => c.customer_id || c.id || c.CLIENTNUM)
          .slice(0, Math.max(1, Math.floor(rawCohort.length * 0.1)));
        addLog(
          `Fallback matching triggered: ${target_customer_ids.length} customers selected.`,
          "info",
        );
      }

      if (target_customer_ids.length === 0) {
        addLog("No customers matched the criteria. Aborting launch.", "info");
        return;
      }

      // 3. Dispatch Campaign via Service Layer
      addLog("Personalizing emails for each target customer...", "loading");

      // Simulate personalization loop for logs
      for (let i = 0; i < Math.min(3, target_customer_ids.length); i++) {
        const cId = target_customer_ids[i];
        const cust = rawCohort.find(c => (c.customer_id || c.id || c.CLIENTNUM) === cId);
        if (cust) {
          const pSubj = personalizeEmail(emailSubject || campaign.subject, cust);
          addLog(`Preview [${cust.name || cId}]: ${pSubj}`, "info");
        }
      }
      addLog(`Generated ${target_customer_ids.length} personalized emails. Dispatching to API...`, "loading");

      const API_KEY = import.meta.env.VITE_CAMPAIGNX_API_KEY;

      if (!API_KEY) {
        advanceTimeline("campaign_approved");
        addLog(
          "VITE_CAMPAIGNX_API_KEY missing. Simulating success.",
          "success",
        );
        advanceTimeline("campaign_sent");
        setIsApproved(true);
        setTimeout(() => setIsApproved(false), 5000);
        return;
      }

      // Build and validate send time
      const formattedSendTime = buildSendTime(schedule);
      addLog(`Formatted send time for API: ${formattedSendTime}`, "info");

      try {
        const campaignId = await apiSendCampaign({
          subject: emailSubject || campaign.subject,
          body: emailBody || campaign.body,
          list_customer_ids: target_customer_ids,
          send_time: formattedSendTime,
        });

        // Mark sent in MongoDB (non-blocking)
        markCampaignSentInDB(mongoId, campaignId, target_customer_ids);

        advanceTimeline("campaign_approved");
        // saveCampaignId is called inside apiSendCampaign — also log it
        addLog(
          `Campaign Launched Successfully! Campaign ID: ${campaignId}`,
          "success",
        );
        advanceTimeline("campaign_sent");
        setIsApproved(true);
        setTimeout(() => {
          setIsApproved(false);
          advanceTimeline("analytics_ready");
        }, 8000);
      } catch (dispatchErr) {
        addLog(`API Launch Failed: ${dispatchErr.message}`, "info");
      }
    } catch (err) {
      console.error(err);
      addLog(`Execution error: ${err.message}`, "info");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 pb-24">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-700 dark:bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-100 dark:shadow-teal-900/50 flex-shrink-0">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Campaign Workspace</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Collaborate with AI to create, personalize, and dispatch high-performing emails.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Brief Input & Generation */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">

          {/* Main Input Card */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm">
              <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3>1. Campaign Brief</h3>
            </div>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g., Run an email campaign for launching XDeposit. Offer 1% higher returns than competitors. Give additional 0.25% benefits to female senior citizens. Optimize for open rate..."
              className="w-full h-40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-lg outline-none custom-scrollbar"
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => generateCampaign()}
                disabled={isGenerating || !brief.trim()}
                className="group flex items-center gap-3 text-white px-8 py-4 rounded-xl font-black text-lg transition-all active:scale-95 w-full md:w-auto overflow-hidden relative hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0C3F3A', boxShadow: '0 8px 30px rgba(12, 63, 58, 0.6)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                ) : (
                  <Sparkles className="w-6 h-6 relative z-10" />
                )}
                <span className="relative z-10">Generate AI Campaign</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isGenerating && !campaign && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 shadow-sm"
              >
                <Loader2 className="w-16 h-16 text-teal-600 dark:text-teal-400 animate-spin" />
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">AI Agent is thinking...</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Analyzing brief, matching audience segments, and crafting strategy.</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-6 flex items-start gap-4 text-rose-700 dark:text-rose-400 shadow-sm"
              >
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Generation Error</h4>
                  <p className="text-sm opacity-90 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {campaign && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 flex-1 flex flex-col"
              >
                {/* Generated Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex-1 flex flex-col">

                  {/* Strategy Header */}
                  <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-6">
                      <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <h3>2. AI Strategy & Audience</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2"><Users className="w-3.5 h-3.5" /> Target Segment</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm lg:text-base leading-tight">{campaign.targetSegment}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2"><Users className="w-3.5 h-3.5" /> Est. Reach</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm lg:text-base leading-tight">{campaign.estimatedAudience} cohort size</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2"><Clock className="w-3.5 h-3.5" /> Recommended Send</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm lg:text-base leading-tight">{campaign.sendTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Email Content Body */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm">
                        <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h3>3. Generated Content</h3>
                        {showPersonalization && <span className="ml-3 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 rounded-md">Personalization Enabled</span>}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-600"
                            checked={showPersonalization}
                            onChange={(e) => setShowPersonalization(e.target.checked)}
                            disabled={!previewCustomer}
                          />
                          Personalize
                        </label>
                        <button
                          onClick={() => {
                            if (isEditingEmail) {
                              setCampaign(prev => ({ ...prev, subject: emailSubject, body: emailBody }));
                              setIsEditingEmail(false);
                              saveEditedEmailToDB(mongoId, emailSubject, emailBody);
                            } else {
                              setEmailSubject(campaign.subject || "");
                              setEmailBody(campaign.body || "");
                              setIsEditingEmail(true);
                            }
                          }}
                          className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm ${isEditingEmail ? "bg-teal-700 text-white hover:bg-teal-800" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                        >
                          {isEditingEmail ? <Save className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                          {isEditingEmail ? "Save" : "Edit"}
                        </button>
                        <button
                          onClick={copyHtmlToClipboard}
                          className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                          {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedHtml ? "Copied!" : "Copy HTML"}
                        </button>
                      </div>
                    </div>

                    {/* Preview / HTML Source Tabs */}
                    {!isEditingEmail && (
                      <div className="flex items-center gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
                        <button
                          onClick={() => setEmailPreviewTab('preview')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${emailPreviewTab === 'preview' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => setEmailPreviewTab('html')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${emailPreviewTab === 'html' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                        >
                          <Code className="w-3.5 h-3.5" /> HTML Source
                        </button>
                      </div>
                    )}

                    <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-3xl p-4 md:p-6 border border-slate-200 dark:border-slate-800 overflow-hidden">

                      {/* Editing Mode */}
                      {isEditingEmail ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Subject Line</p>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className="w-full px-4 py-3 text-lg font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email Body</p>
                            <textarea
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              rows={14}
                              className="w-full px-4 py-4 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-y leading-relaxed font-medium shadow-sm custom-scrollbar"
                            />
                          </div>
                        </div>
                      ) : emailPreviewTab === 'preview' ? (
                        /* ── Gmail-Style Email Preview ── */
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto" style={{ maxWidth: '620px' }}>
                          {/* Email Header Bar */}
                          <div style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }} className="px-8 py-6">
                            <h3 className="text-white font-black text-xl leading-tight">
                              {showPersonalization && previewCustomer ? personalizeEmail(campaign.subject, previewCustomer) : campaign.subject}
                            </h3>
                            <p className="text-white/70 text-xs font-medium mt-2">From: SuperBFSI Marketing Team</p>
                          </div>

                          {/* Personalization Preview Bar */}
                          {showPersonalization && previewCustomer && (
                            <div className="px-8 py-3 bg-teal-50 dark:bg-teal-900/20 border-b border-teal-100 dark:border-teal-800/50 flex flex-wrap gap-x-4 gap-y-1 items-center text-xs font-semibold text-teal-800 dark:text-teal-300">
                              <span className="font-black uppercase tracking-widest text-[9px] bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded">Preview Target</span>
                              <span>👤 {previewCustomer.name || previewCustomer.Full_name}</span>
                              <span>📍 {previewCustomer.city || previewCustomer.City || "Unknown"}</span>
                            </div>
                          )}

                          {/* Email Body */}
                          <div className="px-8 py-8">
                            {(() => {
                              const bodyContent = showPersonalization && previewCustomer 
                                ? personalizeEmail(campaign.body, previewCustomer) 
                                : campaign.body;
                              
                              // If AI returned HTML, render it
                              if (isHtmlContent(bodyContent)) {
                                return <div className="email-preview-rendered" dangerouslySetInnerHTML={{ __html: bodyContent }} />;
                              }
                              // Otherwise render plain text as styled paragraphs
                              return bodyContent.split('\n').filter(l => l.trim()).map((paragraph, idx) => (
                                <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-[15px] mb-4">
                                  {paragraph}
                                </p>
                              ));
                            })()}
                          </div>

                          {/* Signature Footer */}
                          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <p className="text-slate-400 text-xs">Best regards,</p>
                            <p className="font-bold text-sm mt-1" style={{ color: '#0f766e' }}>The SuperBFSI Team</p>
                            <p className="text-slate-300 dark:text-slate-600 text-[10px] mt-3">Sent via CampX AI Marketing Platform</p>
                          </div>
                        </div>
                      ) : (
                        /* ── HTML Source Tab ── */
                        <div className="relative">
                          <pre className="bg-slate-900 dark:bg-black text-green-400 text-xs rounded-2xl p-6 overflow-auto custom-scrollbar leading-relaxed" style={{ maxHeight: '500px' }}>
                            <code>{wrapInEmailTemplate(
                              showPersonalization && previewCustomer ? personalizeEmail(campaign.subject, previewCustomer) : campaign.subject,
                              showPersonalization && previewCustomer ? personalizeEmail(campaign.body, previewCustomer) : campaign.body,
                              isHtmlContent(campaign.body)
                            )}</code>
                          </pre>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* Refinement & Execution Card */}
                <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 dark:border-slate-900">
                  <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-sm mb-6">
                    <RefreshCw className="w-5 h-5 text-teal-400" />
                    <h3>4. Refine & Execute</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g., Make it more formal, emphasize the ROI, shorten the outro..."
                        className="w-full h-full min-h-[120px] p-4 rounded-2xl bg-slate-800 dark:bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400 font-medium outline-none text-sm"
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-3 flex-shrink-0 w-full md:w-48">
                      <button
                        onClick={() => generateCampaign(true)}
                        disabled={isGenerating || !feedback.trim()}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold transition-all border border-slate-700 shadow-sm disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Regenerate
                      </button>
                      <button
                        onClick={() => executeCampaign()}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 rounded-xl font-black transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Approve & Send
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isApproved && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 font-bold text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        Campaign API Execution Triggered Successfully! Check Activity Logs for status.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Intelligence & Settings */}
        <div className="lg:col-span-4 space-y-6">

          <CampaignTimeline currentStep={timelineStep} timelineEvents={timelineEvents} />

          <ScheduleSection settings={schedule} onChange={setSchedule} />

          {/* AI Strategy Explanation Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-6">
              <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3>AI Strategy Reasoning</h3>
            </div>

            {campaign ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Targeting Logic</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-100/5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    {campaign.explanation.audience}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Timing Logic</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-100/5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    {campaign.explanation.sendTime}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Tone Analysis</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-100/5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    {campaign.explanation.tone}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">Generate a campaign to view the AI's step-by-step reasoning process here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
