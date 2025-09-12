FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Expose port for Vite preview server
EXPOSE 4173

# Use Vite's built-in preview server (serves the built files)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
