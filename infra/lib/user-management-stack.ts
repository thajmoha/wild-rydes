//see fore more info
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito-readme.html#user-pools

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Duration } from "aws-cdk-lib";

interface UserManagementProps extends cdk.StackProps {
  appName: string;
}

export class UserManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: UserManagementProps) {
    super(scope, id, props);

    const userPoolName = `${props.appName}UserPool`;
    const pool = new cognito.UserPool(this, `${props.appName}Pool`, {
      userPoolName: userPoolName,
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // [sign up]
      // Users can either be signed up by the app's administrators or can sign themselves up
      // for this app user can sign themselves up

      selfSignUpEnabled: true,
      // see userVerification for signup configuration
      autoVerify: {
        email: true,
      },
      keepOriginal: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },

      // [sign in]
      // Users registering or signing in into your application can do so with multiple identifiers.
      // There are 4 options available: username, email, phone, preferredUsername
      signInAliases: {
        username: true,
      },
      signInCaseSensitive: false, // case insensitive is preferred in most situations

      // [message delivery]
      // By default, user pools are configured to use Cognito's built in email capability, which will send emails from no-reply@verificationemail.com
      // email: cognito.UserPoolEmail.withCognito('support@myawesomeapp.com'),

      // [security]
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // the following parameters are the default values - explicit here for information
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(7),
      },
      mfa: cognito.Mfa.OFF,
    });
    pool.addClient(`${userPoolName}-app-client`, {
      userPoolClientName: `${props.appName}WebApp`,
    });
  }
}
