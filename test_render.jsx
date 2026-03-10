import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CampaignWorkspace from './src/components/CampaignWorkspace.jsx';

try {
  renderToStaticMarkup(React.createElement(CampaignWorkspace));
  console.log("Render successful");
} catch(e) {
  console.error("RENDER ERROR:", e);
}
