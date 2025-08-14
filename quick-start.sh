#!/bin/bash

# Small Wins Quick Start Script
# This script will set up the entire project for development

set -e

echo "🎯 Welcome to Small Wins!"
echo "This script will set up your development environment."
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version too old. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ npm $(npm --version) found"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI not found. You'll need this for deployment."
    echo "   Install from: https://aws.amazon.com/cli/"
else
    echo "✅ AWS CLI found"
fi

# Check CDK
if ! command -v cdk &> /dev/null; then
    echo "⚠️  AWS CDK not found. Installing globally..."
    npm install -g aws-cdk
    echo "✅ AWS CDK installed"
else
    echo "✅ AWS CDK found"
fi

echo ""
echo "🚀 Setting up Small Wins project..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install web app dependencies
echo "📱 Installing web app dependencies..."
cd apps/web
npm install
cd ../..

# Install CDK dependencies
echo "🏗️  Installing CDK dependencies..."
cd infra/cdk
npm install
cd ../..

# Install Lambda function dependencies
echo "⚡ Installing Lambda function dependencies..."
cd services/functions
npm install
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1. 🚀 Start development:"
echo "   npm run dev"
echo ""
echo "2. 🏗️  Deploy infrastructure (when ready):"
echo "   cd infra/cdk"
echo "   ./deploy.sh dev"
echo ""
echo "3. 📚 Read the documentation:"
echo "   - README.md - Project overview"
echo "   - DEPLOYMENT.md - Deployment guide"
echo ""
echo "4. 🔧 Configure environment:"
echo "   - Copy apps/web/env.example to apps/web/.env.local"
echo "   - Update with your AWS configuration"
echo ""
echo "5. 🧪 Run tests:"
echo "   npm run test"
echo ""
echo "🎉 Happy coding! Your Small Wins app is ready for development."
