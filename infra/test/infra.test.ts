import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { StaticWebsiteStack } from "../lib/static-website-stack";
import { UserManagementStack } from "../lib/user-management-stack";
import { BackendStack } from "../lib/backend-stack";

test("stack templated should match snapshot", () => {
  const app = new cdk.App();
  const appName = "test";
  const rootDomainName = "example";
  const env = { account: "test-account", region: "us-east-1" };

  // user management stack
  const userManagementStack = new UserManagementStack(
    app,
    `${appName}UserManagementStack`,
    {
      env,
      appName,
    }
  );

  // backend
  const backendStack = new BackendStack(app, `${appName}BackendStack`, {
    env,
    appName,
  });
  backendStack.addDependency(userManagementStack);

  // static website
  const staticWebsiteStack = new StaticWebsiteStack(
    app,
    `${appName}StaticWebsiteStack`,
    {
      env,
      rootDomainName,
      appName,
    }
  );
  staticWebsiteStack.addDependency(backendStack);

  const template = Template.fromStack(staticWebsiteStack);
  expect(template.toJSON()).toMatchSnapshot();
});
