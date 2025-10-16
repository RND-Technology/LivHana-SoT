## CRITICAL ITEM 4: GET UBER DIRECT API KEY (10 MIN) - PRIORITY #1

**WHY:** Primary delivery provider (DoorDash production restricted)
**IMPACT:** Without this, no same-day delivery launch
**STATUS:** Account under review (24-hour timeline)

**EXECUTE:**

1. Open browser: https://business.uber.com/
2. Click "Get Started" or "Sign Up"
3. Select "Uber Direct" delivery
4. Fill out business info (same as DoorDash)
5. Get API credentials from dashboard
6. Copy API key

**CANNIBIS-COMPLIANT APPROVAL STRATEGY:**

**Proactive Communication Message:**
```
Subject: Business Account Verification - Compliant Cannabis Delivery Service

Dear Uber for Business Team,

I am writing to proactively address any potential concerns regarding our business account verification. We operate a fully compliant cannabis delivery service in San Antonio, Texas, and want to ensure our account approval process is smooth and transparent.

BUSINESS OVERVIEW:
- Company: Reggie & Dro Cannabis Store & Social Club
- Location: San Antonio, Texas
- Industry: Cannabis/Hemp retail with delivery services
- Compliance: Fully licensed and regulated by Texas state authorities

COMPLIANCE DOCUMENTATION:
- Texas Cannabis License (if applicable)
- Business License
- Sales Tax Permit
- Certificate of Insurance
- Compliance training certificates

DELIVERY SERVICE DETAILS:
- We provide delivery services for compliant cannabis products
- All products meet Texas state regulations
- Age verification and compliance protocols in place
- Professional delivery staff with background checks

INTEGRATION NEEDS:
- Uber Direct API for delivery optimization
- Integration with LightSpeed POS system
- Real-time tracking and customer communication
- Compliance reporting capabilities

We understand Uber's policies regarding cannabis-related businesses and are committed to full compliance with all applicable laws and regulations. Our delivery service operates within the legal framework established by Texas state authorities.

Please let me know if you need any additional documentation or have questions about our compliance protocols.

Thank you for your consideration.

Best regards,
Jesse Niesen
CEO, Reggie & Dro Cannabis Store & Social Club
Email: jesseniesen@gmail.com
Phone: [Your phone number]
```

**Key Compliance Points:**
- Emphasize legal compliance and professional operations
- Highlight Texas state regulations compliance
- Provide comprehensive documentation proactively
- Address cannabis-specific concerns directly
- Show business track record and revenue potential

**PASTE KEY HERE:**
```bash
# Open this file:
nano /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/delivery-service/.env

# Create new file with this content:
PORT=4003
NODE_ENV=production
DOORDASH_API_KEY=YOUR_DOORDASH_KEY_HERE
DOORDASH_API_SECRET=YOUR_DOORDASH_SECRET_HERE
UBER_API_KEY=YOUR_UBER_KEY_HERE
UBER_API_SECRET=YOUR_UBER_SECRET_HERE
LIGHTSPEED_STORE_ID=117254578
LIGHTSPEED_API_TOKEN=YOUR_LIGHTSPEED_TOKEN_HERE
STORE_ADDRESS="Central San Antonio"
STORE_ZIP=78228
STORE_PHONE="+1-210-555-0100"

# Press Ctrl+X, then Y, then Enter to save
```

**DOORDASH DRIVE API V2 SETUP (PRODUCTION REQUEST SUBMITTED):**
```bash
# Set up DoorDash Drive API v2 testing environment with JWT authentication
# Collection: https://www.postman.com/doordash/doordash/collection/p3d90qw/doordash-drive
# Documentation: https://developer.doordash.com/en-US/docs/drive/reference/

# REQUIRED SETUP:
# 1. Import DoorDash Drive API collection from Postman
# 2. Create environment variables:
#    - DOORDASH_DEVELOPER_ID (from credentials)
#    - DOORDASH_KEY_ID (from credentials)
#    - DOORDASH_SIGNING_SECRET (from credentials)
#    - BASE_URL = https://openapi.doordash.com/drive/v2 (Sandbox)

# 3. Create pre-request script to generate JWT token:
#    - Algorithm: HS256
#    - Header: {"alg":"HS256","typ":"JWT","dd-ver":"DD-JWT-V1"}
#    - Payload: {"aud":"doordash","iss":"{{DOORDASH_DEVELOPER_ID}}","kid":"{{DOORDASH_KEY_ID}}","exp":{{$timestamp + 300}},"iat":{{$timestamp}}}
#    - Sign with {{DOORDASH_SIGNING_SECRET}}
#    - Set result to {{JWT_TOKEN}} variable

# 4. Configure Authorization for all requests:
#    - Type: Bearer Token
#    - Token: {{JWT_TOKEN}}

# 5. Create test requests for:
#    - POST /quotes (get delivery quote)
#    - POST /deliveries (create delivery)
#    - GET /deliveries/{delivery_id} (check status)
#    - POST /deliveries/{delivery_id}/cancel (cancel delivery)

# 6. Add example request bodies:
#    - Pickup address: Central San Antonio, TX 78228
#    - Dropoff address: (variable)
#    - Order value: $75 (in cents = 7500)

# GOAL: Test all endpoints in Sandbox before Production

# Team collaboration:
# - Share Postman collection with Trinity team
# - Set up team environment variables
# - Enable team testing and validation
# - Document API usage patterns
```

**TIME:** 10 minutes
**COMPLETE:** [ ]

---
