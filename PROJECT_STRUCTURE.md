# 📁 Small Wins Project Structure

This document provides a comprehensive overview of the Small Wins monorepo structure and architecture.

## 🏗️ Overall Architecture

```
SmallWins/
├── 📱 Frontend (Next.js 14)
├── 🏗️ Infrastructure (AWS CDK)
├── ⚡ Backend Services (Lambda)
├── 🔧 Configuration & Scripts
└── 📚 Documentation
```

## 📁 Root Directory

```
SmallWins/
├── package.json                 # Root monorepo configuration
├── README.md                   # Project overview and quick start
├── DEPLOYMENT.md              # Comprehensive deployment guide
├── PROJECT_STRUCTURE.md       # This file
├── quick-start.sh             # Automated setup script
├── .github/                   # GitHub Actions workflows
├── apps/                      # Application code
├── infra/                     # Infrastructure as Code
└── services/                  # Backend services
```

## 📱 Frontend Application (`apps/web/`)

### Core Structure
```
apps/web/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes (legacy, will be replaced by AppSync)
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── feed/             # Wins feed
│   │   ├── leaderboard/      # Weekly leaderboard
│   │   ├── profile/          # User profile
│   │   ├── share/            # Shareable win pages
│   │   ├── og/               # Open Graph image generation
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI primitives
│   │   ├── auth/             # Authentication components
│   │   ├── wins/             # Win-related components
│   │   ├── feed/             # Feed components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── graphql.ts        # GraphQL client
│   │   ├── storage.ts        # S3 storage utilities
│   │   └── utils.ts          # General utilities
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Component-specific styles
├── public/                    # Static assets
├── prisma/                    # Database schema (legacy, will be replaced by DynamoDB)
├── package.json               # Frontend dependencies
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── .env.example               # Environment variables template
```

### Key Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** components
- **Responsive design** (mobile-first)
- **PWA support** with service worker
- **SEO optimization** with dynamic OG images

## 🏗️ Infrastructure (`infra/cdk/`)

### Core Structure
```
infra/cdk/
├── src/
│   ├── lib/                   # CDK constructs
│   │   ├── small-wins-stack.ts    # Main stack orchestrator
│   │   ├── cognito-stack.ts       # Authentication stack
│   │   ├── database-stack.ts      # DynamoDB stack
│   │   ├── storage-stack.ts       # S3 & CloudFront stack
│   │   ├── api-stack.ts           # AppSync GraphQL API stack
│   │   ├── frontend-stack.ts      # Frontend hosting stack
│   │   └── monitoring-stack.ts    # CloudWatch & monitoring stack
│   ├── lambda/                # Lambda function code
│   │   ├── create-win/        # Create win function
│   │   ├── get-feed-today/    # Get feed function
│   │   ├── get-weekly-leaderboard/ # Leaderboard function
│   │   ├── get-badges/        # Badges function
│   │   ├── sign-photo-upload/ # Photo upload function
│   │   └── get-wins-today/    # Get today's wins function
│   ├── schema.graphql         # GraphQL schema
│   └── index.ts               # CDK entry point
├── deploy-config/             # Environment-specific configurations
│   ├── dev.json               # Development environment
│   ├── staging.json           # Staging environment
│   └── prod.json              # Production environment
├── package.json               # CDK dependencies
├── cdk.json                   # CDK configuration
├── tsconfig.json              # TypeScript configuration
└── deploy.sh                  # Deployment script
```

### Infrastructure Components

#### 1. **Cognito Stack** (`cognito-stack.ts`)
- User Pool with custom attributes
- User Pool Client with OAuth flows
- Identity Pool for AWS service access
- IAM roles and policies

#### 2. **Database Stack** (`database-stack.ts`)
- DynamoDB single-table design
- Global Secondary Indexes (GSI1, GSI2, GSI3)
- IAM roles for Lambda and AppSync access
- Point-in-time recovery and encryption

#### 3. **Storage Stack** (`storage-stack.ts`)
- S3 buckets for photos and web assets
- KMS encryption keys
- CloudFront distributions
- Origin Access Identities (OAI)

#### 4. **API Stack** (`api-stack.ts`)
- AppSync GraphQL API
- Lambda resolvers for business logic
- DynamoDB and S3 data sources
- X-Ray tracing and logging

#### 5. **Frontend Stack** (`frontend-stack.ts`)
- S3 hosting with CloudFront
- Custom domain support
- SSL/TLS certificates
- Environment configuration injection

#### 6. **Monitoring Stack** (`monitoring-stack.ts`)
- CloudWatch dashboards
- Custom metrics and alarms
- SNS notifications
- X-Ray tracing

### Database Schema (Single-Table Design)

#### Primary Key Patterns
```
PK (Partition Key)           SK (Sort Key)
USER#<userId>#DAY#<date>    WIN#<timestamp>
USER#<userId>                PROFILE
LEADERBOARD#<weekStart>      SUMMARY
```

#### Global Secondary Indexes
```
GSI1: Feed by Date
- GSI1PK: DAY#<YYYY-MM-DD>
- GSI1SK: CREATED#<ISO8601>

GSI2: User Chronological
- GSI2PK: USER#<userId>
- GSI2SK: CREATED#<ISO8601>

GSI3: Weekly Leaderboard
- GSI3PK: WEEK#<YYYY-MM-DD>
- GSI3SK: <points> (number)
```

## ⚡ Backend Services (`services/functions/`)

### Lambda Functions
```
services/functions/
├── create-win/               # Create new win with 3/day cap
├── get-feed-today/           # Get today's feed with pagination
├── get-weekly-leaderboard/   # Calculate weekly leaderboard
├── get-badges/               # Calculate user badges
├── sign-photo-upload/        # Generate S3 presigned URLs
└── get-wins-today/           # Get user's wins for today
```

### Function Characteristics
- **Runtime**: Node.js 18.x
- **Memory**: 512MB (configurable)
- **Timeout**: 30 seconds
- **Environment Variables**: Table names, bucket names
- **IAM Permissions**: Least privilege access

## 🔧 Configuration & Scripts

### Environment Configuration
```
apps/web/env.example          # Frontend environment template
infra/cdk/deploy-config/      # Environment-specific configs
```

### Deployment Scripts
```
quick-start.sh                # Complete project setup
infra/cdk/deploy.sh          # CDK deployment
```

### CI/CD Pipeline
```
.github/workflows/ci-cd.yml   # GitHub Actions workflow
```

## 📊 Data Flow

### 1. **User Authentication**
```
User → Cognito Hosted UI → JWT Token → AppSync Authorization
```

### 2. **Win Creation**
```
Frontend → AppSync → Lambda → DynamoDB → Real-time Updates
```

### 3. **Photo Upload**
```
Frontend → Lambda → S3 Presigned URL → Direct Upload → S3
```

### 4. **Feed Retrieval**
```
Frontend → AppSync → Lambda → DynamoDB GSI1 → User Profiles
```

### 5. **Leaderboard Calculation**
```
Frontend → AppSync → Lambda → DynamoDB GSI3 → Aggregation → Cache
```

## 🔒 Security Features

### Authentication & Authorization
- **Cognito JWT tokens** for API access
- **User-scoped data access** (users can only see their own data)
- **Identity Pool** for AWS service access
- **Custom attributes** for user metadata

### Data Protection
- **KMS encryption** for S3 objects
- **DynamoDB encryption** at rest
- **TLS 1.2+** for all communications
- **CORS policies** for API access

### Network Security
- **CloudFront WAF** rules
- **Origin Access Identities** for S3
- **Private subnets** for Lambda functions
- **Security groups** and NACLs

## 📈 Monitoring & Observability

### CloudWatch Metrics
- **System metrics**: API latency, error rates, throughput
- **Business metrics**: Wins created, active users, streaks
- **Custom dashboards** for different stakeholders

### Logging & Tracing
- **Structured logging** with Pino
- **X-Ray tracing** for distributed requests
- **CloudWatch Logs** for all services
- **Log retention** policies

### Alarms & Notifications
- **Error rate thresholds** (4XX, 5XX)
- **Latency thresholds** (p95 > 1s)
- **SNS notifications** for critical issues
- **Auto-scaling** based on metrics

## 🚀 Performance Optimizations

### Frontend
- **Code splitting** by route
- **Image optimization** with Next.js
- **Service worker** for offline support
- **Bundle analysis** and optimization

### Backend
- **DynamoDB on-demand** billing
- **CloudFront caching** for static assets
- **Lambda cold start** optimization
- **Connection pooling** for databases

### Infrastructure
- **Multi-region** deployment capability
- **Auto-scaling** based on demand
- **CDN optimization** for global users
- **Database indexing** for query performance

## 🧪 Testing Strategy

### Unit Tests
- **Lambda functions** with Jest
- **CDK constructs** with Vitest
- **Utility functions** with comprehensive coverage

### Integration Tests
- **API endpoints** with real DynamoDB
- **S3 operations** with test buckets
- **Authentication flows** with test users

### E2E Tests
- **User journeys** with Playwright
- **Critical paths** for win creation
- **Authentication flows** end-to-end

### Performance Tests
- **Load testing** with Artillery
- **Stress testing** for scalability
- **Monitoring** during tests

## 🔄 Development Workflow

### Local Development
1. **Start frontend**: `npm run dev`
2. **Test locally** with mock data
3. **Use local DynamoDB** for testing
4. **Hot reload** for rapid iteration

### Deployment Pipeline
1. **Push to develop** → Auto-deploy to dev
2. **Push to main** → Auto-deploy to staging/prod
3. **Manual approval** for production
4. **Rollback capability** if issues arise

### Environment Management
- **Development**: Local testing and development
- **Staging**: Pre-production testing
- **Production**: Live application

## 📚 Documentation

### User Documentation
- **README.md**: Quick start and overview
- **DEPLOYMENT.md**: Detailed deployment guide
- **PROJECT_STRUCTURE.md**: This file

### API Documentation
- **GraphQL schema**: Self-documenting
- **Postman collections**: For testing
- **OpenAPI specs**: For REST endpoints

### Developer Documentation
- **Code comments**: Inline documentation
- **Type definitions**: TypeScript interfaces
- **Architecture diagrams**: Visual representations

## 🎯 Next Steps

### Immediate Actions
1. **Run quick-start.sh** to set up the project
2. **Configure AWS credentials** for deployment
3. **Update environment variables** with your values
4. **Deploy to development** environment

### Future Enhancements
1. **Feature flags** for gradual rollouts
2. **A/B testing** framework
3. **Advanced analytics** with Pinpoint
4. **Multi-language support** (i18n)
5. **Mobile apps** (React Native)

---

This structure provides a solid foundation for a production-grade, scalable application that can grow with your needs while maintaining high performance, security, and maintainability standards.
