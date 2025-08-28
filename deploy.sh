#!/bin/bash
# deploy.sh - Deployment script for Express backend

echo "Starting deployment..."

# Navigate to your app directory
cd reetuurn-backend || exit

# Pull latest code
echo "Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Restart app with PM2
echo "Restarting server..."
pm2 restart all

echo "Deployment finished!"
