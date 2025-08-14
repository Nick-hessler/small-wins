import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface CognitoStackProps extends cdk.StackProps {
  stackName: string;
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    // User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${props.stackName}-UserPool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        handle: new cognito.StringAttribute({ mutable: true }),
        color: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // Custom email templates for better user experience
      email: cognito.UserPoolEmail.withCognito('noreply@smallwins.app'),
      userVerification: {
        emailSubject: '🎉 Welcome to Small Wins! Verify your email to get started',
        emailBody: this.getVerificationEmailTemplate(),
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    });

    // User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `${props.stackName}-Client`,
      generateSecret: false,
      authFlows: {
        adminUserPassword: false,
        custom: false,
        userPassword: false,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/auth/callback',
          'https://localhost:3000/auth/callback',
        ],
        logoutUrls: [
          'http://localhost:3000/auth/logout',
          'https://localhost:3000/auth/logout',
        ],
      },
      preventUserExistenceErrors: true,
    });

    // Identity Pool
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `${props.stackName}-IdentityPool`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
          serverSideTokenCheck: false,
        },
      ],
    });

    // IAM roles for authenticated users
    const authenticatedRole = new iam.Role(this, 'CognitoAuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    // IAM roles for unauthenticated users (if needed)
    const unauthenticatedRole = new iam.Role(this, 'CognitoUnauthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    // Attach roles to identity pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
        unauthenticated: unauthenticatedRole.roleArn,
      },
    });

    // Add basic policies to authenticated role
    authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'mobileanalytics:PutEvents',
          'cognito-sync:*',
        ],
        resources: ['*'],
      })
    );

    // Add S3 read access for photos
    authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
        ],
        resources: [
          `arn:aws:s3:::small-wins-photos-${this.account}-${this.region}/*`,
        ],
        conditions: {
          StringEquals: {
            'cognito-identity.amazonaws.com:sub': '${cognito-identity.amazonaws.com:sub}',
          },
        },
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
    });
  }

  private getVerificationEmailTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verify Your Email Address</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #0b1026;
            background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(124, 58, 237, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
          }
          .header h1 {
            color: #0b1026;
            margin-bottom: 12px;
            font-size: 24px;
            font-weight: 700;
          }
          .header p {
            color: #64748b;
            margin-bottom: 24px;
            font-size: 16px;
          }
          .code-container {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            margin: 24px 0;
            border: 2px solid rgba(124, 58, 237, 0.2);
          }
          .verification-code {
            font-size: 32px;
            font-weight: 800;
            color: #7C3AED;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
          }
          .info {
            background: rgba(124, 58, 237, 0.05);
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
            border-left: 4px solid #7C3AED;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
            padding-top: 24px;
          }
          .cta {
            display: inline-block;
            background: linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            margin: 24px 0;
            box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎯 Small Wins</div>
            <h1>Welcome to Small Wins! 🎉</h1>
            <p>You're just one step away from turning ordinary moments into momentum.</p>
          </div>
          
          <p style="font-size: 18px; color: #334155; margin-bottom: 16px;">Your verification code is:</p>
          
          <div class="code-container">
            <div class="verification-code">{####}</div>
          </div>
          
          <div class="info">
            <p style="margin: 0; color: #475569;"><strong>💡 Pro tip:</strong> This code will expire in 24 hours. Once verified, you can start logging your wins and building streaks!</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">If you didn't request this verification, you can safely ignore this email.</p>
          
          <div class="footer">
            <p style="margin: 0 0 16px 0;">Ready to start winning? 🚀</p>
            <p style="margin: 0; color: #7C3AED; font-weight: 600;">The Small Wins Team</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">Turn ordinary moments into momentum</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

}
