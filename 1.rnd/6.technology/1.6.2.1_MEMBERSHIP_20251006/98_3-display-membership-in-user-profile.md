### 3. Display Membership in User Profile

**Profile Page:**

```javascript
// Example: Fetch and display membership
const MembershipCard = ({ customerId }) => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const response = await fetch(`/api/memberships/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });

        if (response.status === 404) {
          setMembership(null); // No membership
        } else {
          const data = await response.json();
          setMembership(data.membership);
        }
      } catch (error) {
        console.error('Failed to load membership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [customerId]);

  if (loading) return <div>Loading...</div>;

  if (!membership) {
    return (
      <div className="no-membership">
        <h3>Not a member yet?</h3>
        <p>Join our membership program and save up to 30%!</p>
        <button onClick={() => showMembershipPlans()}>
          View Membership Plans
        </button>
      </div>
    );
  }

  return (
    <div className="membership-card">
      <h2>{membership.tier} Member</h2>
      <p className="discount">{membership.discount_percent}% OFF all orders</p>
      <p className="price">${membership.price}/month</p>
      <p className="next-billing">
        Next billing: {new Date(membership.next_billing_date).toLocaleDateString()}
      </p>

      <div className="benefits">
        <h3>Your Benefits:</h3>
        <ul>
          {membership.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button onClick={() => upgradeMembership()}>
          Upgrade Tier
        </button>
        <button onClick={() => cancelMembership()}>
          Cancel Membership
        </button>
      </div>
    </div>
  );
};
```

---
