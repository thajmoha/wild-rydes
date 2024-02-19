import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { WildRydesStack } from "../lib/wild-rydes-stack";

test("stack created", () => {
  const app = new cdk.App();
  const stack = new WildRydesStack(app, "MyTestStack", {
    env: { account: "test-account", region: "us-east-1" },
    rootDomainName: "example",
  });
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
