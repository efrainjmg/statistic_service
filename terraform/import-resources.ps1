# PowerShell script to import existing AWS resources into Terraform state
# Run this from the terraform/ directory

Write-Host "Importing existing AWS resources into Terraform state..." -ForegroundColor Green

# Import IAM Role
Write-Host "Importing IAM Role..." -ForegroundColor Yellow
terraform import aws_iam_role.lambda_role statistic-service-role

# Import IAM Policy (you'll need the ARN from AWS console or CLI)
Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
Write-Host "Account ID: $ACCOUNT_ID" -ForegroundColor Cyan

Write-Host "Importing IAM Policy..." -ForegroundColor Yellow
terraform import aws_iam_policy.dynamodb_policy "arn:aws:iam::${ACCOUNT_ID}:policy/statistic-service-dynamodb-policy"

# Import CloudWatch Log Groups
Write-Host "Importing Lambda Log Group..." -ForegroundColor Yellow
terraform import aws_cloudwatch_log_group.lambda_logs /aws/lambda/statistic-service

Write-Host "Importing API Gateway Log Group..." -ForegroundColor Yellow
terraform import aws_cloudwatch_log_group.api_logs /aws/apigateway/statistic-service

Write-Host "Import complete! Now you can run 'terraform apply' to update the resources." -ForegroundColor Green
