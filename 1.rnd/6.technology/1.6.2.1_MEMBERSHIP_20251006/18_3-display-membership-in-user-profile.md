#### 3. Display Membership in User Profile

```javascript
const fetchMembership = async (customerId) => {
  const response = await fetch(`/api/memberships/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });

  if (response.status === 404) {
    return null; // No membership
  }

  const data = await response.json();
  return data.membership;
};
```
