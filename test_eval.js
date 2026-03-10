import fs from 'fs';
const code = fs.readFileSync('src/components/CampaignWorkspace.jsx', 'utf-8');
// Simple heuristic to check for undefined React components
const matches = code.match(/React\.createElement\(([A-Z][a-zA-Z0-9]*)/g);
if (matches) {
  const components = [...new Set(matches.map(m => m.replace('React.createElement(', '')))];
  console.log("Components used:", components);
}
