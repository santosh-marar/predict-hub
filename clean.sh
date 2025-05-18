#!/bin/bash

echo "🧹 Cleaning node_modules, build caches, and migrations..."

# Remove node_modules and lockfiles
find . -type d -name "node_modules" -exec rm -rf {} +
find . -type f -name "package-lock.json" -delete
find . -type f -name "pnpm-lock.yaml" -delete
find . -type f -name "yarn.lock" -delete

# Remove build output
find . -type d -name ".next" -exec rm -rf {} +
find . -type d -name ".turbo" -exec rm -rf {} +
find . -type d -name ".cache" -exec rm -rf {} +
find . -type d -name "dist" -exec rm -rf {} +
find . -type d -name "build" -exec rm -rf {} +

# Remove Drizzle migrations/output
# find . -type d -name "drizzle" -exec rm -rf {} +
# find . -type d -name "migrations" -exec rm -rf {} +

echo "✅ Cleaned!"
