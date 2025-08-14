# Small Wins 🎯

> The game of your day—log tiny victories, keep a streak, and compete with friends weekly.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build everything
npm run build

# Run tests
npm run test

# Deploy to dev environment
npm run deploy:dev
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Auth**: Amazon Cognito (hosted UI), OAuth (Apple/Google)
- **API**: AWS AppSync (GraphQL)
- **Database**: DynamoDB (single-table design)
- **Storage**: S3 (SSE-KMS), presigned POST for uploads
- **CDN**: CloudFront (OAC), security headers via Function@Edge
- **Infrastructure**: AWS CDK (TypeScript)

### Performance Targets
- **Time to First Win**: < 30 seconds
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Core Features
- ✅ 3 wins/day cap (resets at midnight)
- ✅ Real-time friend feed
- ✅ Weekly leaderboards (reset Monday)
- ✅ Streak tracking
- ✅ Emoji reactions (👏 😂 🔥 🤯)
- ✅ Photo uploads
- ✅ Categories: petty, cozy, social, outdoors, work, random
- ✅ Badge system
- ✅ Shareable weekly recaps

## 📁 Project Structure

```
SmallWins/
├── apps/web/                 # Next.js frontend
├── infra/cdk/               # AWS CDK infrastructure
├── services/functions/      # Lambda functions
├── package.json            # Root monorepo config
└── README.md              # This file
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- AWS CLI configured
- AWS CDK installed globally: `npm install -g aws-cdk`

### Environment Variables

Copy `.env.example` to `.env.local` in each app directory:

```bash
# apps/web/.env.local
NEXT_PUBLIC_APPSYNC_URL=your_appsync_url
NEXT_PUBLIC_REGION=us-east-1
NEXT_PUBLIC_IDENTITY_POOL_ID=your_identity_pool_id
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
```

### Database Schema

Single-table DynamoDB design with these access patterns:

- **User Profile**: `PK=USER#<userId>`, `SK=PROFILE`
- **Daily Wins**: `PK=USER#<userId>#DAY#<YYYY-MM-DD>`, `SK=WIN#<ISO8601>`
- **Feed by Date**: `GSI1PK=DAY#<YYYY-MM-DD>`, `GSI1SK=CREATED#<ISO>`
- **User Chronological**: `GSI2PK=USER#<userId>`, `GSI2SK=CREATED#<ISO>`

## 🚀 Deployment

### Environments
- **dev**: Development environment
- **staging**: Pre-production testing
- **prod**: Production environment

### Deploy Commands
```bash
# Deploy infrastructure
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod

# Deploy frontend only
cd apps/web && npm run build && npm run deploy
```

## 🧪 Testing

```bash
# Unit tests
npm run test:web

# E2E tests
cd apps/web && npm run test:e2e

# Type checking
npm run typecheck
```

## 📊 Monitoring

- **CloudWatch**: System metrics, logs, alarms
- **X-Ray**: Distributed tracing
- **Amazon Pinpoint**: User analytics and events
- **Custom Dashboards**: Product metrics (wins, streaks, engagement)

## 🔒 Security

- **Authentication**: Cognito JWT tokens
- **Authorization**: User-scoped data access
- **Encryption**: SSE-KMS for S3, DDB encrypted at rest
- **Network**: WAF rules, CSP headers, HSTS
- **Rate Limiting**: Per-user and per-IP limits

## 📈 Analytics

Track key product metrics:
- Wins created per day
- Streak maintenance
- Reaction engagement
- Time to first win
- Share card downloads

## 🚨 Runbook

### Common Issues

**High Error Rates**
1. Check CloudWatch metrics for 5XX errors
2. Review X-Ray traces for slow resolvers
3. Check DynamoDB throttling

**Performance Issues**
1. Verify CloudFront cache hit rates
2. Check bundle sizes in Next.js build
3. Review AppSync resolver performance

**Rollback Procedure**
```bash
cd infra/cdk
npm run rollback:prod
```

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Ensure all checks pass: `npm run test && npm run build`
4. Submit PR for review

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for celebrating life's small victories
