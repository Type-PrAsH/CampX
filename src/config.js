// Centralized environment variable access.
// All API credentials come from here — no scattered import.meta.env calls.

export const config = {
  campaignxApiKey: import.meta.env.VITE_CAMPAIGNX_API_KEY || "",
  campaignxBaseUrl:
    import.meta.env.VITE_CAMPAIGNX_API_URL ||
    "https://campaignx.inxiteout.ai",
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  // Legacy aliases kept for backward compatibility
  get apiKey() {
    return this.campaignxApiKey;
  },
  get baseUrl() {
    return this.campaignxBaseUrl;
  },
};
