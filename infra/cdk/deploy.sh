#!/bin/bash

# Small Wins CDK Deployment Script
# Usage: ./deploy.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}
CONFIG_FILE="deploy-config/${ENVIRONMENT}.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file $CONFIG_FILE not found"
    exit 1
fi

echo "🚀 Deploying Small Wins to $ENVIRONMENT environment..."

# Load configuration
ENV=$(jq -r '.env' "$CONFIG_FILE")
REGION=$(jq -r '.region' "$CONFIG_FILE")
ACCOUNT=$(jq -r '.account' "$CONFIG_FILE")

echo "Environment: $ENV"
echo "Region: $REGION"
echo "Account: $ACCOUNT"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "Error: AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "Installing AWS CDK..."
    npm install -g aws-cdk
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Bootstrap CDK if needed
echo "🔧 Checking CDK bootstrap..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region "$REGION" > /dev/null 2>&1; then
    echo "Bootstrapping CDK in $REGION..."
    cdk bootstrap aws://$ACCOUNT/$REGION
fi

# Deploy the stack
echo "🚀 Deploying stack..."
cdk deploy --context env="$ENV" --context region="$REGION" --context account="$ACCOUNT" --require-approval never

echo "✅ Deployment complete!"
echo ""
echo "📊 Stack outputs:"
cdk list

echo ""
echo "🌐 Next steps:"
echo "1. Update your environment variables with the stack outputs"
echo "2. Deploy the frontend to S3"
echo "3. Test the application"
echo ""
echo "For more information, see the README.md file."
