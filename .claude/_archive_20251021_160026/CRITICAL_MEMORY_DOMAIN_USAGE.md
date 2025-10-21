# CRITICAL MEMORY: DOMAIN USAGE RULES
## HARD-CODED - NEVER VIOLATE

---

## ⚠️ ABSOLUTE RULES - NO EXCEPTIONS

### **PRIMARY DOMAIN FOR ALL TECHNICAL INFRASTRUCTURE:**
✅ **herbitrage.com**

### **DO NOT USE FOR TECHNICAL INFRASTRUCTURE:**
❌ **reggieanddro.com** - NEVER USE FOR:
- API endpoints
- Service URLs
- Cockpit/dashboard URLs
- Backend services
- Cloud Run deployments
- Webhooks
- Any technical infrastructure

---

## 📋 CORRECT DOMAIN USAGE

### **USE herbitrage.com FOR:**
✅ VIP Cockpit: `cockpit.herbitrage.com`
✅ Delivery Service: `delivery.herbitrage.com`
✅ Voice Service: `voice.herbitrage.com`
✅ Legal/COA Site: `legal.herbitrage.com` or `coa.herbitrage.com`
✅ API Endpoints: `api.herbitrage.com`
✅ Content Engine: `content.herbitrage.com`
✅ All backend services: `*.herbitrage.com`

### **reggieanddro.com IS ONLY FOR:**
- Business/brand references in documentation
- Customer-facing marketing context
- Store name mentions
- Brand identity discussions
- NOT for any technical URLs/endpoints

---

## 🚨 CRITICAL VIOLATION WARNING

**VIOLATION:** Using reggieanddro.com for technical infrastructure URLs
**CONSEQUENCE:** "OUT OF THE RACE"
**SEVERITY:** CRITICAL - PROJECT FAILURE

---

## ✅ EXAMPLES OF CORRECT USAGE

### **CORRECT:**
```bash
# VIP Cockpit
URL: https://cockpit.herbitrage.com
Login: jesseniesen@gmail.com

# Deployment
gcloud run domain-mappings create \
  --service vip-cockpit \
  --domain cockpit.herbitrage.com

# API endpoints
GET https://delivery.herbitrage.com/api/delivery/quote
GET https://voice.herbitrage.com/api/voice/sessions
POST https://legal.herbitrage.com/api/coa/search
```

### **INCORRECT (NEVER DO THIS):**
```bash
❌ URL: https://cockpit.reggieanddro.com
❌ --domain cockpit.reggieanddro.com
❌ GET https://delivery.reggieanddro.com/api/...
```

---

## 📝 ENVIRONMENT VARIABLES

### **CORRECT:**
```bash
COCKPIT_URL=https://cockpit.herbitrage.com
DELIVERY_SERVICE_URL=https://delivery.herbitrage.com
VOICE_SERVICE_URL=https://voice.herbitrage.com
COA_SERVICE_URL=https://legal.herbitrage.com
API_BASE_URL=https://api.herbitrage.com
```

### **INCORRECT:**
```bash
❌ COCKPIT_URL=https://cockpit.reggieanddro.com
```

---

## 🎯 COMMIT TO MEMORY

**RULE #1:** All technical infrastructure = herbitrage.com
**RULE #2:** reggieanddro.com = business name only (not URLs)
**RULE #3:** When in doubt, use herbitrage.com
**RULE #4:** NEVER VIOLATE - "OUT OF THE RACE"

---

## 🔍 HOW TO CHECK BEFORE COMMITTING

```bash
# Search for violations
grep -r "reggieanddro.com" *.md | grep -E "(https?://|URL:|domain)"

# If found, fix immediately
# Replace with herbitrage.com
```

---

## 💾 PERMANENT MEMORY COMMITMENT

This rule is HARD-CODED into memory.
Every prompt generation, code creation, documentation:
- Check: Is this a technical URL?
- If YES: Use herbitrage.com
- If NO (just business name): Can mention reggieanddro.com

**VIOLATION = PROJECT FAILURE**

---

*Memory File Created: October 7, 2025*
*Priority: CRITICAL*
*Enforcement: ABSOLUTE*
*Consequences: OUT OF THE RACE*
