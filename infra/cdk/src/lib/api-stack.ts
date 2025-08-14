import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  stackName: string;
  userPool: any; // Cognito User Pool
  table: dynamodb.Table;
  photosBucket: s3.Bucket;
  webBucket: s3.Bucket;
}

export class ApiStack extends cdk.Stack {
  public readonly graphqlApi: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // AppSync GraphQL API
    this.graphqlApi = new appsync.GraphqlApi(this, 'SmallWinsAPI', {
      name: `${props.stackName}-API`,
      schema: appsync.SchemaFile.fromAsset('src/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool,
            defaultAction: appsync.UserPoolDefaultAction.ALLOW,
          },
        },
      },
      xrayEnabled: true,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR,
      },
    });

    // Lambda functions for resolvers
    const createWinFunction = new lambda.Function(this, 'CreateWinFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/create-win'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
        PHOTOS_BUCKET: props.photosBucket.bucketName,
      },
    });

    const getWinsTodayFunction = new lambda.Function(this, 'GetWinsTodayFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/get-wins-today'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const getFeedTodayFunction = new lambda.Function(this, 'GetFeedTodayFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/get-feed-today'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const getWeeklyLeaderboardFunction = new lambda.Function(this, 'GetWeeklyLeaderboardFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/get-weekly-leaderboard'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const getBadgesFunction = new lambda.Function(this, 'GetBadgesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/get-badges'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const signPhotoUploadFunction = new lambda.Function(this, 'SignPhotoUploadFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/sign-photo-upload'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        PHOTOS_BUCKET: props.photosBucket.bucketName,
      },
    });

    // Grant DynamoDB permissions to Lambda functions
    props.table.grantReadWriteData(createWinFunction);
    props.table.grantReadData(getWinsTodayFunction);
    props.table.grantReadData(getFeedTodayFunction);
    props.table.grantReadData(getWeeklyLeaderboardFunction);
    props.table.grantReadData(getBadgesFunction);

    // Grant S3 permissions to Lambda functions
    props.photosBucket.grantReadWrite(createWinFunction);
    props.photosBucket.grantReadWrite(signPhotoUploadFunction);

    // Data sources
    const createWinDataSource = this.graphqlApi.addLambdaDataSource('CreateWinDataSource', createWinFunction);
    const getWinsTodayDataSource = this.graphqlApi.addLambdaDataSource('GetWinsTodayDataSource', getWinsTodayFunction);
    const getFeedTodayDataSource = this.graphqlApi.addLambdaDataSource('GetFeedTodayDataSource', getFeedTodayFunction);
    const getWeeklyLeaderboardDataSource = this.graphqlApi.addLambdaDataSource('GetWeeklyLeaderboardDataSource', getWeeklyLeaderboardFunction);
    const getBadgesDataSource = this.graphqlApi.addLambdaDataSource('GetBadgesDataSource', getBadgesFunction);
    const signPhotoUploadDataSource = this.graphqlApi.addLambdaDataSource('SignPhotoUploadDataSource', signPhotoUploadFunction);

    // Resolvers
    createWinDataSource.createResolver('CreateWinResolver', {
      typeName: 'Mutation',
      fieldName: 'createWin',
    });

    getWinsTodayDataSource.createResolver('GetWinsTodayResolver', {
      typeName: 'Query',
      fieldName: 'winsToday',
    });

    getFeedTodayDataSource.createResolver('GetFeedTodayResolver', {
      typeName: 'Query',
      fieldName: 'feedToday',
    });

    getWeeklyLeaderboardDataSource.createResolver('GetWeeklyLeaderboardResolver', {
      typeName: 'Query',
      fieldName: 'weeklyLeaderboard',
    });

    getBadgesDataSource.createResolver('GetBadgesResolver', {
      typeName: 'Query',
      fieldName: 'badges',
    });

    signPhotoUploadDataSource.createResolver('SignPhotoUploadResolver', {
      typeName: 'Mutation',
      fieldName: 'signPhotoUpload',
    });

    // Add DynamoDB data source for direct table access
    const tableDataSource = this.graphqlApi.addDynamoDbDataSource('TableDataSource', props.table);

    // Add S3 data source for photo operations
    // Note: HTTP data source configuration may need adjustment for newer CDK versions
    // const s3DataSource = this.graphqlApi.addHttpDataSource('S3DataSource', 'https://s3.amazonaws.com');

    // Outputs
    new cdk.CfnOutput(this, 'GraphQLUrl', {
      value: this.graphqlApi.graphqlUrl,
      description: 'AppSync GraphQL API URL',
    });

    new cdk.CfnOutput(this, 'GraphQLId', {
      value: this.graphqlApi.apiId,
      description: 'AppSync GraphQL API ID',
    });

    new cdk.CfnOutput(this, 'GraphQLArn', {
      value: this.graphqlApi.arn,
      description: 'AppSync GraphQL API ARN',
    });
  }
}
