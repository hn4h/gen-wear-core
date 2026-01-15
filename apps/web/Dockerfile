FROM node:18-alpine

WORKDIR /app

# Enable automatic corepack for pnpm/yarn if needed (optional)
# RUN corepack enable

# Copy root package.json and lockfile (if exists)
COPY package.json turbo.json* ./

# Copy packages content
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/ai-worker/package.json ./packages/ai-worker/package.json

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Default command for dev
CMD ["npm", "run", "dev", "--workspace=apps/web"]
