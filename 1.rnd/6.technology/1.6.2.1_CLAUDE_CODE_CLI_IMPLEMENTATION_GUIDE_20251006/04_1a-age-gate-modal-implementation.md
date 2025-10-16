### 1A: Age-Gate Modal Implementation

**Claude Code Prompt:**

```
You are implementing an age verification modal for a Texas hemp e-commerce site (reggieanddro.company.site) built on LightSpeed.

REQUIREMENTS:
- Modal appears once per browser session (sessionStorage, not cookies)
- Checkbox + button pattern for age confirmation (21+)
- Terms of service agreement bundled
- Exit button redirects to SAMHSA helpline
- Mobile-responsive, accessible (WCAG 2.1 AA)
- No PII collected at this stage

LEGAL CONTEXT:
- Texas hemp law requires 21+ age verification
- Banking compliance requirement
- CAN-SPAM opt-in will be collected separately at checkout

TECHNICAL SPECS:
- Pure JavaScript (no jQuery dependencies)
- Inline CSS (no external stylesheets for critical path)
- Load time impact: <0.1 seconds
- Z-index: 9999 (must be above all other elements)
- Background: rgba(0,0,0,0.95) for accessibility contrast

ACCESS:
- LightSpeed FTP credentials: [provide]
- Theme directory: /themes/custom-theme/
- Insert location: Before closing </body> tag in layout.liquid

DELIVERABLES:
1. age-gate-modal.js (standalone file)
2. Integration instructions for LightSpeed theme
3. Test checklist (browser compatibility, mobile, accessibility)

Create the complete implementation with detailed comments explaining each section. Follow web accessibility best practices and ensure GDPR/CCPA compliance (no tracking before consent).
```

**Expected Output:** Complete JavaScript file + integration guide

---
