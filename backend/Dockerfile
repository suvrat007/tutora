# --- STAGE 1: Dependency Installation (Builder Stage) ---
# Use a Node.js base image (20-alpine is lightweight)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definition files (package.json and lock file)
# It is assumed these files are in the same directory as the Dockerfile
# and the application source is in a subdirectory (e.g., 'backend/').
COPY package.json package-lock.json ./

# Install only production dependencies (dev dependencies are unnecessary in the final image)
RUN npm install --omit=dev

# --- STAGE 2: Production Image ---
# Use a fresh, clean, lightweight base image for the final production container
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the node_modules directory from the builder stage
# This step ensures the final image only contains runtime dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy the entire application code into the container.
# This includes index.js, the routes, and the utilities files.
# NOTE: If your .env file contains secrets, consider passing them as
# Docker secrets or environment variables instead of copying the file.
COPY . .

# Expose the port the app is listening on (port 8000, as defined in index.js)
EXPOSE 8000

# Set the default command to start the application
CMD ["node", "index.js"]