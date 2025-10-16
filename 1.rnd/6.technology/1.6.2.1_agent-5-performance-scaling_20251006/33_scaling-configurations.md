### Scaling Configurations

**For 11K members (current):**

- Frontend: 2 instances (0.5 vCPU, 512MB each)
- Backend: 2 instances (1 vCPU, 1GB each)
- Workers: 2 instances (1 vCPU, 1GB each)
- Redis: 1 primary + 1 replica (4GB memory)
- **Total**: ~$150-200/month

**For 50K members (Texas Year 1):**

- Frontend: 3 instances (0.5 vCPU, 512MB each)
- Backend: 4 instances (2 vCPU, 2GB each)
- Workers: 6 instances (2 vCPU, 2GB each)
- Redis: 1 primary + 2 replicas (16GB memory)
- **Total**: ~$600-800/month

**For 200K members (Texas Year 3):**

- Frontend: 6 instances (1 vCPU, 1GB each)
- Backend: 12 instances (4 vCPU, 4GB each)
- Workers: 24 instances (4 vCPU, 4GB each)
- Redis: 3-node cluster (64GB total)
- **Total**: ~$3,000-4,000/month
