import fs from 'fs';

async function run() {
  const API_URL = "https://campaignx.inxiteout.ai";
  const API_KEY = "e2TIIHcZCQIKG5JgJ2aW5fJLs3mfzV3smhEgBxoLn64";
  
  // Create a minimal campaign to get a valid ID
  const sendRes = await fetch(`${API_URL}/api/v1/send_campaign`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: "Test Subject",
      body: "Test Body",
      list_customer_ids: ["CUST0001"],
      send_time: "10:03:26 13:42:11" 
    })
  });
  
  if (!sendRes.ok) {
    console.log("Send failed", await sendRes.text());
    return;
  }
  const result = await sendRes.json();
  const cid = result.campaign_id;
  console.log("Got Campaign ID:", cid);
  
  // Now fetch report for this ID
  const reportRes = await fetch(`${API_URL}/api/v1/get_report?campaign_id=${cid}`, {
    headers: { "X-API-Key": API_KEY }
  });
  
  if (!reportRes.ok) {
    console.log("Report fetch failed", await reportRes.text());
    return;
  }
  
  const reportData = await reportRes.json();
  console.log(JSON.stringify(reportData, null, 2));
}

run().catch(console.error);
