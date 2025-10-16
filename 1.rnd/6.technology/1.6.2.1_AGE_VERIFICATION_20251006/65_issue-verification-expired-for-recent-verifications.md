### Issue: "Verification expired" for recent verifications

**Solution:** Check system clock synchronization:

```bash
# Sync system time
sudo ntpdate -s time.nist.gov
```

---
