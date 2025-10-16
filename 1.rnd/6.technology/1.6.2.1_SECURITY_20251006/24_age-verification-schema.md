#### Age Verification Schema

```javascript
{
  birthdate: Joi.date()
    .iso()
    .max('now')
    .required(),
  metadata: Joi.object({
    sessionId: Joi.string().uuid().optional(),
    referrer: Joi.string().uri().optional(),
    userAgent: Joi.string().max(500).optional()
  }).optional()
}
```

---
