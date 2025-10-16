#### 4. Lightspeed OAuth2 Token Generation
**Deadline**: Today 2pm CST  
**Priority**: HIGH  
**Instructions**:
1. Navigate to reggieanddro.retail.lightspeed.app
2. Login with admin credentials
3. Go to Setup → Personal Tokens
4. Click "Generate New Token"
5. Set token name: "LivHana Integration"
6. Select permissions: Read/Write for all resources
7. Generate token and copy to clipboard
8. Add token to .env file in LivHana-SoT/backend/integration-service/
9. Update LIGHTSPEED_USE_MOCK=false
10. Test API connection

**Required Info**:
- Account ID: 020b2c2a-4661-11ef-e88b-b42e5d3b90cc
- Current status: Mock mode
- Required permissions: Read/Write all resources
- Integration service location: LivHana-SoT/backend/integration-service/

**Environment**: Laptop with admin access to Lightspeed, code editor
