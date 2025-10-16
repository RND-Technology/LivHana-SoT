### **Excellent Crypto Implementation:**

```javascript
function encryptData(data, secretKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secretKey), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

**Perfect!** Uses:

- Random IV per encryption
- GCM mode with authentication tag
- Secure key handling
