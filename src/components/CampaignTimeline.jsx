import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, Circle, Zap } from "lucide-react";

// ─── Step Definitions ────────────────────────────────────────────────────────

const STEPS = [
    {
        id: "brief_submitted",
        label: "Campaign Brief Submitted",
        desc: "User defines marketing goal",
    },
    {
        id: "ai_generation",
        label: "AI Strategy Generated",
        desc: "Groq LLM crafts campaign strategy",
    },
    {
        id: "cohort_fetch",
        label: "Customer Cohort Retrieved",
        desc: "CampaignX API returns audience",
    },
    {
        id: "audience_filtering",
        label: "Audience Segment Selected",
        desc: "AI filters target customers",
    },
    {
        id: "email_generated",
        label: "Email Content Generated",
        desc: "Subject & body ready for review",
    },
    {
        id: "campaign_approved",
        label: "Campaign Approved",
        desc: "User confirms execution",
    },
    {
        id: "campaign_sent",
        label: "Campaign Sent",
        desc: "Emails dispatched via CampaignX API",
    },
    {
        id: "analytics_ready",
        label: "Analytics Ready",
        desc: "Performance data collected",
    },
];

const STEP_IDS = STEPS.map((s) => s.id);

function getStepStatus(stepId, activeStepId) {
    const activeIdx = STEP_IDS.indexOf(activeStepId);
    const stepIdx = STEP_IDS.indexOf(stepId);
    if (stepIdx < activeIdx) return "done";
    if (stepIdx === activeIdx) return "active";
    return "pending";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CampaignTimeline({ currentStep, timelineEvents = [] }) {
    // Find timestamp for a step
    const getTimestamp = (stepId) => {
        const event = timelineEvents.find((e) => e.step === stepId);
        return event ? new Date(event.time).toLocaleTimeString() : null;
    };

    const hasStarted = currentStep && currentStep !== "idle";

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center shadow-md shadow-teal-200">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Campaign Timeline
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                        {hasStarted ? "Live pipeline progress" : "Waiting for campaign..."}
                    </p>
                </div>
            </div>

            {/* Steps */}
            <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[18px] top-4 bottom-4 w-px bg-slate-100" />

                <div className="space-y-1">
                    {STEPS.map((step, idx) => {
                        const status = hasStarted
                            ? getStepStatus(step.id, currentStep)
                            : "pending";
                        const timestamp = getTimestamp(step.id);
                        const isLast = idx === STEPS.length - 1;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.25 }}
                                className={`relative flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 ${status === "active"
                                        ? "bg-teal-50 border border-teal-100"
                                        : status === "done"
                                            ? "bg-emerald-50/40"
                                            : ""
                                    }`}
                            >
                                {/* Icon */}
                                <div className="relative z-10 flex-shrink-0 mt-0.5">
                                    {status === "done" && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </motion.div>
                                    )}
                                    {status === "active" && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        >
                                            <Loader2 className="w-5 h-5 text-teal-700" />
                                        </motion.div>
                                    )}
                                    {status === "pending" && (
                                        <Circle className="w-5 h-5 text-slate-200" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-[13px] font-bold leading-tight ${status === "done"
                                                ? "text-emerald-700"
                                                : status === "active"
                                                    ? "text-teal-800"
                                                    : "text-slate-300"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    {(status === "done" || status === "active") && (
                                        <p
                                            className={`text-[11px] font-medium mt-0.5 ${status === "done" ? "text-slate-400" : "text-teal-600"
                                                }`}
                                        >
                                            {step.desc}
                                        </p>
                                    )}
                                </div>

                                {/* Timestamp */}
                                {timestamp && status === "done" && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] text-slate-300 font-mono flex-shrink-0 mt-1"
                                    >
                                        {timestamp}
                                    </motion.span>
                                )}

                                {status === "active" && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-1.5"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Footer status */}
            <AnimatePresence>
                {currentStep === "analytics_ready" && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">
                            Campaign lifecycle complete!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
