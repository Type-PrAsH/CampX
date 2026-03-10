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
} from "lucide-react";
import Groq from "groq-sdk";
import {
  sendCampaign as apiSendCampaign,
  buildSendTime,
  saveCampaignId,
  getCustomerCohort as apiGetCustomerCohort,
} from "../services/campaignx";

import ScheduleSection from "./ScheduleSection";

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
    if (!isRegeneration) setCampaign(null);

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
          const cohortRes = await fetch(
            `${API_URL}/api/v1/get_customer_cohort`,
            {
              method: "GET",
              headers: {
                "X-API-Key": API_KEY,
              },
            },
          );

          if (cohortRes.ok) {
            const cohortDataResp = await cohortRes.json();
            fetchedCohortData = cohortDataResp.data || cohortDataResp || [];
            if (
              !Array.isArray(fetchedCohortData) &&
              typeof fetchedCohortData === "object"
            ) {
              fetchedCohortData = Object.values(fetchedCohortData);
            }
            setRawCohort(fetchedCohortData);
            totalCustomers =
              cohortDataResp.total_count || fetchedCohortData.length || 0;
            addLog(
              `Successfully retrieved cohort: ${totalCustomers} customers available.`,
              "success",
            );
          } else {
            addLog(
              `Failed to fetch cohort data: ${cohortRes.statusText}`,
              "info",
            );
          }
        } catch (e) {
          addLog("Network error while fetching cohort data.", "info");
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
      addLog("Email content generated successfully.", "success");
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
      addLog("Dispatching campaign to CampaignX API...", "loading");
      const API_KEY = import.meta.env.VITE_CAMPAIGNX_API_KEY;

      if (!API_KEY) {
        addLog(
          "VITE_CAMPAIGNX_API_KEY missing. Simulating success.",
          "success",
        );
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

        // saveCampaignId is called inside apiSendCampaign — also log it
        addLog(
          `Campaign Launched Successfully! Campaign ID: ${campaignId}`,
          "success",
        );
        setIsApproved(true);
        setTimeout(() => setIsApproved(false), 8000);
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
    /*#__PURE__*/
    React.createElement(
      "div",
      { className: "p-8 max-w-6xl mx-auto space-y-8 pb-20" } /*#__PURE__*/,
      React.createElement(
        "div",
        { className: "flex items-center gap-3" } /*#__PURE__*/,
        React.createElement(
          "div",
          {
            className:
              "w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100",
          } /*#__PURE__*/,
          React.createElement(Sparkles, { className: "text-white w-6 h-6" }),
        ) /*#__PURE__*/,
        React.createElement(
          "div",
          null /*#__PURE__*/,
          React.createElement(
            "h2",
            { className: "text-3xl font-bold text-slate-900 tracking-tight" },
            "Campaign Workspace",
          ) /*#__PURE__*/,
          React.createElement(
            "p",
            { className: "text-slate-500 font-medium" },
            "Collaborate with AI to create high-performing email campaigns.",
          ),
        ),
      ) /*#__PURE__*/,

      React.createElement(
        "div",
        {
          className:
            "bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-4",
        } /*#__PURE__*/,
        React.createElement(
          "div",
          {
            className:
              "flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-sm",
          } /*#__PURE__*/,
          React.createElement(MessageSquare, {
            className: "w-5 h-5 text-[#6366F1]",
          }) /*#__PURE__*/,
          React.createElement("h3", null, "Campaign Brief"),
        ) /*#__PURE__*/,
        React.createElement("textarea", {
          value: brief,
          onChange: (e) => setBrief(e.target.value),
          placeholder:
            "e.g., Run email campaign for launching XDeposit. Offer 1% higher returns than competitors. Give additional 0.25% benefits to female senior citizens. Optimize for open rate and click rate. Include this link: https://superbfsi.com/xdeposit/explore/",
          className:
            "w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all resize-none text-slate-700 placeholder:text-slate-400 font-medium outline-none",
        }) /*#__PURE__*/,
        React.createElement(
          "div",
          { className: "flex justify-end" } /*#__PURE__*/,
          React.createElement(
            "button",
            {
              onClick: () => generateCampaign(),
              disabled: isGenerating || !brief.trim(),
              className:
                "flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-200 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95",
            },

            isGenerating
              ? /*#__PURE__*/ React.createElement(Loader2, {
                  className: "w-5 h-5 animate-spin",
                })
              : /*#__PURE__*/ React.createElement(Sparkles, {
                  className: "w-5 h-5",
                }),
            "Generate Campaign",
          ),
        ),
      ) /*#__PURE__*/,

      React.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" } /*#__PURE__*/,

        React.createElement(
          "div",
          { className: "lg:col-span-2 space-y-8" } /*#__PURE__*/,
          React.createElement(
            AnimatePresence,
            { mode: "wait" },
            isGenerating &&
              !campaign /*#__PURE__*/ &&
              React.createElement(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  className:
                    "bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm",
                } /*#__PURE__*/,

                React.createElement(Loader2, {
                  className: "w-12 h-12 text-[#6366F1] animate-spin",
                }) /*#__PURE__*/,
                React.createElement(
                  "div",
                  null /*#__PURE__*/,
                  React.createElement(
                    "h4",
                    { className: "text-xl font-bold text-slate-900" },
                    "AI is crafting your campaign...",
                  ) /*#__PURE__*/,
                  React.createElement(
                    "p",
                    { className: "text-slate-500 font-medium" },
                    "Analyzing brief, segments, and historical data.",
                  ),
                ),
              ),

            error /*#__PURE__*/ &&
              React.createElement(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.95 },
                  animate: { opacity: 1, scale: 1 },
                  className:
                    "bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 text-red-700 shadow-sm",
                } /*#__PURE__*/,

                React.createElement(AlertCircle, {
                  className: "w-6 h-6 shrink-0",
                }) /*#__PURE__*/,
                React.createElement(
                  "div",
                  null /*#__PURE__*/,
                  React.createElement(
                    "h4",
                    { className: "font-bold" },
                    "Generation Error",
                  ) /*#__PURE__*/,
                  React.createElement(
                    "p",
                    { className: "text-sm opacity-90" },
                    error,
                  ),
                ),
              ),

            campaign /*#__PURE__*/ &&
              React.createElement(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  className: "space-y-8",
                } /*#__PURE__*/,

                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-6",
                  } /*#__PURE__*/,
                  React.createElement(
                    "div",
                    {
                      className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                    } /*#__PURE__*/,
                    React.createElement(
                      "div",
                      { className: "space-y-1" } /*#__PURE__*/,
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                        },
                        "Target Segment",
                      ) /*#__PURE__*/,
                      React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center gap-2 text-slate-900 font-bold text-sm",
                        } /*#__PURE__*/,
                        React.createElement(Users, {
                          className: "w-4 h-4 text-[#6366F1]",
                        }),
                        campaign.targetSegment,
                      ),
                    ) /*#__PURE__*/,
                    React.createElement(
                      "div",
                      { className: "space-y-1" } /*#__PURE__*/,
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                        },
                        "Send Time",
                      ) /*#__PURE__*/,
                      React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center gap-2 text-slate-900 font-bold text-sm",
                        } /*#__PURE__*/,
                        React.createElement(Clock, {
                          className: "w-4 h-4 text-[#6366F1]",
                        }),
                        campaign.sendTime,
                      ),
                    ) /*#__PURE__*/,
                    React.createElement(
                      "div",
                      { className: "space-y-1" } /*#__PURE__*/,
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                        },
                        "Estimated Audience",
                      ) /*#__PURE__*/,
                      React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center gap-2 text-slate-900 font-bold text-sm",
                        } /*#__PURE__*/,
                        React.createElement(Target, {
                          className: "w-4 h-4 text-[#6366F1]",
                        }),
                        campaign.estimatedAudience,
                      ),
                    ) /*#__PURE__*/,
                    React.createElement(
                      "div",
                      { className: "space-y-1" } /*#__PURE__*/,
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                        },
                        "Strategy",
                      ) /*#__PURE__*/,
                      React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center gap-2 text-slate-900 font-bold text-sm truncate",
                        } /*#__PURE__*/,
                        React.createElement(Sparkles, {
                          className: "w-4 h-4 text-[#6366F1]",
                        }),
                        campaign.strategy,
                      ),
                    ),
                  ) /*#__PURE__*/,

                  React.createElement(
                    "div",
                    {
                      className: "border-t border-slate-100 pt-6 space-y-4",
                    } /*#__PURE__*/,
                    React.createElement(
                      "div",
                      {
                        className: "flex items-center justify-between",
                      } /*#__PURE__*/,
                      React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-sm",
                        } /*#__PURE__*/,
                        React.createElement(Mail, {
                          className: "w-5 h-5 text-[#6366F1]",
                        }) /*#__PURE__*/,
                        React.createElement("h3", null, "Email Preview"),
                      ) /*#__PURE__*/,
                      React.createElement(
                        "button",
                        {
                          onClick: () => {
                            if (isEditingEmail) {
                              setCampaign((prev) => ({ ...prev, subject: emailSubject, body: emailBody }));
                              setIsEditingEmail(false);
                            } else {
                              setEmailSubject(campaign.subject || "");
                              setEmailBody(campaign.body || "");
                              setIsEditingEmail(true);
                            }
                          },
                          className:
                            "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all " +
                            (isEditingEmail
                              ? "bg-[#6366F1] text-white shadow-md hover:bg-[#4F46E5]"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"),
                        },
                        React.createElement(isEditingEmail ? Save : Pencil, { className: "w-3.5 h-3.5" }),
                        isEditingEmail ? "Save Changes" : "Edit Email",
                      ),
                    ) /*#__PURE__*/,
                    React.createElement(
                      "div",
                      {
                        className:
                          "bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4",
                      } /*#__PURE__*/,
                      React.createElement(
                        "div",
                        null /*#__PURE__*/,
                        React.createElement(
                          "p",
                          {
                            className:
                              "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1",
                          },
                          "Subject",
                        ) /*#__PURE__*/,
                        isEditingEmail
                          ? React.createElement("input", {
                              type: "text",
                              value: emailSubject,
                              onChange: (e) => setEmailSubject(e.target.value),
                              className:
                                "w-full px-3 py-2 text-lg font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all bg-white",
                            })
                          : React.createElement(
                              "p",
                              { className: "text-lg font-bold text-slate-900" },
                              campaign.subject,
                            ),
                      ) /*#__PURE__*/,
                      React.createElement("div", {
                        className: "h-px bg-slate-200 w-full",
                      }) /*#__PURE__*/,
                      React.createElement(
                        "div",
                        null /*#__PURE__*/,
                        React.createElement(
                          "p",
                          {
                            className:
                              "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1",
                          },
                          "Body",
                        ) /*#__PURE__*/,
                        isEditingEmail
                          ? React.createElement("textarea", {
                              value: emailBody,
                              onChange: (e) => setEmailBody(e.target.value),
                              rows: 10,
                              className:
                                "w-full px-3 py-2 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all resize-none leading-relaxed font-medium bg-white",
                            })
                          : React.createElement(
                              "div",
                              {
                                className:
                                  "text-slate-700 whitespace-pre-wrap leading-relaxed font-medium",
                              },
                              campaign.body,
                            ),
                      ),
                    ),
                  ),
                ) /*#__PURE__*/,

                React.createElement(
                  "div",
                  {
                    className:
                      "bg-slate-900 p-6 rounded-3xl shadow-xl space-y-4",
                  } /*#__PURE__*/,
                  React.createElement(
                    "div",
                    {
                      className:
                        "flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm",
                    } /*#__PURE__*/,
                    React.createElement(RefreshCw, {
                      className: "w-5 h-5 text-indigo-400",
                    }) /*#__PURE__*/,
                    React.createElement(
                      "h3",
                      null,
                      "Manual Feedback & Regeneration",
                    ),
                  ) /*#__PURE__*/,
                  React.createElement("textarea", {
                    value: feedback,
                    onChange: (e) => setFeedback(e.target.value),
                    placeholder:
                      "e.g., Keep tone formal, shorten the email, add urgency, remove emojis...",
                    className:
                      "w-full h-24 p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all resize-none placeholder:text-slate-500 font-medium outline-none",
                  }) /*#__PURE__*/,
                  React.createElement(
                    "div",
                    { className: "flex gap-3 justify-end" } /*#__PURE__*/,
                    React.createElement(
                      "button",
                      {
                        onClick: () => generateCampaign(true),
                        disabled: isGenerating || !feedback.trim(),
                        className:
                          "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-slate-700",
                      },

                      isGenerating
                        ? /*#__PURE__*/ React.createElement(Loader2, {
                            className: "w-5 h-5 animate-spin",
                          })
                        : /*#__PURE__*/ React.createElement(RefreshCw, {
                            className: "w-5 h-5",
                          }),
                      "Regenerate",
                    ) /*#__PURE__*/,
                    React.createElement(
                      "button",
                      {
                        onClick: () => executeCampaign(),
                        disabled: isGenerating,
                        className:
                          "flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg",
                      },

                      isGenerating
                        ? /*#__PURE__*/ React.createElement(Loader2, {
                            className: "w-5 h-5 animate-spin",
                          })
                        : /*#__PURE__*/ React.createElement(CheckCircle2, {
                            className: "w-5 h-5",
                          }),
                      "Confirm & Approve",
                    ),
                  ) /*#__PURE__*/,
                  React.createElement(
                    AnimatePresence,
                    null,
                    isApproved /*#__PURE__*/ &&
                      React.createElement(
                        motion.div,
                        {
                          initial: { opacity: 0, y: 10 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: 10 },
                          className:
                            "p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm",
                        } /*#__PURE__*/,

                        React.createElement(CheckCircle2, {
                          className: "w-5 h-5",
                        }),
                        "Campaign API Execution Complete! Check Activity logs below.",
                      ),
                  ),
                ),
              ),
          ),
        ) /*#__PURE__*/,

        React.createElement(
          "div",
          { className: "space-y-8" } /*#__PURE__*/,

          React.createElement(ScheduleSection, {
            settings: schedule,
            onChange: setSchedule,
          }) /*#__PURE__*/,

          React.createElement(
            "div",
            {
              className:
                "bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-6",
            } /*#__PURE__*/,
            React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-sm",
              } /*#__PURE__*/,
              React.createElement(Info, {
                className: "w-5 h-5 text-[#6366F1]",
              }) /*#__PURE__*/,
              React.createElement("h3", null, "AI Strategy Explanation"),
            ),

            campaign /*#__PURE__*/
              ? React.createElement(
                  "div",
                  { className: "space-y-4" } /*#__PURE__*/,
                  React.createElement(
                    "div",
                    { className: "space-y-1" } /*#__PURE__*/,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                      },
                      "Target Audience",
                    ) /*#__PURE__*/,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-xs text-slate-700 leading-relaxed font-medium",
                      },
                      campaign.explanation.audience,
                    ),
                  ) /*#__PURE__*/,
                  React.createElement(
                    "div",
                    { className: "space-y-1" } /*#__PURE__*/,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                      },
                      "Send Time",
                    ) /*#__PURE__*/,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-xs text-slate-700 leading-relaxed font-medium",
                      },
                      campaign.explanation.sendTime,
                    ),
                  ) /*#__PURE__*/,
                  React.createElement(
                    "div",
                    { className: "space-y-1" } /*#__PURE__*/,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                      },
                      "Email Tone",
                    ) /*#__PURE__*/,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-xs text-slate-700 leading-relaxed font-medium",
                      },
                      campaign.explanation.tone,
                    ),
                  ),
                ) /*#__PURE__*/
              : React.createElement(
                  "p",
                  { className: "text-xs text-slate-400 italic font-medium" },
                  "Generate a campaign to see AI reasoning.",
                ),
          ) /*#__PURE__*/,

          React.createElement(
            "div",
            {
              className:
                "bg-slate-900 p-6 rounded-3xl shadow-xl space-y-4 h-[400px] flex flex-col",
            } /*#__PURE__*/,
            React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm",
              } /*#__PURE__*/,
              React.createElement(Terminal, {
                className: "w-5 h-5 text-emerald-400",
              }) /*#__PURE__*/,
              React.createElement("h3", null, "Agent Activity Logs"),
            ) /*#__PURE__*/,
            React.createElement(
              "div",
              {
                className:
                  "flex-1 overflow-y-auto space-y-3 font-mono text-[10px] custom-scrollbar pr-2",
              },
              logs.map((log /*#__PURE__*/) =>
                React.createElement(
                  "div",
                  { key: log.id, className: "flex gap-3" } /*#__PURE__*/,
                  React.createElement(
                    "span",
                    { className: "text-slate-600 shrink-0" },
                    "[",
                    log.timestamp,
                    "]",
                  ) /*#__PURE__*/,
                  React.createElement(
                    "span",
                    {
                      className: cn(
                        "flex items-center gap-2",
                        log.status === "success"
                          ? "text-emerald-400"
                          : log.status === "loading"
                            ? "text-indigo-400"
                            : "text-slate-300",
                      ),
                    },
                    log.status === "loading" &&
                      /*#__PURE__*/ React.createElement(Loader2, {
                        className: "w-3 h-3 animate-spin",
                      }),
                    log.status === "success" &&
                      /*#__PURE__*/ React.createElement(CheckCircle2, {
                        className: "w-3 h-3",
                      }),
                    log.message,
                  ),
                ),
              ) /*#__PURE__*/,
              React.createElement("div", { ref: logEndRef }),
            ),
          ),
        ),
      ),
    )
  );
}

function Mail(props) {
  return (
    /*#__PURE__*/
    React.createElement(
      "svg",
      _extends({}, props, {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }) /*#__PURE__*/,

      React.createElement("rect", {
        width: "20",
        height: "16",
        x: "2",
        y: "4",
        rx: "2",
      }) /*#__PURE__*/,
      React.createElement("path", {
        d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
      }),
    )
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
