import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CognitoStack } from './cognito-stack';
import { DatabaseStack } from './database-stack';
import { StorageStack } from './storage-stack';
import { ApiStack } from './api-stack';
import { FrontendStack } from './frontend-stack';
import { MonitoringStack } from './monitoring-stack';

export interface SmallWinsStackProps extends cdk.StackProps {
  // Add any custom props here
}

export class SmallWinsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: SmallWinsStackProps) {
    super(scope, id, props);

    // Get environment from stack name
    const env = id.includes('Dev') ? 'dev' : id.includes('Staging') ? 'staging' : 'prod';
    
    // Cognito User Pool and Identity Pool
    const cognito = new CognitoStack(this, 'Cognito', {
      env: props?.env,
      stackName: `${id}-Cognito`,
    });

    // DynamoDB Database
    const database = new DatabaseStack(this, 'Database', {
      env: props?.env,
      stackName: `${id}-Database`,
    });

    // S3 Storage for photos and web assets
    const storage = new StorageStack(this, 'Storage', {
      env: props?.env,
      stackName: `${id}-Storage`,
      userPoolId: cognito.userPool.userPoolId,
    });

    // AppSync GraphQL API
    const api = new ApiStack(this, 'API', {
      env: props?.env,
      stackName: `${id}-API`,
      userPool: cognito.userPool,
      table: database.table,
      photosBucket: storage.photosBucket,
      webBucket: storage.webBucket,
    });

    // Frontend hosting
    const frontend = new FrontendStack(this, 'Frontend', {
      env: props?.env,
      stackName: `${id}-Frontend`,
      webBucket: storage.webBucket,
      userPoolId: cognito.userPool.userPoolId,
      clientId: cognito.userPoolClient.userPoolClientId,
      identityPoolId: cognito.identityPool.ref,
      appsyncUrl: api.graphqlApi.graphqlUrl,
      region: this.region,
    });

    // Monitoring and observability
    const monitoring = new MonitoringStack(this, 'Monitoring', {
      env: props?.env,
      stackName: `${id}-Monitoring`,
      api: api.graphqlApi,
      table: database.table,
      photosBucket: storage.photosBucket,
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: cognito.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${id}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: cognito.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${id}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: cognito.identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `${id}-IdentityPoolId`,
    });

    new cdk.CfnOutput(this, 'GraphQLUrl', {
      value: api.graphqlApi.graphqlUrl,
      description: 'AppSync GraphQL API URL',
      exportName: `${id}-GraphQLUrl`,
    });

    new cdk.CfnOutput(this, 'PhotosBucketName', {
      value: storage.photosBucket.bucketName,
      description: 'S3 Photos Bucket Name',
      exportName: `${id}-PhotosBucketName`,
    });

    new cdk.CfnOutput(this, 'WebBucketName', {
      value: storage.webBucket.bucketName,
      description: 'S3 Web Bucket Name',
      exportName: `${id}-WebBucketName`,
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: frontend.distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
      exportName: `${id}-CloudFrontUrl`,
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: database.table.tableName,
      description: 'DynamoDB Table Name',
      exportName: `${id}-TableName`,
    });
  }
}
