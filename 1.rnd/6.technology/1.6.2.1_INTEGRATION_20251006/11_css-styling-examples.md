## CSS Styling Examples

```css
/* age-verification.css */

.age-verification-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-button:hover {
  background: #0056b3;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.privacy-notice {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.verified {
  background: #d4edda;
  color: #155724;
}

.status-badge.expired {
  background: #fff3cd;
  color: #856404;
}

.verification-dashboard .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
}

.stat-card .stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-card.success-rate .stat-value {
  color: #28a745;
}

.stat-card .warning {
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.875rem;
}
```

---

These integration examples show how to use the age verification system in real-world scenarios. Each example is production-ready and can be adapted to your specific needs.

<!-- Last verified: 2025-10-02 -->
# Integration Status Dashboard

**Last Updated:** October 2, 2025 06:23 UTC
**Service Health:** ✅ HEALTHY
**Port:** 3005

---
