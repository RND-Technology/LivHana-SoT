## Known Limitations

1. **In-Memory Storage**: Tasks lost on restart
   - **Solution**: Add Redis adapter

2. **No Rate Limiting**: Could be abused
   - **Solution**: Add express-rate-limit

3. **Basic Validation**: Could use more robust validation
   - **Solution**: Add Joi/Zod schemas

4. **Single Instance**: No distributed task management
   - **Solution**: Use Redis for shared state

5. **No Metrics**: Limited observability
   - **Solution**: Add Prometheus metrics
