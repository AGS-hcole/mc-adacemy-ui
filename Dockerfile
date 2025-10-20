# Use the official Node.js image as the base image
FROM node:22.12.0 AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Run a clean install of the dependencies
RUN npm ci

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy all files
COPY . .

# Build the application
RUN npm run build --configuration=production

# Use the official Nginx image to serve the application
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular application from the previous stage
COPY --from=build /app/dist/mc-academy-ui/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
