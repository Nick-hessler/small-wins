import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  stackName: string;
  api: appsync.GraphqlApi;
  table: dynamodb.Table;
  photosBucket: s3.Bucket;
}

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alarms
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `${props.stackName}-Alarms`,
      displayName: 'Small Wins Alarms',
    });

    // Add email subscription (placeholder - replace with actual email)
    // alarmTopic.addSubscription(new subscriptions.EmailSubscription('alerts@smallwins.com'));

    // AppSync Metrics and Alarms
    const api4xxErrors = new cloudwatch.Metric({
      namespace: 'AWS/AppSync',
      metricName: '4XXError',
      dimensionsMap: {
        GraphQLAPIId: props.api.apiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const api5xxErrors = new cloudwatch.Metric({
      namespace: 'AWS/AppSync',
      metricName: '5XXError',
      dimensionsMap: {
        GraphQLAPIId: props.api.apiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const apiLatency = new cloudwatch.Metric({
      namespace: 'AWS/AppSync',
      metricName: 'Latency',
      dimensionsMap: {
        GraphQLAPIId: props.api.apiId,
      },
      statistic: 'p95',
      period: cdk.Duration.minutes(5),
    });

    // AppSync Alarms
    new cloudwatch.Alarm(this, 'AppSync4XXAlarm', {
      metric: api4xxErrors,
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'AppSync 4XX errors are high',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'AppSync5XXAlarm', {
      metric: api5xxErrors,
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'AppSync 5XX errors detected',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'AppSyncLatencyAlarm', {
      metric: apiLatency,
      threshold: 1000, // 1 second
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'AppSync latency is high',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // DynamoDB Metrics and Alarms
    const ddbThrottledRequests = new cloudwatch.Metric({
      namespace: 'AWS/DynamoDB',
      metricName: 'ThrottledRequests',
      dimensionsMap: {
        TableName: props.table.tableName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const ddbConsumedReadCapacity = new cloudwatch.Metric({
      namespace: 'AWS/DynamoDB',
      metricName: 'ConsumedReadCapacityUnits',
      dimensionsMap: {
        TableName: props.table.tableName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const ddbConsumedWriteCapacity = new cloudwatch.Metric({
      namespace: 'AWS/DynamoDB',
      metricName: 'ConsumedWriteCapacityUnits',
      dimensionsMap: {
        TableName: props.table.tableName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // DynamoDB Alarms
    new cloudwatch.Alarm(this, 'DynamoDBThrottlingAlarm', {
      metric: ddbThrottledRequests,
      threshold: 5,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'DynamoDB throttling detected',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // S3 Metrics and Alarms
    const s3Errors = new cloudwatch.Metric({
      namespace: 'AWS/S3',
      metricName: '5xxError',
      dimensionsMap: {
        BucketName: props.photosBucket.bucketName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // S3 Alarms
    new cloudwatch.Alarm(this, 'S3ErrorsAlarm', {
      metric: s3Errors,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'S3 5XX errors detected',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'SmallWinsDashboard', {
      dashboardName: `${props.stackName}-Dashboard`,
    });

    // Add widgets to dashboard
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'AppSync Performance',
        left: [apiLatency],
        right: [api4xxErrors, api5xxErrors],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Performance',
        left: [ddbConsumedReadCapacity, ddbConsumedWriteCapacity],
        right: [ddbThrottledRequests],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'S3 Performance',
        left: [s3Errors],
        width: 12,
        height: 6,
      })
    );

    // Custom Metrics for Business KPIs
    const winsCreatedMetric = new cloudwatch.Metric({
      namespace: 'SmallWins',
      metricName: 'WinsCreated',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const activeUsersMetric = new cloudwatch.Metric({
      namespace: 'SmallWins',
      metricName: 'ActiveUsers',
      statistic: 'Maximum',
      period: cdk.Duration.minutes(5),
    });

    const streakMaintainedMetric = new cloudwatch.Metric({
      namespace: 'SmallWins',
      metricName: 'StreakMaintained',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // Business Metrics Dashboard
    const businessDashboard = new cloudwatch.Dashboard(this, 'SmallWinsBusinessDashboard', {
      dashboardName: `${props.stackName}-Business-Dashboard`,
    });

    businessDashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Business Metrics',
        left: [winsCreatedMetric, activeUsersMetric, streakMaintainedMetric],
        width: 12,
        height: 6,
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS Topic ARN for alarms',
    });

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${props.stackName}-Dashboard`,
      description: 'CloudWatch Dashboard URL',
    });

    new cdk.CfnOutput(this, 'BusinessDashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${props.stackName}-Business-Dashboard`,
      description: 'Business Metrics Dashboard URL',
    });
  }
}
