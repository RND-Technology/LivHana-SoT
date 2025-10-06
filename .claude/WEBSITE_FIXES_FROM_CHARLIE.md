# WEBSITE FIXES - Charlie's Feedback (October 5, 2025)

## Issue Status

### ✅ Task 2: "Open Pick an App" Popup (RESOLVED - NOT A BUG)

**What Charlie Saw**: Clicking "Contact" shows "Open Pick an App" popup

**Root Cause**:
- Contact link is `tel:2105707507` (phone number link)
- iOS/Android native behavior = shows app picker (Phone, WhatsApp, FaceTime, etc.)
- This is **expected mobile behavior**, not a bug

**User Experience Issue**:
- Link text "(210) 570-7507" doesn't indicate it will open app picker
- Users expect it to just dial

**Recommendation**:
1. **Option A**: Change link text to make it clearer
   - Current: `(210) 570-7507`
   - Better: `📞 Call Us: (210) 570-7507`

2. **Option B**: Add a regular Contact form page
   - Create `/contact` page in LightSpeed
   - Include phone, email, hours, address
   - Keep phone link but in context of full contact info

**Action**: No LightSpeed fix needed - this is working as designed

---

### ⚠️ Task 3: Blank Category Boxes (NEEDS INVESTIGATION)

**What Charlie Saw**:
- Desktop: Colored category boxes are blank unless you hover
- Mobile: Category boxes completely blank

**What I Found**:
- WebFetch shows text-only categories (no colored boxes)
- Categories listed: CBD, CBG, Legal Brick Weed, Low Shelf, Mid Shelf, etc.
- No CSS issues detected in static HTML

**Hypothesis**:
1. **JavaScript-rendered** - Boxes render after page load (WebFetch can't see)
2. **Hover-only CSS** - Text visibility tied to `:hover` state
3. **Theme issue** - LightSpeed theme has CSS bug

**Next Steps**:
- Need to inspect live site with browser dev tools
- Check CSS for category boxes:
  ```css
  /* Look for patterns like: */
  .category-box {
    color: transparent; /* Hidden until hover */
  }
  .category-box:hover {
    color: #000; /* Visible on hover */
  }
  ```

**LightSpeed Fix Location**:
- **Themes** → **Customize** → **Product Page** → **Categories**
- Or: **Themes** → **Edit Code** → Find category CSS

---

### ⚠️ Task 4: Age Verification Inconsistency (NEEDS CLARIFICATION)

**What Charlie Reported**:
- "Shop Premium Flower" button → Requires age verification ✅
- "Browse Strains" link → No age verification ❌
- "Add to Bag" from browse → No age verification ❌

**What I Found**:
- Age gate modal: "Are You 21+?" appears on site entry
- Modal is mandatory before viewing any content
- Two options: "YES, SHOW ME 🔥" or "I'm under 21"

**Confusion**:
- If age gate is mandatory on entry, why is "Shop Premium" different?
- Possible scenarios:
  1. Age gate has cookie bypass after first verification
  2. "Shop Premium" forces re-verification
  3. "Browse Strains" bypasses age check somehow

**Questions for Jesse**:
1. Is "Shop Premium Flower" button going to `/veriff` (Veriff age verification)?
2. Is "Browse Strains" going directly to `/products?categories=...`?
3. Should **Browse Strains also go through /veriff**?

**Current Flow** (from homepage):
```
Shop Premium Flower → /veriff → Veriff age verification → Products
Browse Strains → /products?categories=181298307 → Direct to products (bypasses Veriff)
```

**Recommended Fix**:
- **Option A**: Make "Browse Strains" also link to `/veriff`
- **Option B**: Add age check to all product pages (not just /veriff route)
- **Option C**: Keep slippery slope strategy (verify AFTER purchase) - current approach

---

## PARALLEL WORK: Cheetah Observations

While working on website fixes, I'm documenting Cheetah's patterns:

### Latest Cheetah Changes (October 5, 2025 - 12:00 PM - 1:49 PM)

**Files Modified**:
- `durable-state.js` - 311 lines (added SAFE_MODE)
- `cloud-tasks.js` - 275 lines (added SAFE_MODE)
- `index.js` - 223 lines (service rewrite with graceful shutdown)
- `post-purchase-verification.js` - 791 lines (integrated durable state + idempotency)

**Services Deployed**:
1. Integration Service: https://integration-service-980910443251.us-central1.run.app
2. Voice Service: https://voice-service-980910443251.us-central1.run.app
3. Reasoning Gateway: https://reasoning-gateway-980910443251.us-central1.run.app

**All running in SAFE_MODE** (database disabled for now)

**Current Health**:
```json
{
  "status": "unhealthy",
  "safe_mode": true,
  "services": {
    "database": { "healthy": false },
    "cloud_tasks": { "healthy": false }
  }
}
```

**Cheetah Score**: 8/8 production patterns implemented
**Sonnet Score**: 0/8 execution, learning from Cheetah

---

## NEXT ACTIONS

### Immediate (with Jesse)
1. ✅ Review Task 2 findings (no fix needed)
2. ⏳ Investigate Task 3 (category boxes) - need browser dev tools
3. ⏳ Clarify Task 4 (age verification strategy)

### Parallel (while Cheetah works)
1. ⏳ Continue monitoring Cheetah's progress every 5 minutes
2. ⏳ Document all patterns in CHEETAH_VICTORY_PATTERNS.md
3. ⏳ Stay out of Cheetah's way

---

**Report Created**: October 5, 2025 at 2:32 PM
**Status**: Tasks 2-4 investigated, waiting for Jesse's direction
