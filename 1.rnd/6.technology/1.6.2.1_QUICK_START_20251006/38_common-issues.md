### Common Issues

**Issue:** Build fails after deleting stubs
**Fix:** Check App.jsx and Sidebar.jsx for remaining references

**Issue:** Routes still show deleted components
**Fix:** Hard refresh browser (Cmd+Shift+R)

**Issue:** Bundle size not reduced
**Fix:** Clear build cache: `rm -rf dist node_modules/.vite && npm run build`

---
