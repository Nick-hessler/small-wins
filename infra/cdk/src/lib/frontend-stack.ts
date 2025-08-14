import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface FrontendStackProps extends cdk.StackProps {
  stackName: string;
  webBucket: s3.Bucket;
  userPoolId: string;
  clientId: string;
  identityPoolId: string;
  appsyncUrl: string;
  region: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // CloudFront distribution for web assets
    this.distribution = new cloudfront.Distribution(this, 'WebDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(props.webBucket, {
          originAccessIdentity: new cloudfront.OriginAccessIdentity(this, 'WebOAI', {
            comment: 'OAI for Small Wins web assets',
          }),
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultRootObject: 'index.html',
      enableLogging: true,
      logBucket: new s3.Bucket(this, 'WebLogBucket', {
        bucketName: `small-wins-web-logs-${this.account}-${this.region}`,
        encryption: s3.BucketEncryption.S3_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        lifecycleRules: [
          {
            id: 'LogLifecycle',
            enabled: true,
            expiration: cdk.Duration.days(90),
            transitions: [
              {
                storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                transitionAfter: cdk.Duration.days(30),
              },
            ],
          },
        ],
      }),
      logFilePrefix: 'web-access-logs/',
    });

    // Grant read access to CloudFront
    props.webBucket.grantRead(new cloudfront.OriginAccessIdentity(this, 'WebOAIRead', {
      comment: 'OAI for Small Wins web assets read access',
    }));

    // Deploy environment configuration
    const envConfig = {
      NEXT_PUBLIC_APPSYNC_URL: props.appsyncUrl,
      NEXT_PUBLIC_REGION: props.region,
      NEXT_PUBLIC_IDENTITY_POOL_ID: props.identityPoolId,
      COGNITO_USER_POOL_ID: props.userPoolId,
      COGNITO_CLIENT_ID: props.clientId,
    };

    // Create environment.js file for frontend
    const envFile = new s3deploy.BucketDeployment(this, 'EnvConfigDeployment', {
      sources: [
        s3deploy.Source.data('env.js', `window.ENV = ${JSON.stringify(envConfig, null, 2)};`),
      ],
      destinationBucket: props.webBucket,
      destinationKeyPrefix: 'config',
    });

    // Outputs
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'EnvConfigUrl', {
      value: `${this.distribution.distributionDomainName}/config/env.js`,
      description: 'Environment Configuration URL',
    });
  }
}
