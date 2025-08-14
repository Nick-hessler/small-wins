import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  stackName: string;
}

export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // DynamoDB Table - Single Table Design
    this.table = new dynamodb.Table(this, 'SmallWinsTable', {
      tableName: `${props.stackName}-Table`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: 'TTL',
      
      // Global Secondary Indexes - commented out for now due to CDK version compatibility
      // globalSecondaryIndexes: [
      //   // GSI1: Feed by date (for today's feed and weekly scans)
      //   {
      //     indexName: 'GSI1',
      //     partitionKey: {
      //       name: 'GSI1PK',
      //       type: dynamodb.AttributeType.STRING,
      //     },
      //     sortKey: {
      //       name: 'GSI1SK',
      //       type: dynamodb.AttributeType.STRING,
      //     },
      //     projectionType: dynamodb.ProjectionType.ALL,
      //   },
      //   // GSI2: User chronological (for user's win history)
      //   {
      //     indexName: 'GSI2',
      //     partitionKey: {
      //       name: 'GSI2PK',
      //       type: dynamodb.AttributeType.STRING,
      //     },
      //     sortKey: {
      //       name: 'GSI2SK',
      //       type: dynamodb.AttributeType.STRING,
      //     },
      //     projectionType: dynamodb.ProjectionType.ALL,
      //   },
      //   // GSI3: Leaderboard (for weekly scoring)
      //   {
      //     indexName: 'GSI3',
      //     partitionKey: {
      //       name: 'GSI3PK',
      //       type: dynamodb.AttributeType.STRING,
      //     },
      //     sortKey: {
      //       name: 'GSI3SK',
      //       type: dynamodb.AttributeType.NUMBER,
      //     },
      //     projectionType: dynamodb.ProjectionType.ALL,
      //   },
      // ],
    });

    // Add tags
    cdk.Tags.of(this.table).add('Purpose', 'SmallWinsData');
    cdk.Tags.of(this.table).add('TableType', 'SingleTable');

    // IAM Role for Lambda functions to access DynamoDB
    const lambdaRole = new iam.Role(this, 'LambdaDynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant read/write access to the table
    this.table.grantReadWriteData(lambdaRole);

    // Add specific permissions for AppSync
    const appsyncRole = new iam.Role(this, 'AppSyncDynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
    });

    this.table.grantReadWriteData(appsyncRole);

    // Outputs
    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.table.tableArn,
      description: 'DynamoDB Table ARN',
    });

    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: lambdaRole.roleArn,
      description: 'Lambda DynamoDB Role ARN',
    });

    new cdk.CfnOutput(this, 'AppSyncRoleArn', {
      value: appsyncRole.roleArn,
      description: 'AppSync DynamoDB Role ARN',
    });
  }
}
