### B. AGE-GATE COMPLIANCE MODAL

**Regulatory Requirement:** Banking compliance + Texas hemp law (21+)  
**User Experience:** Single-click entry, non-intrusive, legally bulletproof

**Modal Specifications:**

```html
<!-- Age Gate Modal - Appears Once Per Session -->
<div id="age-gate-modal" style="position:fixed; z-index:9999; background:rgba(0,0,0,0.95);">
  <div class="modal-content" style="max-width:500px; margin:10% auto; padding:40px; background:#fff;">
    
    <img src="/logo.png" alt="Reggie & Dro" style="width:200px; margin-bottom:20px;">
    
    <h2>Welcome to Reggie & Dro</h2>
    <p style="font-size:18px; margin:20px 0;">
      This site contains hemp products (≤0.3% Δ9-THC). 
      <br>You must be 21+ to enter.
    </p>
    
    <label style="display:block; margin:20px 0;">
      <input type="checkbox" id="age-confirm" required>
      I am 21 years of age or older and agree to the 
      <a href="/terms" target="_blank">Terms of Service</a>
    </label>
    
    <button id="enter-site" disabled style="width:100%; padding:15px; font-size:18px; background:#2E7D32; color:#fff; border:none; cursor:pointer;">
      ENTER SITE
    </button>
    
    <button id="exit-site" style="width:100%; padding:10px; margin-top:10px; background:#fff; border:1px solid #ccc;">
      I AM UNDER 21 - EXIT
    </button>
    
  </div>
</div>

<script>
// Age gate logic
document.getElementById('age-confirm').addEventListener('change', function() {
  document.getElementById('enter-site').disabled = !this.checked;
  if(this.checked) {
    document.getElementById('enter-site').style.background = '#2E7D32';
    document.getElementById('enter-site').style.cursor = 'pointer';
  }
});

document.getElementById('enter-site').addEventListener('click', function() {
  sessionStorage.setItem('age-verified', 'true');
  sessionStorage.setItem('terms-agreed', 'true');
  document.getElementById('age-gate-modal').style.display = 'none';
});

document.getElementById('exit-site').addEventListener('click', function() {
  window.location.href = 'https://www.samhsa.gov/find-help/national-helpline';
});

// Check if already verified this session
if(sessionStorage.getItem('age-verified') === 'true') {
  document.getElementById('age-gate-modal').style.display = 'none';
}
</script>
```

**Key Features:**

- Session-based (not cookie, respects privacy)
- Checkbox + button pattern (industry standard)
- Exit button redirects to SAMHSA (shows good faith compliance)
- Terms agreement bundled (CAN-SPAM + membership legal)
- No PII collected at gate (verification later in checkout)
