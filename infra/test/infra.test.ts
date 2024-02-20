import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { WebsiteS3Stack } from "../lib/website-s3-stack";

test("stack created", () => {
  const app = new cdk.App();
  const stack = new WebsiteS3Stack(app, "MyTestStack", {
    env: { account: "test-account", region: "us-east-1" },
    rootDomainName: "example",
  });
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
