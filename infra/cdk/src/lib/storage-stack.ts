import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface StorageStackProps extends cdk.StackProps {
  stackName: string;
  userPoolId: string;
}

export class StorageStack extends cdk.Stack {
  public readonly photosBucket: s3.Bucket;
  public readonly webBucket: s3.Bucket;
  public readonly kmsKey: kms.Key;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    // KMS key for S3 encryption
    this.kmsKey = new kms.Key(this, 'StorageKMSKey', {
      description: 'KMS key for Small Wins S3 storage encryption',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Photos bucket for user uploads
    this.photosBucket = new s3.Bucket(this, 'PhotosBucket', {
      bucketName: `small-wins-photos-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          id: 'PhotoLifecycle',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'], // Will be restricted by CloudFront
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
    });

    // Web assets bucket for frontend hosting
    this.webBucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: `small-wins-web-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA fallback
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'], // Will be restricted by CloudFront
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront distribution for web assets
    const webDistribution = new cloudfront.Distribution(this, 'WebDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.webBucket, {
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

    // CloudFront distribution for photos
    const photosDistribution = new cloudfront.Distribution(this, 'PhotosDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.photosBucket, {
          originAccessIdentity: new cloudfront.OriginAccessIdentity(this, 'PhotosOAI', {
            comment: 'OAI for Small Wins photos',
          }),
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,

      },
      enableLogging: true,
      logBucket: new s3.Bucket(this, 'PhotosLogBucket', {
        bucketName: `small-wins-photos-logs-${this.account}-${this.region}`,
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
      logFilePrefix: 'photos-access-logs/',
    });

    // Grant read access to CloudFront
    this.webBucket.grantRead(new cloudfront.OriginAccessIdentity(this, 'WebOAIRead', {
      comment: 'OAI for Small Wins web assets read access',
    }));

    this.photosBucket.grantRead(new cloudfront.OriginAccessIdentity(this, 'PhotosOAIRead', {
      comment: 'OAI for Small Wins photos read access',
    }));

    // IAM role for Lambda functions to access S3
    const lambdaS3Role = new iam.Role(this, 'LambdaS3Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant S3 permissions to Lambda
    this.photosBucket.grantReadWrite(lambdaS3Role);
    this.webBucket.grantReadWrite(lambdaS3Role);

    // Outputs
    new cdk.CfnOutput(this, 'PhotosBucketName', {
      value: this.photosBucket.bucketName,
      description: 'S3 Photos Bucket Name',
    });

    new cdk.CfnOutput(this, 'WebBucketName', {
      value: this.webBucket.bucketName,
      description: 'S3 Web Bucket Name',
    });

    new cdk.CfnOutput(this, 'PhotosDistributionId', {
      value: photosDistribution.distributionId,
      description: 'CloudFront Photos Distribution ID',
    });

    new cdk.CfnOutput(this, 'WebDistributionId', {
      value: webDistribution.distributionId,
      description: 'CloudFront Web Distribution ID',
    });

    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: 'KMS Key ID for S3 encryption',
    });

    new cdk.CfnOutput(this, 'LambdaS3RoleArn', {
      value: lambdaS3Role.roleArn,
      description: 'Lambda S3 Role ARN',
    });
  }
}
