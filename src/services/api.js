import { config } from "../config";

const CACHE_KEY_COHORT = "campaignx_customer_cohort_v2";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-API-Key": config.apiKey,
});

/**
 * Fetch customer cohort. Caches to localStorage to avoid rate limit.
 */
export const getCustomerCohort = async () => {
  const cached = localStorage.getItem(CACHE_KEY_COHORT);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error("Failed to parse cached cohort:", e);
    }
  }

  const response = await fetch(`${config.baseUrl}/api/v1/get_customer_cohort`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cohort: ${response.statusText}`);
  }

  const payload = await response.json();
  const rawData = payload.data || [];

  // Map to expected Customer interface
  const customers = rawData.map((item) => ({
    ...item,
    name: item.Full_name || item.name,
    email: item.email || item.Email || "",
  }));

  localStorage.setItem(CACHE_KEY_COHORT, JSON.stringify(customers));
  return customers;
};

export const sendCampaign = async (payload) => {
  const response = await fetch(`${config.baseUrl}/api/v1/send_campaign`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to send campaign: ${errText}`);
  }

  const data = await response.json();
  return data.campaign_id;
};

export const getReport = async (campaignId) => {
  const response = await fetch(
    `${config.baseUrl}/api/v1/get_report?campaign_id=${campaignId}`,
    {
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch report: ${errText}`);
  }

  const data = await response.json();
  return data;
};
