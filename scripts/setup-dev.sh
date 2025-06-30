#!/bin/bash

echo "🌱 Setting up The Plant Store development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install dev dependencies
echo "🔧 Installing development dependencies..."
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @playwright/test msw

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run linting
echo "🔍 Running linting checks..."
npm run lint

# Run type checking
echo "📝 Running TypeScript checks..."
npm run type-check

# Run tests (if they exist)
echo "🧪 Running tests..."
npm run test

echo "✅ Setup complete! You can now start development with:"
echo "   npm run dev"
echo ""
echo "📋 Next steps:"
echo "   1. Review the DEVELOPMENT_PLAN.md file"
echo "   2. Fix any linting errors that appeared"
echo "   3. Add your first test cases"
echo "   4. Set up your environment variables" 