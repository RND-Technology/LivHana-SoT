FROM nginx:alpine

# Copy website files
COPY index.html /usr/share/nginx/html/
COPY videos/ /usr/share/nginx/html/videos/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
