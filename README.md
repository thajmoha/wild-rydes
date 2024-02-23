# wild-rydes

a serverless ride sharing web application.

The application architecture uses AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon Cognito, and AWS S3

## Deployment

| Stack                        | AWS services | Stack Dependencies           |
| ---------------------------- | ------------ | ---------------------------- |
| WildRydesUserManagementStack | Cognito      | NA                           |
| WildRydesStaticWebsiteStack  | S3           | WildRydesUserManagementStack |

- deploy **WildRydesUserManagementStcak** `cdk deploy 'WildRydesUserManagementStack' --profile=foothill`
- deploy **WildRydesStaticWebsiteStcak** a specific stack `cdk deploy 'WildRydesStaticWebsiteStack' --profile=foothill`
