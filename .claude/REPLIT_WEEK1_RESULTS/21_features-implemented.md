### Features Implemented
- ✅ Collaborative filtering algorithm (similar customers)
- ✅ Batch recommendations support
- ✅ Fallback to popular products if collaborative filtering fails
- ✅ Confidence scores for each recommendation
- ✅ Health check endpoint (`/health`)
- ✅ Single customer recommendations (`GET /api/recommendations/:customerId`)
- ✅ Batch recommendations (`POST /api/recommendations/batch`)
- ✅ Resilient to failures with Promise.allSettled
