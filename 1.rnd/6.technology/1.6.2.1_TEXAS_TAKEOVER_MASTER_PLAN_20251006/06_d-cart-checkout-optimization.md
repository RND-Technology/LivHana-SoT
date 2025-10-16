### D. CART & CHECKOUT OPTIMIZATION

**Problem:** High abandonment, unclear shipping costs, friction at payment  
**Solution:** Progress bar, free shipping threshold, one-page checkout

**Cart Page Elements:**

```
[PROGRESS BAR: Cart → Info → Payment → Confirm]

YOUR STASH [3 items] 

[Product 1] $XX
[Product 2] $XX
[Product 3] $XX

Subtotal: $XX
Shipping: $XX [or] "Add $12 more for FREE SHIPPING 🎉"

Loyalty Points Earned: 150 points = $15 off next order
[Apply Points: -$XX]

---

**ADD MORE & SAVE:**
[3 quick-add products relevant to cart items]

---

TOTAL: $XXX

[SECURE CHECKOUT →]

"💳 Secure Payment | 🚚 Discreet Packaging | ⭐ 247+ Happy Texans"
```

**Checkout Flow - Two-Phase Verification System:**

**PHASE 1: IMMEDIATE ORDER ACCEPTANCE**

```
Step 1: Customer Info
- Email (required)
- Phone (required)
- Name
- Shipping Address

[AUTO-CHECK TRIGGERS]:
✓ Query database for existing Veriff approval
✓ Query database for membership agreement on file
✓ Query database for email opt-in status

IF ALL TRUE → Proceed to payment immediately
IF ANY FALSE → Flag for post-purchase verification
```

**Step 2: Payment**

```
[Square Payment Form - Full PCI Compliance]

Accept: Credit/Debit/ACH
[Pay Now - $XXX]

Fine print: "Order requires age/ID verification. If not on file, 
you'll receive email instructions within 1 hour. 
Orders ship within 24 hours of verification."
```

**Step 3: Confirmation**

```
✓ ORDER CONFIRMED - #R&D[order number]

Check your email ([email]) for:
- Order confirmation
- Tracking info (ships within 24 hours)
[IF FLAGGED]: - Age verification instructions (complete within 72 hours)

[SOCIAL SHARE CTA]: 
"Share your order with friends = Earn $10 credit"
[Facebook] [Twitter] [Copy Link]
```

---

**PHASE 2: POST-PURCHASE VERIFICATION (If Needed)**

**Automated Email Sequence:**

**EMAIL 1: Immediate (within 15 minutes of order)**

```
Subject: Action Required: Complete Your Reggie & Dro Order #[XXX]

Hi [Name],

Thanks for your order! We're excited to get your Texas legal weed to you.

⚠️ ONE QUICK STEP NEEDED:

Your order requires [age verification / membership agreement / email opt-in].

[COMPLETE VERIFICATION NOW - Big Button]

⏰ Complete within 72 hours or your order will be automatically refunded.

Current Status:
✓ Payment received: $XXX
❌ Age/ID verification: [PENDING]
❌ Membership agreement: [PENDING if needed]

Questions? Text us: [phone] or reply to this email.

Thanks,
Liv Hana @ Reggie & Dro
```

**EMAIL 2: 24 Hours Later**

```
Subject: ⏰ 48 Hours Left - Complete Your Order #[XXX]

Hi [Name],

Quick reminder: Your order ships as soon as you complete verification.

[COMPLETE NOW - 2 Minutes]

⏰ 48 hours remaining before auto-refund.

We've got your [list items] ready to ship - don't miss out!
```

**EMAIL 3: 48 Hours Later**

```
Subject: ⏰ FINAL REMINDER - 24 Hours to Complete Order #[XXX]

Hi [Name],

This is your final reminder before your order is automatically refunded.

[COMPLETE VERIFICATION NOW - Last Chance]

⏰ 24 hours remaining.

Need help? Text [phone] - we're here to help!
```

**EMAIL 4: 72 Hours - Auto-Refund**

```
Subject: Order #[XXX] Refunded - We'll Be Here When You're Ready

Hi [Name],

Your order has been automatically refunded to [payment method ending in XXXX].

Refund amount: $XXX
Processing time: 3-5 business days

We understand verification can be a hassle - we're required by our banking 
partners to collect this info before we can ship.

Ready to try again? We'll save your cart:
[REORDER IN 1 CLICK]

Questions? Text [phone] anytime.

Thanks,
Reggie & Dro Team
```

---
