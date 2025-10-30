#### **Data Collection Loop (Weeks 2-6)**

**Step 1: Member Makes Purchase**

- Uses LSS to get recommendation
- Buys via "Buy Direct" button
- Transaction logged (SKU, price, date, member_id)

**Step 2: Product Delivered**

- Member receives product (2-3 days)
- Email trigger: "How was [Product Name]? Submit feedback for $10 bonus"

**Step 3: Member Submits Feedback**

- Survey (5 minutes):

  ```
  1. Recommendation Accuracy (1-5 stars)
     "How well did the AI understand your needs?"

  2. Product Match (Yes/No + details)
     "Did the product match your expectations?"

  3. Effect Outcomes (1-10 scale for each)
     - Relaxation
     - Focus
     - Pain relief
     - Mood boost
     - Sleep quality
     - Appetite
     - Creativity

  4. Would You Buy Again? (Yes/No)

  5. Open Feedback (optional, 1-2 sentences)
     "Anything else we should know?"
  ```

- Reward: $10 credit added to cashback wallet

**Step 4: AI Learns**

- Data added to training set:

  ```json
  {
    "member_profile": {
      "age_range": "25-34",
      "use_cases": ["relaxation", "sleep"],
      "purchase_history": [...]
    },
    "product": {
      "sku": "cheetah-piss-premium",
      "thca_percentage": 28.4,
      "terpenes": {"myrcene": 1.8, "limonene": 0.6},
      "price": "$55"
    },
    "outcome": {
      "relaxation": 9,
      "sleep": 8,
      "satisfaction": 5,
      "repeat_purchase": true
    }
  }
  ```

- Model updated: "Members seeking relaxation + high myrcene → recommend Cheetah Piss"

---
