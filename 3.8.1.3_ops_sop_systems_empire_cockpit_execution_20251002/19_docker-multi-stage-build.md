### Docker Multi-Stage Build

**Stage 1 (deps)**: Install production dependencies only
**Stage 2 (builder)**: Build Next.js app + generate Prisma client
**Stage 3 (runner)**: Minimal runtime image with non-root user

**Optimizations**:

- Image size: ~150MB (vs 1GB+ unoptimized)
- Security: Non-root user (nodejs:nextjs)
- Performance: Standalone output + static optimization
