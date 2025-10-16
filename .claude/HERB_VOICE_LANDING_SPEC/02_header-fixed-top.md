### Header (Fixed Top)
```html
<header class="herb-header">
  <div class="logo">
    <img src="/assets/herb-logo.svg" alt="HERB">
    <span>Herbitrage Elevated Reasoning Bot</span>
  </div>

  <nav>
    <a href="#voice">Voice Mode</a>
    <a href="#features">Features</a>
    <a href="#empire">Empire</a>
    <a href="#pricing">Pricing</a>
  </nav>

  <!-- USER LOGIN/PROFILE (TOP RIGHT) -->
  <div class="user-profile">
    <div class="login-button" id="loginBtn">
      <i class="icon-user"></i>
      <span>Login</span>
    </div>

    <!-- After login -->
    <div class="profile-dropdown" id="profileDropdown" style="display:none;">
      <img src="/api/user/avatar" class="avatar">
      <span class="username">Jesse N.</span>
      <div class="dropdown-menu">
        <a href="/profile">My Profile</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Settings</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  </div>
</header>
```

---
