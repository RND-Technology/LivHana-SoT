### For Cheetah

1. **Validate fundamentals BEFORE implementing**
   - "Can CNAME exist at @?" → 30 seconds of research
   - Would have prevented 27 minutes of trial-and-error

2. **Verify what actually got created**
   - Assumed CNAME was created
   - Actually A record was created
   - `dig` verification takes 5 seconds

3. **One correct script > six flawed scripts**
   - Quality over iteration speed
   - Understand WHY something works
