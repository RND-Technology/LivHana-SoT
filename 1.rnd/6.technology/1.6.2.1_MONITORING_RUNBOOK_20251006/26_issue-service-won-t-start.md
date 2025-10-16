### Issue: Service Won't Start

**Symptoms**: Service fails to start or crashes immediately

**Causes**:

- Missing environment variables
- Port already in use
- Database connection failure
- Syntax error in code

**Resolution**:

1. Check logs for error messages
2. Verify all required environment variables are set
3. Check if port is available: `lsof -i :3005`
4. Test database connections manually
5. Run linter: `npm run lint`
