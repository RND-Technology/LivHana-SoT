### Frontend: Age Verification Form

```javascript
// age-verification-form.js
function AgeVerificationForm({ customerId, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    idNumberLast4: '',
    state: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/age-verification/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        // Success!
        onSuccess(data);
      } else if (response.status === 429) {
        // Rate limited
        setError(
          `Too many attempts. Please try again after ${new Date(data.resetAt).toLocaleString()}`
        );
      } else {
        // Verification failed
        setError(data.reason || 'Verification failed. Please check your information.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Unable to verify age. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="age-verification-form">
      <h2>Age Verification</h2>
      <p>We need to verify that you are 21 or older to purchase our products.</p>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="idNumberLast4">Last 4 Digits of ID</label>
        <input
          type="text"
          id="idNumberLast4"
          value={formData.idNumberLast4}
          onChange={(e) => setFormData({ ...formData, idNumberLast4: e.target.value })}
          placeholder="1234"
          maxLength="4"
          pattern="[0-9]{4}"
          required
        />
        <small>Enter the last 4 digits of your driver's license or state ID</small>
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <select
          id="state"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
        >
          <option value="">Select your state...</option>
          <option value="TX">Texas</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
          {/* Add all 50 states + DC */}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="submit-button"
      >
        {submitting ? 'Verifying...' : 'Verify Age'}
      </button>

      <div className="privacy-notice">
        <small>
          Your information is encrypted and stored securely. We only collect the minimum
          information required for age verification in compliance with state regulations.
        </small>
      </div>
    </form>
  );
}
```
