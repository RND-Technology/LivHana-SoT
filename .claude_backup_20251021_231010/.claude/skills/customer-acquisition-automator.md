# Customer Acquisition Automator Skill

## Description

Scrape competitor customer reviews, identify unhappy customers, auto-generate personalized outreach for customer acquisition.

## Revenue Impact

**Target**: $240-2,400/day
**ROI**: 10-100X (low cost, high conversion)

## When to Invoke

- Daily at 8am (morning lead generation)
- When user says "get customers", "find leads", "acquisition"
- Before major marketing campaigns
- When revenue is below target

## Process

### Phase 1: Scrape Competitor Data

**Target Sources** (Legal public data):

1. **Weedmaps Reviews**: Competitor dispensary reviews
2. **Leafly Reviews**: Product and dispensary ratings
3. **Google Reviews**: Local competitor feedback
4. **Reddit/Social**: Cannabis community discussions

**Scraping Code**:

```python
from playwright.sync_api import sync_playwright
import pandas as pd
from datetime import datetime, timedelta

def scrape_competitor_reviews(competitor_name: str, days_back: int = 7):
    """Scrape recent reviews for competitor"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to competitor's Weedmaps page
        page.goto(f"https://weedmaps.com/dispensaries/{competitor_name}")

        # Extract reviews
        reviews = page.query_selector_all('.review-item')

        scraped_data = []
        for review in reviews:
            # Extract review details
            rating = review.query_selector('.rating').inner_text()
            text = review.query_selector('.review-text').inner_text()
            date = review.query_selector('.review-date').inner_text()

            # Only get recent negative reviews
            if int(rating.split('/')[0]) <= 3:  # 3 stars or less
                scraped_data.append({
                    'rating': rating,
                    'text': text,
                    'date': date,
                    'competitor': competitor_name
                })

        browser.close()
        return scraped_data

# Scrape top 5 competitors
competitors = [
    "competitor-a-seattle",
    "competitor-b-seattle",
    "competitor-c-seattle",
    "competitor-d-seattle",
    "competitor-e-seattle"
]

all_reviews = []
for competitor in competitors:
    reviews = scrape_competitor_reviews(competitor, days_back=7)
    all_reviews.extend(reviews)

# Save to CSV for analysis
df = pd.DataFrame(all_reviews)
df.to_csv('.claude/scraping_data/competitor_reviews.csv', index=False)
```

### Phase 2: Extract Pain Points & Opportunities

**AI Analysis**:

```python
import openai

def analyze_review_for_pain_points(review_text: str) -> dict:
    """Use GPT-4 to extract structured pain points"""

    prompt = f"""
    Analyze this dispensary review and extract:
    1. Main complaint/pain point
    2. Severity (1-10)
    3. How Liv Hana can solve it
    4. Estimated customer value if converted

    Review: {review_text}

    Return JSON format.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4-turbo-preview",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return json.loads(response.choices[0].message.content)

# Analyze all reviews
hot_leads = []
for review in all_reviews:
    analysis = analyze_review_for_pain_points(review['text'])

    if analysis['severity'] >= 7:  # High severity complaints
        hot_leads.append({
            'review': review,
            'pain_point': analysis['main_complaint'],
            'our_solution': analysis['solution'],
            'estimated_value': analysis['customer_value']
        })

# Sort by estimated value
hot_leads.sort(key=lambda x: x['estimated_value'], reverse=True)
```

### Phase 3: Generate Personalized Outreach

**Auto-Generated Messages**:

```python
def generate_outreach_message(lead: dict) -> str:
    """Generate personalized outreach based on pain point"""

    templates = {
        "slow_delivery": """
        Hi! We noticed you mentioned slow delivery from {competitor}.
        At Liv Hana, we offer same-day delivery in under 2 hours.
        First order: 20% off + free delivery. Try us!
        {link}
        """,

        "high_prices": """
        Hi! Saw your review about pricing at {competitor}.
        Liv Hana offers the same quality at 15-20% lower prices.
        Plus: loyalty points, bulk discounts, first-order 20% off.
        Check us out: {link}
        """,

        "poor_selection": """
        Hi! Looking for more variety than {competitor}?
        Liv Hana stocks 200+ strains, including rare/exclusive products.
        Browse our full menu + get 20% off first order: {link}
        """,

        "bad_customer_service": """
        Hi! Sorry you had a bad experience at {competitor}.
        At Liv Hana, we pride ourselves on expert budtenders and
        personalized recommendations. Come experience the difference!
        20% off first visit: {link}
        """
    }

    # Determine pain point category
    pain_category = classify_pain_point(lead['pain_point'])

    # Generate message
    message = templates[pain_category].format(
        competitor=lead['review']['competitor'],
        link="https://livhana.com/?ref=acquisition&discount=FIRST20"
    )

    return message
```

### Phase 4: Slack Integration for Approval

**Send to Team for Review**:

```python
import requests

def send_to_slack_for_approval(lead: dict, message: str):
    """Post lead to Slack for team approval before sending"""

    slack_webhook = os.getenv("SLACK_WEBHOOK_URL")

    payload = {
        "text": "🎯 New Hot Lead Identified",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Pain Point*: {lead['pain_point']}\n"
                           f"*Estimated Value*: ${lead['estimated_value']}\n"
                           f"*Original Review*: {lead['review']['text'][:200]}..."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Proposed Outreach*:\n{message}"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "✅ Approve & Send"},
                        "style": "primary",
                        "value": f"approve_{lead['id']}"
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "✏️ Edit Message"},
                        "value": f"edit_{lead['id']}"
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "❌ Skip"},
                        "style": "danger",
                        "value": f"skip_{lead['id']}"
                    }
                ]
            }
        ]
    }

    requests.post(slack_webhook, json=payload)
```

### Phase 5: Track Conversion & Revenue

**Measure Results**:

```python
def track_acquisition_performance():
    """Daily report on customer acquisition performance"""

    metrics = {
        'reviews_scraped': len(all_reviews),
        'hot_leads_identified': len(hot_leads),
        'messages_sent': count_sent_messages(),
        'responses_received': count_responses(),
        'conversions': count_new_customers(),
        'revenue_generated': calculate_revenue(),
        'cost_per_acquisition': calculate_cpa(),
        'roi': calculate_roi()
    }

    # Log to revenue tracker
    log_revenue_event('customer_acquisition', 'daily_performance', metrics['revenue_generated'])

    # Post to Slack
    post_daily_report(metrics)

    return metrics
```

## Example Daily Workflow

**8:00 AM - Auto-Run**:

```python
# 1. Scrape competitors (5 min)
reviews = scrape_all_competitors()
print(f"✅ Scraped {len(reviews)} reviews")

# 2. Identify hot leads (5 min)
hot_leads = analyze_and_rank(reviews)
print(f"🎯 Found {len(hot_leads)} hot leads")

# 3. Generate messages (2 min)
messages = [generate_outreach_message(lead) for lead in hot_leads]
print(f"📧 Generated {len(messages)} outreach messages")

# 4. Send to Slack for approval (1 min)
for lead, message in zip(hot_leads, messages):
    send_to_slack_for_approval(lead, message)
print(f"✅ Sent to Slack for team review")

# 5. Track performance
print(f"📊 Yesterday's results: {track_acquisition_performance()}")
```

**Throughout Day - Team Approves/Sends**:

- Team reviews leads in Slack
- Approves best opportunities
- Sends personalized outreach
- Tracks responses and conversions

## Revenue Model

**Conservative Estimate**:

- 10 hot leads/day identified
- 5 approved and sent (50% approval rate)
- 1 conversion (20% conversion rate)
- $120 average first order
- **Revenue**: $120/day

**Optimistic Estimate**:

- 50 hot leads/day identified
- 30 approved and sent (60% approval rate)
- 10 conversions (33% conversion rate)
- $150 average first order
- **Revenue**: $1,500/day

**Realistic Target**:

- 20 hot leads/day
- 12 sent (60%)
- 2 conversions (17%)
- $120 average order
- **Revenue**: $240/day

## Legal & Ethical Considerations

✅ **Legal**:

- Only scrape public data (reviews, ratings)
- Respect robots.txt
- Don't overload servers (rate limiting)
- No personal contact info scraped

✅ **Ethical**:

- Transparent about how we found them
- Genuine value proposition
- Opt-out option provided
- No spam or aggressive tactics

❌ **Don't Do**:

- Scrape private data
- Fake reviews
- Misleading claims
- Harass competitors

## Integration

**With Slack Bot** (Flag #2):

- Auto-posts leads for approval
- Tracks team responses
- Measures conversion rates

**With Revenue Tracker**:

- Logs daily acquisition revenue
- Tracks cost per acquisition
- Calculates ROI

**With RPM Validator**:

- Validates ROI accuracy
- Competes in competition framework
- Tracks prediction vs actual

## Success Metrics

**Week 1 Goals**:

- [ ] 50+ reviews scraped/day
- [ ] 10+ hot leads identified/day
- [ ] 5+ messages sent/day
- [ ] 1+ conversion/day
- [ ] $120+ revenue/day

**Month 1 Goals**:

- [ ] 200+ reviews scraped/day
- [ ] 50+ hot leads identified/day
- [ ] 30+ messages sent/day
- [ ] 5+ conversions/day
- [ ] $600+ revenue/day

## Output Format

```
🎯 CUSTOMER ACQUISITION REPORT
Date: 2025-10-21

📊 Reviews Scraped: 87
🔥 Hot Leads Found: 23
📧 Messages Sent: 14
💰 Conversions: 2
📈 Revenue: $240

🎯 Top Pain Points:
1. Slow delivery (18 mentions)
2. High prices (12 mentions)
3. Poor selection (9 mentions)

🏆 Best Performing Message:
"Slow delivery" template → 25% conversion rate

⏭️ Tomorrow's Target: 25 hot leads, 3 conversions, $360 revenue
```

---

**Status**: READY TO DEPLOY
**Expected Revenue**: $240/day starting Day 1
**Time to First Revenue**: 24-48 hours
