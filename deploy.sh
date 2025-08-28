#!/bin/bash
echo "Starting deployment..."

# Go to project root (current directory)
cd "$(dirname "$0")"

# Reset any local changes and pull the latest code
git reset --hard
git pull origin main

# Install dependencies
npm install --production


# Restart the app with PM2
pm2 restart reetuurn-backend || pm2 start npm --name "reetuurn-backend" -- run start

echo "Deployment finished!"
