import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

interface WildRydesStackProps extends cdk.StackProps {
  rootDomainName: string;
}

export class WildRydesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WildRydesStackProps) {
    super(scope, id, props);

    const logsBuckt = new s3.Bucket(this, "logs", {
      bucketName: `logs.${props.rootDomainName}`,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const websiteBucket = new s3.Bucket(this, "website", {
      bucketName: props.rootDomainName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteErrorDocument: "error.html",
      websiteIndexDocument: "index.html",
      serverAccessLogsBucket: logsBuckt,
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
  }
}
