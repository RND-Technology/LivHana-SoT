### 4. AUTHENTICATION HANDLING

- VoiceMode uses localStorage token (line 143)
- Other components use credentials: 'include' (line 152)
- No consistent auth pattern
- **Recommendation:** Centralize auth in context/Redux
