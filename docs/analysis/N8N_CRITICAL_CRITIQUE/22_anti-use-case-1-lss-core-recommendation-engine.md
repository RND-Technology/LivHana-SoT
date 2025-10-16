### **Anti-Use Case 1: LSS Core Recommendation Engine** ❌

**Why NOT N8N**:

- Complex ML logic (AI model inference, personalization)
- Performance critical (<2 second latency requirement)
- Needs custom code (Python/Node.js for model serving)
- N8N adds latency + complexity

**Verdict**: Core product logic = CODE ONLY. Never use N8N.

---
