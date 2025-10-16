### Redis Key Structure

```
rate-limit:<service>:<tier>:<identifier>
```

Examples:

```
rate-limit:integration-service:public:192.168.1.100
rate-limit:integration-service:authenticated:user:user123
rate-limit:reasoning-gateway:admin:user:admin456
```
