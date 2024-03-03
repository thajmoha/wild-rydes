import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface BackendProps extends cdk.StackProps {
  appName: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id, props);

    // dynamodb
    const dynamoDbTable = new dynamodb.TableV2(
      this,
      `${props.appName}RidesTable`,
      {
        tableName: `${props.appName}RidesTable`,
        partitionKey: { name: "RideId", type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // lambda
    const myLambda = new lambda.Function(
      this,
      `${props.appName}RequestUnicorn`,
      {
        functionName: `${props.appName}RequestUnicorn`,
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "lambda-backend-handler")
        ),
        handler: "requestUnicorn.handler",
      }
    );

    // add lambda permission
    const dynamodbPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["dynamodb:PutItem"],
      resources: [dynamoDbTable.tableArn],
    });
    myLambda.addToRolePolicy(dynamodbPolicy);
    myLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess")
    );
    myLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // apigateway
    const api = new apigateway.RestApi(this, `${props.appName}Api`, {
      restApiName: `${props.appName}Api`,
      endpointTypes: [apigateway.EndpointType.EDGE],
    });
    // authorization
    const userPoolId = cdk.Fn.importValue("UserPoolId");

    const auth = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      `${props.appName}ApiAuth`,
      {
        cognitoUserPools: [
          cognito.UserPool.fromUserPoolId(this, "ImportedUserPool", userPoolId),
        ],
      }
    );
    // ride resource
    const rideResource = api.root.addResource("ride");
    // Enable CORS for the ride resource
    rideResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
    });
    rideResource.addMethod("POST", new apigateway.LambdaIntegration(myLambda), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    new cdk.CfnOutput(this, "prodApiUrl", {
      value: api.url,
      exportName: "prodApiUrl",
    });
  }
}
