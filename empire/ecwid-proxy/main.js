#!/usr/bin/env node

/**
 * ECWID MIDDLEWARE PROXY - TIER 1 SOLUTION
 * 
 * No credentials needed - intercepts and injects CSS fix
 * Sits between users and reggieanddro.com
 * 
 * USAGE:
 * 1. Deploy to Cloud Run: gcloud run deploy ecwid-proxy --source .
 * 2. Update DNS: Point reggieanddro.com to proxy
 * 3. Done - CSS fix applied automatically
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 8080;

// CSS fix to inject
const CSS_FIX = `
<style>
/* ECWID CATEGORY BOX FIX - Injected by proxy */
.ec-store .grid-category__title,
.ec-store .grid-category__name,
.ec-store .category-card__title,
.ec-store .category-card__name,
.ec-category__title,
.category-box-text,
[class*="category"] [class*="title"],
[class*="category"] [class*="name"] {
  color: #000000 !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* Texas Takeover branding */
.ec-store .ec-header,
.ec-store .ec-header__logo {
  background: linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #16A34A 100%) !important;
}

.ec-store .ec-header__logo::after {
  content: "🤠 Texas Takeover" !important;
  color: white !important;
  font-weight: bold !important;
}
</style>
`;

// Proxy middleware to intercept HTML responses
app.use('/', async (req, res, next) => {
  try {
    // Forward request to original site
    const response = await fetch(`https://reggieanddro.company.site${req.url}`, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'ECWID-Proxy/1.0',
        'Accept': req.headers.accept || '*/*',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
      }
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('text/html')) {
      // Inject CSS fix into HTML
      let html = await response.text();
      
      // Inject CSS before closing </head> tag
      html = html.replace('</head>', `${CSS_FIX}</head>`);
      
      // Add Texas Takeover branding
      html = html.replace('<title>', '<title>🤠 Texas Takeover - ');
      
      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Proxy': 'ECWID-Fix-Proxy/1.0',
        'X-Texas-Takeover': 'true'
      });
      
      res.send(html);
    } else {
      // Pass through non-HTML content
      response.headers.forEach((value, key) => {
        res.set(key, value);
      });
      response.body.pipe(res);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error: ' + error.message);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ecwid-proxy',
    timestamp: new Date().toISOString(),
    texas_takeover: true,
    css_fix_applied: true
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ECWID Proxy running on port ${PORT}`);
  console.log(`🤠 Texas Takeover CSS fix active`);
  console.log(`📡 Proxying requests to reggieanddro.company.site`);
});
