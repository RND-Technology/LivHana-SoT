### 12.3 Network Issues
```bash
# Check network connectivity
ping google.com
curl -I https://github.com

# Check DNS
nslookup github.com

# Reset network
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```
