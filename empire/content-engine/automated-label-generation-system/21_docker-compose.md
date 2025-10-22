### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  invoice-capture:
    build: ./backend/invoice-capture-service
    ports:
      - "5001:5001"
    environment:
      - EMAIL_HOST=imap.gmail.com
      - EMAIL_USER=high@reggieanddro.com
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
    volumes:
      - ./data/invoices:/app/data
    restart: unless-stopped

  label-generation:
    build: ./backend/label-generation-service
    ports:
      - "5002:5002"
    volumes:
      - ./data/labels:/app/data
    restart: unless-stopped

  coa-integration:
    build: ./backend/coa-integration-service
    ports:
      - "5003:5003"
    volumes:
      - ./data/coas:/app/data
    restart: unless-stopped

  sku-generation:
    build: ./backend/sku-generation-service
    ports:
      - "5004:5004"
    volumes:
      - ./data/skus:/app/data
    restart: unless-stopped

  approval-workflow:
    build: ./backend/approval-workflow-service
    ports:
      - "5005:5005"
    volumes:
      - ./data/approvals:/app/data
    restart: unless-stopped

  lightspeed-integration:
    build: ./backend/lightspeed-integration-service
    ports:
      - "5006:5006"
    environment:
      - LIGHTSPEED_ACCOUNT_ID=${LIGHTSPEED_ACCOUNT_ID}
      - LIGHTSPEED_API_KEY=${LIGHTSPEED_API_KEY}
    restart: unless-stopped

  approval-dashboard:
    build: ./frontend/approval-dashboard
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:5005
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=reggieanddro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---
