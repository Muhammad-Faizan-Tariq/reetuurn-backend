#!/bin/bash

echo "🚀 Starting deployment..."

# Stop on first error
set -e  

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production


# Restart PM2 (or start if not already running)
echo "🔄 Restarting PM2..."
pm2 restart reetuurn-backend || pm2 start npm --name "reetuurn-backend" -- run start

echo "✅ Deployment completed successfully!"
