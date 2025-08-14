"use client";

import { Amplify } from "aws-amplify";

let configured = false;

export function configureAmplify() {
  if (configured) return;
  const cognitoConfig = {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
    loginWith: { username: false, email: true, phone: false },
    allowGuestAccess: false,
    userAttributes: { email: { required: true } },
  } as unknown;
  Amplify.configure({
    Auth: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cognito: cognitoConfig as any,
    },
    API: {
      GraphQL: {
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
        region: "us-east-1",
        defaultAuthMode: "userPool",
      },
    },
  });
  configured = true;
}
