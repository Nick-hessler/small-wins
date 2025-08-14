#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { SimpleStack } = require('./lib/simple-stack');

const app = new cdk.App();

// Environment configuration
const env = app.node.tryGetContext('env') || 'dev';
const region = app.node.tryGetContext('region') || 'us-east-1';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;

if (!account) {
  throw new Error('Account ID must be provided via context or CDK_DEFAULT_ACCOUNT env var');
}

const stackName = `SmallWins-${env.charAt(0).toUpperCase() + env.slice(1)}`;

new SimpleStack(app, stackName, {
  env: {
    account,
    region,
  },
  description: `Small Wins infrastructure for ${env} environment`,
  tags: {
    Environment: env,
    Project: 'SmallWins',
    ManagedBy: 'CDK',
  },
});

// Add tags to all stacks
cdk.Tags.of(app).add('Project', 'SmallWins');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
