import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";

interface StaticWebsiteProps extends cdk.StackProps {
  rootDomainName: string;
  appName: string;
}

export class StaticWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id, props);

    const logsBucket = new s3.Bucket(this, "logs", {
      bucketName: `logs.${props.rootDomainName}`,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // define bucket metrics
    const websiteBucketMetrics: s3.BucketMetrics[] = [{ id: "UsageFilter" }];

    const websiteBucket = new s3.Bucket(this, "website", {
      bucketName: props.rootDomainName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      metrics: websiteBucketMetrics,
      websiteErrorDocument: "error.html",
      websiteIndexDocument: "index.html",
      serverAccessLogsBucket: logsBucket,
      autoDeleteObjects: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
        blockPublicPolicy: false,
      },
    });
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [new iam.AnyPrincipal()],
      })
    );

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("../Wild_Rydes")],
      destinationBucket: websiteBucket,
    });
    console.log("----------------------");
    const userPoolId = cdk.Fn.importValue("UserPoolId");
    const userPoolClientId = cdk.Fn.importValue("UserPoolClientId");
    const apiInvokeUrl = cdk.Fn.importValue("prodApiUrl");
    console.log("----------------------");

    const myLambda = new lambda.Function(this, "lambda-config-updates", {
      functionName: "WildRydesConfigUpdatedFunction",
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "lambda-config-update-handler")
      ),
      handler: "main.lambda_handler",
      environment: {
        appName: props.appName,
        userPoolId: userPoolId,
        userPoolClientId: userPoolClientId,
        invokeUrl: apiInvokeUrl,
      },
    });

    // Custom IAM policy
    const s3Policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:PutObject"],
      resources: ["*"], // Change this to your S3 bucket ARN
    });
    const cognitoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:ListUserPools", "cognito-idp:ListUserPoolClients"],
      resources: ["*"],
    });
    myLambda.addToRolePolicy(s3Policy);
    myLambda.addToRolePolicy(cognitoPolicy);

    myLambda.addEventSource(
      new eventsources.S3EventSource(websiteBucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "js/config_template.js" }],
      })
    );
  }
}
