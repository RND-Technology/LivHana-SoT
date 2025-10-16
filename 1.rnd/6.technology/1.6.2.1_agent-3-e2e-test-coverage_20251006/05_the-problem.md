#### THE PROBLEM

The `/health` endpoint on integration-service (port 3005) works perfectly with `curl` but **appears to hang** when called from Playwright's `page.request.get()`.
