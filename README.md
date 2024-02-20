# wild-rydes

a serverless ride sharing web application.

The application architecture uses AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon Cognito, and AWS S3

## Deployment

| Stack                        | AWS services | Stack Dependencies           |
| ---------------------------- | ------------ | ---------------------------- |
| WildRydesUserManagementStack | Cognito      | NA                           |
| WildRydesStaticWebsiteStack  | S3           | WildRydesUserManagementStack |

- to deploy all stacks `cdk deploy '**' --profile=foothill`
- to deploy a specific stack `cdk deploy '<stack-name>' --profile=foothill`
