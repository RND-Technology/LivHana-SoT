#### What Actually Happened

```bash
$ host -t CNAME aaacbdhempflower.com
aaacbdhempflower.com has no CNAME record

$ host -t A aaacbdhempflower.com
aaacbdhempflower.com has address 34.143.72.2
```

**GoDaddy's API silently converted the invalid CNAME → A record.**
