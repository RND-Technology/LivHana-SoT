# Use nginx alpine for minimal size
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static site
COPY public /usr/share/nginx/html

# Create health check directory
RUN mkdir -p /usr/share/nginx/html/health

# Expose port 8080 (Cloud Run standard)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
