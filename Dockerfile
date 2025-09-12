FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build arguments for Vite
ARG VITE_API_URL=http://localhost:3001
ARG VITE_APP_TITLE=BotTrapper Dashboard
ARG VITE_BOT_CLIENT_ID

# Set environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_BOT_CLIENT_ID=$VITE_BOT_CLIENT_ID

# Build the application for production
RUN npm run build

# Expose port for Vite preview server
EXPOSE 4173

# Use Vite's built-in preview server (serves the built files)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
