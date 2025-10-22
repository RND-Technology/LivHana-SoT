### TODAY: LAUNCH IN 30 MINUTES

**Step 1: Get DoorDash API Key (15 minutes)**

1. Go to <https://merchant.doordash.com/>
2. Log in (or create account)
3. Navigate to API/Developer section
4. Generate API key
5. Copy key

**Step 2: Get Uber Eats API Key (15 minutes)**

1. Go to <https://merchants.ubereats.com/>
2. Log in (or create account)
3. Navigate to API/Developer section
4. Generate API key
5. Copy key

**Step 3: Add Keys to .env (1 minute)**

```bash
cd backend/delivery-service
echo "DOORDASH_API_KEY=your-key-here" >> .env
echo "UBER_API_KEY=your-key-here" >> .env
```

**Step 4: Deploy (5 minutes)**

```bash
./deploy.sh
```

**DONE - SERVICE LIVE**
