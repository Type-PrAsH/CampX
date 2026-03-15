// Centralized environment variable access.
// API credentials now read dynamically from localStorage to allow hot-swapping in Settings.

export const config = {
  get campaignxApiKey() {
    return localStorage.getItem("campaignx_api_key") || import.meta.env.VITE_CAMPAIGNX_API_KEY || "";
  },
  get campaignxBaseUrl() {
    return localStorage.getItem("campaignx_api_url") || import.meta.env.VITE_CAMPAIGNX_API_URL || "https://campaignx.inxiteout.ai";
  },
  get openaiApiKey() {
    return localStorage.getItem("openai_api_key") || import.meta.env.VITE_OPENAI_API_KEY || "";
  },
  // Legacy aliases kept for backward compatibility
  get apiKey() {
    return this.campaignxApiKey;
  },
  get baseUrl() {
    return this.campaignxBaseUrl;
  },
};
