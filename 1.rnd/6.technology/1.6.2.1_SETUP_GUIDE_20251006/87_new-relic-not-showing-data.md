### "New Relic not showing data"

1. Check NEW_RELIC_LICENSE_KEY is set
2. Verify `require('newrelic')` is FIRST
3. Check logs: `~/.newrelic/newrelic.log`
4. Wait 1-2 minutes for data to appear
