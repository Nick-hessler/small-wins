# 🚀 Small Wins Deployment Guide

This guide will walk you through deploying the Small Wins application to AWS using CDK.

## 📋 Prerequisites

### Required Tools
- [Node.js 18+](https://nodejs.org/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK](https://aws.amazon.com/cdk/) installed globally
- [jq](https://stedolan.github.io/jq/) for JSON parsing (macOS: `brew install jq`)

### AWS Account Setup
- AWS account with appropriate permissions
- IAM user with CDK deployment permissions
- Route 53 hosted zone (for custom domains)

## 🔧 Initial Setup

### 1. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd SmallWins
npm install
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and output format
```

### 3. Update Configuration Files
Edit the deployment configuration files in `infra/cdk/deploy-config/`:

**Development (`dev.json`):**
```json
{
  "env": "dev",
  "region": "us-east-1",
  "account": "your-dev-account-id",
  "domain": "dev.smallwins.com",
  "certificateArn": "arn:aws:acm:us-east-1:your-account-id:certificate/your-cert-id",
  "hostedZoneId": "your-hosted-zone-id"
}
```

**Staging (`staging.json`):**
```json
{
  "env": "staging",
  "region": "us-east-1",
  "account": "your-staging-account-id",
  "domain": "staging.smallwins.com",
  "certificateArn": "arn:aws:acm:us-east-1:your-account-id:certificate/your-cert-id",
  "hostedZoneId": "your-hosted-zone-id"
}
```

**Production (`prod.json`):**
```json
{
  "env": "prod",
  "region": "us-east-1",
  "account": "your-prod-account-id",
  "domain": "smallwins.com",
  "certificateArn": "arn:aws:acm:us-east-1:your-account-id:certificate/your-cert-id",
  "hostedZoneId": "your-hosted-zone-id"
}
```

### 4. Install CDK Globally
```bash
npm install -g aws-cdk
```

## 🚀 Deployment

### Option 1: Using the Deployment Script (Recommended)
```bash
# Deploy to development
cd infra/cdk
./deploy.sh dev

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh prod
```

### Option 2: Manual CDK Commands
```bash
cd infra/cdk

# Install dependencies
npm install

# Build the project
npm run build

# Bootstrap CDK (first time only)
cdk bootstrap aws://your-account-id/us-east-1

# Deploy
cdk deploy --context env=dev --context region=us-east-1 --context account=your-account-id
```

## 📊 Post-Deployment Setup

### 1. Get Stack Outputs
After successful deployment, note the stack outputs:
- User Pool ID
- User Pool Client ID
- Identity Pool ID
- GraphQL API URL
- S3 Bucket Names
- CloudFront Distribution URL

### 2. Update Frontend Environment Variables
Copy `apps/web/env.example` to `apps/web/.env.local` and update with your values:

```bash
cd apps/web
cp env.example .env.local
```

Edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_APPSYNC_URL=https://your-appsync-url.appsync-api.us-east-1.amazonaws.com/graphql
NEXT_PUBLIC_REGION=us-east-1
NEXT_PUBLIC_IDENTITY_POOL_ID=us-east-1:your-identity-pool-id
COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_PHOTOS_BUCKET=small-wins-photos-your-account-us-east-1
NEXT_PUBLIC_WEB_BUCKET=small-wins-web-your-account-us-east-1
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-cloudfront-distribution.cloudfront.net
```

### 3. Deploy Frontend
```bash
cd apps/web

# Build the application
npm run build

# Deploy to S3 (you'll need to set up S3 sync or use AWS CLI)
aws s3 sync .next s3://your-web-bucket-name --delete
aws s3 sync public s3://your-web-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id your-distribution-id --paths "/*"
```

## 🔐 Authentication Setup

### 1. Create Test Users
After deployment, create test users in the Cognito User Pool:

```bash
# Using AWS CLI
aws cognito-idp admin-create-user \
  --user-pool-id your-user-pool-id \
  --username testuser \
  --temporary-password TempPass123! \
  --user-attributes Name=email,Value=test@example.com

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id your-user-pool-id \
  --username testuser \
  --password NewPass123! \
  --permanent
```

### 2. Test Authentication Flow
1. Navigate to your deployed application
2. Click "Sign In" or "Sign Up"
3. Use your test credentials
4. Verify you can log in and access the app

## 📈 Monitoring and Observability

### 1. CloudWatch Dashboards
After deployment, you'll have access to:
- **System Dashboard**: AppSync, DynamoDB, and S3 metrics
- **Business Dashboard**: User engagement and business metrics

### 2. Set Up Alarms
The deployment automatically creates alarms for:
- High error rates (4XX/5XX)
- High latency
- DynamoDB throttling
- S3 errors

### 3. Enable X-Ray Tracing
X-Ray tracing is automatically enabled for AppSync and Lambda functions.

## 🧪 Testing

### 1. Run Local Tests
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:web
npm run test:infra
```

### 2. E2E Testing
```bash
cd apps/web
npm run test:e2e
```

### 3. Load Testing
Use tools like Artillery or k6 to test your API endpoints:
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Setup
The repository includes GitHub Actions workflows for automated deployment:

1. **Push to `develop` branch**: Automatically deploys to development
2. **Push to `main` branch**: Automatically deploys to staging and production
3. **Pull requests**: Run tests and security scans

### 2. Required Secrets
Set these secrets in your GitHub repository:
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `SLACK_WEBHOOK` (optional, for notifications)

## 🚨 Troubleshooting

### Common Issues

**CDK Bootstrap Error**
```bash
Error: CDK not bootstrapped
```
Solution: Run `cdk bootstrap aws://your-account-id/region`

**Permission Denied**
```bash
Error: Access Denied
```
Solution: Ensure your IAM user has the necessary permissions for CDK deployment

**Stack Rollback**
```bash
Error: Stack rollback
```
Solution: Check CloudFormation events for the specific error, fix the issue, and redeploy

**Environment Variables Missing**
```bash
Error: Cannot read property of undefined
```
Solution: Ensure all required environment variables are set in `.env.local`

### Debug Commands
```bash
# Check CDK status
cdk diff

# View stack details
cdk list

# Destroy stack (if needed)
cdk destroy

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name SmallWins-Dev
```

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AppSync Developer Guide](https://docs.aws.amazon.com/appsync/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [CloudWatch Monitoring](https://docs.aws.amazon.com/AmazonCloudWatch/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review CloudWatch logs and metrics
3. Check CloudFormation stack events
4. Review the application logs in CloudWatch

For additional help, please open an issue in the repository or contact the development team.
