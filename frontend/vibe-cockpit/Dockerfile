# Dockerfile for vibe-cockpit static deployment
FROM nginx:alpine

# Copy static files to nginx html directory
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
