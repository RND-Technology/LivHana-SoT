### Lead Capture (Backend)
```javascript
// File: backend/integration-service/src/routes/leads.js

app.post('/api/leads/capture', async (req, res) => {
  const lead = req.body;

  // 1. Validate
  if (!lead.email || !lead.firstName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 2. Store in BigQuery
  await bigquery.dataset('livhana_prod').table('leads').insert([{
    timestamp: new Date().toISOString(),
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    businessType: lead.businessType,
    businessName: lead.businessName,
    needs: lead.needs,
    source: 'herb_landing',
    status: 'new'
  }]);

  // 3. Send notification email
  await sendEmail({
    to: 'jesseniesen@gmail.com',
    subject: `New HERB Lead: ${lead.firstName} ${lastName}`,
    body: `
      New lead captured from HERB landing page:
      Name: ${lead.firstName} ${lead.lastName}
      Email: ${lead.email}
      Business: ${lead.businessName} (${lead.businessType})
      Needs: ${lead.needs}
    `
  });

  // 4. Add to CRM/nurture sequence
  await addToCRM(lead);

  res.json({ success: true, message: 'Welcome to HERB!' });
});
```
