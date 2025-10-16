#### Usage Example

```javascript
const { validateBody } = require('../../common/validation/middleware');
const { ageVerificationSchema } = require('../../common/validation/schemas');

router.post('/verify',
  validateBody(ageVerificationSchema),
  async (req, res) => {
    // req.body is now validated and sanitized
    const { birthdate } = req.body;
    // ...
  }
);
```
