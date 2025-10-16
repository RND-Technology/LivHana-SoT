### **State Legality Check:**

```javascript
if (product.category === "cannabis") {
  const user_state = user.location.state;
  const legal_states = ["TX", "OK", "LA", "NM", ...];

  if (!legal_states.includes(user_state)) {
    return {
      warning: "Cannabis products may not be legal in your state",
      message: "Check your state's hemp laws before purchasing",
      allow_continue: false
    };
  }
}
```
