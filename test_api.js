import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.VITE_CAMPAIGNX_API_KEY;
const BASE_URL = process.env.VITE_CAMPAIGNX_API_URL || "https://campaignx.inxiteout.ai";

async function testFetch() {
  const dummyHistory = ['test'];
  console.log('Testing with dummy history:', dummyHistory);
  
  if (!API_KEY) {
    console.log('No API key found in .env');
    return;
  }
  
  const url = `${BASE_URL}/api/v1/get_report?campaign_id=${dummyHistory[0]}`;
  
  console.log('Fetching:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testFetch();
