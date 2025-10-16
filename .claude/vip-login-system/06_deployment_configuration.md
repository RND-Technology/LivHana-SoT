## 🚀 DEPLOYMENT CONFIGURATION

### Docker Configuration
```dockerfile
# Dockerfile for VIP Auth Service
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001"]
```

### Kubernetes Deployment
```yaml
# k8s/vip-auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vip-auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vip-auth-service
  template:
    metadata:
      labels:
        app: vip-auth-service
    spec:
      containers:
      - name: vip-auth-service
        image: reggieanddro/vip-auth-service:latest
        ports:
        - containerPort: 5001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vip-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: vip-secrets
              key: secret-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: vip-auth-service
spec:
  selector:
    app: vip-auth-service
  ports:
  - port: 5001
    targetPort: 5001
  type: LoadBalancer
```

---
