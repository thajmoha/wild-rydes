#!/usr/bin/env node
import * as dotenv from "dotenv";
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StaticWebsiteStack } from "../lib/static-website-stack";
import { UserManagementStack } from "../lib/user-management-stack";

dotenv.config();

const awsAccount = process.env.AWS_ACCOUNT as string;
if (!awsAccount) {
  throw new Error("AWS_ACCOUNT is required");
}

const awsRegion = process.env.AWS_REGION as string;
if (!awsRegion) {
  throw new Error("AWS_REGION is required");
}

const env = {
  account: awsAccount,
  region: awsRegion,
};

const rootDomainName = process.env.ROOT_DOMAIN_NAME as string;
if (!rootDomainName) {
  throw new Error("ROOT_DOMAIN_NAME is required");
}

const appName = process.env.APP_NAME as string;
if (!appName) {
  throw new Error("APP_NAME is required");
}
const userPoolId = process.env.USER_POOL_ID as string;
const userPoolClientId = process.env.USER_POOL__CLIENT_ID as string;

const app = new cdk.App();

// user management stack
const userManagementStack = new UserManagementStack(
  app,
  `${appName}UserManagementStack`,
  {
    env,
    appName,
  }
);

// static website

new StaticWebsiteStack(app, `${appName}StaticWebsiteStack`, {
  env,
  rootDomainName,
});
