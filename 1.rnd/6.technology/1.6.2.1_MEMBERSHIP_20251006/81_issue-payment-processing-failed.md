### Issue: "Payment processing failed"

**Solution:** Check KAJA credentials:

```bash
# Verify credentials are set
echo $AUTHORIZE_NET_API_LOGIN_ID
echo $AUTHORIZE_NET_TRANSACTION_KEY

# Check sandbox mode
echo $AUTHORIZE_NET_SANDBOX  # Should be 'true' for testing
```
