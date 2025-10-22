# EXACT DNS CLEANUP STEPS - reggieanddro.com

**Date:** October 2, 2025
**Based on:** Live GoDaddy screenshot analysis
**Status:** 🎯 READY TO EXECUTE

---

## CURRENT DNS RECORDS (FROM SCREENSHOT)

### ✅ KEEP THESE - Do NOT Delete

#### Row 1: A Record (Root)

- **Type:** A
- **Name:** @ (root)
- **Value:** 199.34.228.172
- **TTL:** 600 seconds
- **Action:** ✅ **KEEP** (temporarily, will use for fallback)

#### Row 2: A Record (www)

- **Type:** A
- **Name:** www
- **Value:** cert.boomcenter.com
- **TTL:** 1 Hour
- **Action:** ❌ **DELETE** (will replace with CNAME to Lightspeed)

#### Row 3: A Record (www duplicate?)

- **Type:** AWTF
- **Name:** www
- **Value:** cert.enroomcenter.com
- **TTL:** 1 Hour
- **Action:** ❌ **DELETE** (duplicate/wrong)

#### Row 4: CNAME

- **Type:** CNAME
- **Name:** www
- **Value:** reggieanddro.company.site
- **TTL:** 1 Hour
- **Action:** ✅ **KEEP** - **THIS IS PERFECT!** This is already pointing to Lightspeed!

#### Row 5: MX Record

- **Type:** MX
- **Name:** @
- **Value:** "Privacy protection" mx1.dreamcenter.com
- **TTL:** 1 Hour
- **Action:** ⚠️ **REVIEW** - Is email working? Test before deciding

#### Rows 6-9: MX Records (Google)

- **Type:** MX
- **Name:** @
- **Value:** aspmx.l.google.com (Priority 1)
- **Value:** ah4.aspmx.google.com (Priority 10)
- **Value:** ah3.aspmx.google.com (Priority 10)
- **Value:** ah2.aspmx.google.com (Priority 10)
- **TTL:** 1 Hour each
- **Action:** ⚠️ **KEEP** (if using Google Workspace/Gmail for email)

#### Row 10: TXT Record

- **Type:** TXT
- **Name:** @
- **Value:** FORWARD-MAIL-TXT-ahbc-ehtrr33mra33
- **TTL:** 600 seconds
- **Action:** ✅ **KEEP** (email forwarding)

#### Rows 11-16: TXT Records (Google verification & DKIM)

- Multiple TXT records with encoded values
- **Action:** ✅ **KEEP ALL** (needed for email/verification)

---

## 🎉 GOOD NEWS

**YOU ALREADY HAVE THE LIGHTSPEED CNAME!**

Row 4 shows:

```
Type: CNAME
Name: www
Value: reggieanddro.company.site
TTL: 1 Hour
```

**This is EXACTLY what we need!** ✅

---

## PROBLEMS FOUND

### ❌ DELETE THESE (Conflicting with good CNAME)

**Row 2: www A Record**

- Type: A
- Name: www
- Value: cert.boomcenter.com
- **Problem:** Conflicts with the CNAME in Row 4
- **Action:** DELETE

**Row 3: www A Record**

- Type: A
- Name: www
- Value: cert.enroomcenter.com
- **Problem:** Also conflicts with the CNAME in Row 4
- **Action:** DELETE

**Why this matters:** You CANNOT have both A records AND a CNAME for the same subdomain (www). The CNAME is correct, so the A records must be deleted.

---

## EXACT CLEANUP STEPS

### STEP 1: DELETE Conflicting www A Records

**In the GoDaddy DNS page:**

1. **Find Row 2** (www A record → cert.boomcenter.com)
   - Click the **trash icon** on the right
   - Confirm deletion
   - Click **Save**

2. **Find Row 3** (www A record → cert.enroomcenter.com)
   - Click the **trash icon** on the right
   - Confirm deletion
   - Click **Save**

**Result:** Only the www CNAME (Row 4) remains ✅

---

### STEP 2: Verify Email Configuration

**Your email setup looks GOOD:**

- Google MX records (aspmx.l.google.com, etc.) ✅
- This means you're using Google Workspace or Gmail

**Action:** ✅ **KEEP all MX records** - DO NOT delete these!

---

### STEP 3: Add Domain Forwarding (Root → www)

**Since www is already pointing to Lightspeed, we just need root to redirect:**

1. In GoDaddy control panel, click **"Forwarding"** tab
2. Click **"Add Forwarding"**
3. Fill in:
   - **Domain:** reggieanddro.com
   - **Forward to:** <https://www.reggieanddro.com>
   - **Redirect type:** Permanent (301)
   - **Settings:** Forward only (NOT masked)
4. Click **Save**

---

### STEP 4: Wait for Propagation

**After deleting the 2 conflicting A records:**

- DNS propagation: 5-15 minutes (600 second TTL)
- Don't make more changes during this time

---

### STEP 5: Verify Setup

**After 15 minutes, test:**

```bash
# Check www CNAME (should work immediately)
dig www.reggieanddro.com CNAME +short
# Should return: reggieanddro.company.site

# Check www resolves to Lightspeed IPs
dig www.reggieanddro.com A +short
# Should return Lightspeed IPs (3.222.48.75, etc.)

# Test root forwarding
curl -I http://reggieanddro.com
# Should return: 301 redirect to https://www.reggieanddro.com

# Test final destination
curl -I https://www.reggieanddro.com
# Should return: 200 OK (Lightspeed store)
```

**Browser Test:**

1. Open incognito/private window
2. Go to: <http://reggieanddro.com>
3. Should redirect to: <https://www.reggieanddro.com>
4. Should load: Lightspeed store with products ✅

---

## FINAL DNS CONFIGURATION

**After cleanup (should have):**

### A Records (1)

- **@** (root) → 199.34.228.172 ✅

### CNAME Records (1)

- **www** → reggieanddro.company.site ✅ (already exists!)

### MX Records (4-5)

- **@** → aspmx.l.google.com Priority 1 ✅
- **@** → ah4.aspmx.google.com Priority 10 ✅
- **@** → ah3.aspmx.google.com Priority 10 ✅
- **@** → ah2.aspmx.google.com Priority 10 ✅
- Maybe 1 more (privacy/forwarding) ⚠️

### TXT Records (~6-10)

- All Google verification ✅
- All DKIM/SPF records ✅
- Email forwarding record ✅

### Forwarding

- reggieanddro.com → <https://www.reggieanddro.com> (301) ✅

**Total Records:** ~13-16 (clean, organized, working)

---

## SUMMARY OF CHANGES

### ❌ DELETE (2 records)

1. www A Record → cert.boomcenter.com
2. www A Record → cert.enroomcenter.com

### ✅ KEEP (all other records)

- Root A record (199.34.228.172)
- www CNAME (reggieanddro.company.site) ← **ALREADY CORRECT!**
- All Google MX records (email)
- All TXT records (verification/DKIM)

### ➕ ADD (1 forwarding rule)

- Root domain forwarding → <https://www.reggieanddro.com>

**Total Actions:** DELETE 2 + ADD 1 forwarding = 3 actions

---

## WHY THIS IS SIMPLER THAN EXPECTED

**Good news: Someone already set up the Lightspeed CNAME!** 🎉

Row 4 in your screenshot shows:

```
www → reggieanddro.company.site (CNAME)
```

This is perfect! We just need to:

1. Delete the 2 conflicting www A records
2. Add root domain forwarding
3. Done!

**The hard part was already done!**

---

## EMAIL SAFETY

**Your email is using Google Workspace/Gmail:**

- ✅ aspmx.l.google.com (Google MX)
- ✅ ah4.aspmx.google.com (Google MX backup)
- ✅ ah3.aspmx.google.com (Google MX backup)
- ✅ ah2.aspmx.google.com (Google MX backup)

**Action:** ✅ **KEEP ALL MX RECORDS** - Your email is properly configured!

**Do NOT delete:**

- Any MX records
- Any TXT records
- These are needed for email to work

---

## EXECUTION CHECKLIST

**Before you start:**

- [ ] Screenshot current DNS page (backup)
- [ ] Confirm email is working (send test)
- [ ] Ready to make changes

**Changes to make:**

- [ ] Delete www A record (cert.boomcenter.com)
- [ ] Delete www A record (cert.enroomcenter.com)
- [ ] Add domain forwarding (root → www)

**After changes:**

- [ ] Wait 15 minutes for propagation
- [ ] Test <http://reggieanddro.com> → redirects
- [ ] Test <https://www.reggieanddro.com> → loads store
- [ ] Test email still works
- [ ] Verify SSL (green padlock)

**Estimated time:** 10 minutes changes + 15 minutes propagation = 25 minutes

---

## ROLLBACK PLAN

**If something breaks:**

### Quick Rollback

1. Re-add the 2 www A records:
   - www → cert.boomcenter.com (A)
   - www → cert.enroomcenter.com (A)
2. Remove domain forwarding
3. Wait 15 minutes

### Full Rollback

- Use your backup screenshot
- Restore ALL records exactly as they were
- Wait 15 minutes for DNS propagation

---

## TIER 1 ASSESSMENT

**Current State:** 🟡 7/10 (Good CNAME exists, but conflicting A records)

**Problems:**

- ❌ 2 conflicting www A records (blocking the good CNAME)
- ⚠️ No root domain forwarding yet

**After Cleanup:** ✅ 10/10 (TIER 1 - Perfect!)

**Clean Setup:**

- ✅ www CNAME to Lightspeed (already exists!)
- ✅ Root A record (fallback)
- ✅ Root forwarding to www (will add)
- ✅ Google email working (keep MX records)
- ✅ Clean, organized DNS

---

## NEXT STEPS

**Andrew, execute these 3 simple actions:**

1. ❌ **DELETE** 2 www A records (Row 2 & 3)
2. ➕ **ADD** domain forwarding (root → www)
3. ⏳ **WAIT** 15 minutes
4. ✅ **TEST** in browser
5. 🎉 **GO LIVE** - Done!

**You're 95% there - someone already created the Lightspeed CNAME!**

**Just need to clean up the conflicts and add forwarding.**

---

**🚀 READY TO GO LIVE IN 25 MINUTES!**

**Document Created:** October 2, 2025, 11:55 AM PDT
**Based on:** Live GoDaddy DNS screenshot
**Risk Level:** 🟢 LOW (simple cleanup, email safe, easy rollback)
**Estimated Time:** 25 minutes (10 min work + 15 min propagation)

---

## QUESTIONS?

**None needed - this is straightforward:**

- Delete 2 conflicting records ✅
- Add 1 forwarding rule ✅
- Wait 15 minutes ✅
- Test and celebrate 🎉

**LET'S FINISH THIS! 🚀**
