### 1C: Product Page Template Optimization

**Claude Code Prompt:**

```
You are optimizing product pages for a Texas hemp e-commerce site to maximize conversion rate.

CURRENT PROBLEM:
- Generic product listings
- No social proof visible
- No urgency triggers
- Poor mobile experience
- Missing trust signals (COAs, lab results)

NEW STRUCTURE REQUIREMENTS:

**Above the Fold:**
1. Image carousel (3-5 product angles, WebP optimized)
2. Product name + tier badge (Brick | Value | Premium | Top Shelf)
3. Star rating + review count (e.g., "★★★★★ 4.7/5 (23 reviews)")
4. Dynamic badge (e.g., "247 sold this week" or "Trending")
5. Pricing: Per-gram, eighth, oz with discount % on bulk (e.g., "SAVE 40% ON OZ")
6. Urgency bar: Inventory-based scarcity (e.g., "🔥 Only 3 oz left" or "✓ 12 in stock - ships today")
7. Primary CTA: "Add to Cart - $XX"

**Below the Fold:**
8. "The Strain Story" - 2-3 sentence description (effects, flavor, Texas angle)
9. Terpene profile (visual bar chart with percentages + effect descriptions)
10. Lab results (expandable dropdown with COA link, THCa %, Δ9-THC %, CBD %, batch #)
11. Customer reviews section (sortable: Most Recent | Highest Rated | With Photos)
12. Review submission CTA (with loyalty points incentive)
13. "You Might Also Like" recommendations (3 products: same tier, complementary, higher tier)
14. Secondary CTA: "Subscribe & Save 15%" (teaser for future feature)

TECHNICAL IMPLEMENTATION:
- Platform: LightSpeed webstore
- Template file: product.liquid
- Dynamic data source: Square API (inventory sync)
- Review system: Yotpo or Judge.me integration (or custom if neither available)
- Image handling: Lazy loading, WebP with JPEG fallback, <200KB per image
- Schema markup: Product, AggregateRating, Offer (for Google Shopping eligibility)

CONVERSION OPTIMIZATION FEATURES:
- Exit-intent popup (offer 10% discount on first purchase)
- Add-to-cart floating button (sticky on scroll)
- Estimated delivery date display
- Free shipping threshold progress bar (e.g., "Add $12 more for free shipping")
- Low stock alerts (if inventory <10 units)

ACCESSIBILITY:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratio >4.5:1

DELIVERABLES:
1. product-template.liquid (LightSpeed template with Liquid syntax)
2. product-page.css (modular, BEM methodology)
3. product-interactions.js (vanilla JS for dynamic elements)
4. square-inventory-sync.js (API integration for real-time stock display)
5. schema-markup.json (structured data template)
6. A/B testing plan (3 variants to test)

Create production-ready code optimized for conversion. Include comments explaining each section's purpose and conversion psychology principles applied.
```

**Expected Output:** Complete product page template system

---
