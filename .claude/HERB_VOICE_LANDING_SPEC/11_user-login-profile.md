### User Login/Profile
```javascript
// File: public/js/auth.js

async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('authToken', data.token);
    showProfile(data.user);
  }
}

function showProfile(user) {
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('profileDropdown').style.display = 'block';
  document.querySelector('.username').textContent = user.name;
  document.querySelector('.avatar').src = user.avatar || '/assets/default-avatar.png';
}
```

---
