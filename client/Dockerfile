# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configuration files
COPY package.json package-lock.json ./

# Install dependencies using 'npm ci' for faster, more reliable builds in CI
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run the build script
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove the default Nginx content
RUN rm -rf ./*

# Copy the built assets from the 'build' stage
COPY --from=build /app/dist .

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]