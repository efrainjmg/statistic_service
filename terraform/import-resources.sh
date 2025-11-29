#!/bin/bash
# Import existing AWS resources into Terraform state
# Run this from the terraform/ directory

echo "Importing existing AWS resources into Terraform state..."

# Import IAM Role
terraform import aws_iam_role.lambda_role statistic-service-role

# Import IAM Policy (you'll need the ARN from AWS console or CLI)
# Get the AWS account ID first
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
terraform import aws_iam_policy.dynamodb_policy arn:aws:iam::${ACCOUNT_ID}:policy/statistic-service-dynamodb-policy

# Import CloudWatch Log Groups
terraform import aws_cloudwatch_log_group.lambda_logs /aws/lambda/statistic-service
terraform import aws_cloudwatch_log_group.api_logs /aws/apigateway/statistic-service

echo "Import complete! Now you can run 'terraform apply' to update the resources."
