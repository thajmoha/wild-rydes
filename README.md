# wild-rydes

a serverless ride sharing web application.

The application architecture uses AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon Cognito, and AWS S3

## Deployment

| Stack                        | AWS services        | Stack Dependencies           |
| ---------------------------- | ------------------- | ---------------------------- |
| WildRydesUserManagementStack | Cognito             | NA                           |
| WildBackendStack             | API Gateway/ Lambda | WildRydesUserManagementStack |
| WildRydesStaticWebsiteStack  | S3/ Lambda          | WildBackendStack             |

- deploy all stacks `cdk deploy --all --profile=foothill`
- destroy all stacks `cdk destroy --all --profile=foothill`
- deploy <specific-stack> a specific stack `cdk deploy '<specific-stack>' --profile=foothill`
