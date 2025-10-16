### Example: User Profile

```javascript
// Display membership in user profile
const response = await fetch(`/api/memberships/${customerId}`, {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
});

if (response.ok) {
  const { membership } = await response.json();
  displayMembershipCard(membership);
} else {
  showJoinMembershipPrompt();
}
```
