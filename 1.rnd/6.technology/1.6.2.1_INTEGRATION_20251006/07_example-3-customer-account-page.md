## Example 3: Customer Account Page

```javascript
// customer-account.js
function CustomerAccount({ customerId }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationStatus();
  }, [customerId]);

  async function loadVerificationStatus() {
    try {
      const response = await fetch(
        `/api/age-verification/status/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        // Not verified yet
        setVerification({ verified: false });
      } else {
        const data = await response.json();
        setVerification(data);
      }
    } catch (error) {
      console.error('Failed to load verification status:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-page">
      <h2>My Account</h2>

      <section className="age-verification-section">
        <h3>Age Verification</h3>

        {!verification?.verified && (
          <div className="verification-pending">
            <p>You need to verify your age to make purchases.</p>
            <button onClick={() => window.location.href = '/age-verification'}>
              Verify Age Now
            </button>
          </div>
        )}

        {verification?.verified && !verification?.expired && (
          <div className="verification-active">
            <span className="status-badge verified">✓ Verified</span>
            <p>Your age has been verified.</p>
            <small>
              Verified on: {new Date(verification.verifiedAt).toLocaleDateString()}
              <br />
              Expires: {new Date(verification.expiresAt).toLocaleDateString()}
            </small>
          </div>
        )}

        {verification?.verified && verification?.expired && (
          <div className="verification-expired">
            <span className="status-badge expired">⚠ Expired</span>
            <p>Your age verification has expired. Please reverify to continue shopping.</p>
            <button onClick={() => window.location.href = '/age-verification'}>
              Reverify Age
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
```

---
