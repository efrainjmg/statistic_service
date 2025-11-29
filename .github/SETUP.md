# GitHub Actions Setup Guide

This document explains how to configure GitHub Actions for automatic deployment of the Statistics Service.

## Prerequisites

- GitHub repository for the project
- AWS account with appropriate permissions
- AWS credentials (Access Key ID and Secret Access Key)

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Steps to Add Secrets:

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### Optional: Environment Variables

You can customize the deployment by modifying the environment variables in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

```yaml
env:
  AWS_REGION: us-east-1               # Change to your preferred region
  DYNAMODB_TABLE_NAME: UrlShortenerTable  # Your DynamoDB table name
  LAMBDA_FUNCTION_NAME: statistic-service # Lambda function name
```

## Workflows

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger**: Automatic deployment on push to `main` branch

**What it does**:
- ✅ Checks out the code
- ✅ Installs Node.js dependencies
- ✅ Sets up Terraform
- ✅ Configures AWS credentials
- ✅ Runs `terraform init`, `validate`, `plan`, and `apply`
- ✅ Outputs the API Gateway URL

**Manual Trigger**: You can also trigger this workflow manually from the GitHub Actions tab using the "Run workflow" button.

### 2. Test Workflow (`.github/workflows/test.yml`)

**Trigger**: Runs on pull requests and pushes to non-main branches

**What it does**:
- ✅ Installs dependencies
- ✅ Checks for security vulnerabilities (`npm audit`)
- ✅ Validates Terraform formatting
- ✅ Validates Terraform configuration

## How to Use

### Initial Setup

1. **Configure AWS Credentials**:
   - Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub Secrets
   - Ensure the AWS user has permissions for:
     - Lambda (create, update functions)
     - DynamoDB (read access)
     - API Gateway (create, update APIs)
     - IAM (create roles and policies)
     - CloudWatch (create log groups)

2. **Verify Configuration**:
   - Check the environment variables in `deploy.yml`
   - Update region, table name, and function name if needed

3. **Push to Main**:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflows"
   git push origin main
   ```

4. **Monitor Deployment**:
   - Go to the **Actions** tab in your GitHub repository
   - Watch the deployment progress
   - Check the deployment summary for the API Gateway URL

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and push**:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/my-feature
   ```

3. **Create a Pull Request**:
   - The test workflow will run automatically
   - Verify all tests pass before merging

4. **Merge to Main**:
   - Once PR is approved and merged, deployment workflow runs automatically
   - The service will be deployed to AWS

## Deployment Output

After a successful deployment, you'll see a summary in the GitHub Actions log:

```
### Deployment Successful! 🚀

**Service:** Statistics Service
**Region:** us-east-1
**Lambda Function:** statistic-service
**API Endpoint:** https://abc123.execute-api.us-east-1.amazonaws.com/stats
```

## Troubleshooting

### Issue: AWS Credentials Error

**Error**: `Error: Could not load credentials from any providers`

**Solution**: 
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in GitHub Secrets
- Check that the secrets are spelled exactly as shown above

### Issue: Terraform State Lock

**Error**: `Error acquiring the state lock`

**Solution**:
- This usually happens if a previous deployment was interrupted
- Wait a few minutes and try again
- If persistent, you may need to manually unlock the state in AWS

### Issue: Permission Denied

**Error**: `AccessDenied` or `UnauthorizedException`

**Solution**:
- Ensure your AWS credentials have the necessary permissions
- Review the IAM policy attached to your AWS user

### Issue: DynamoDB Table Not Found

**Error**: `ResourceNotFoundException: Requested resource not found`

**Solution**:
- Verify the `DYNAMODB_TABLE_NAME` environment variable matches your actual table name
- Ensure the table exists in the specified AWS region

## Security Best Practices

1. **Least Privilege**: Use AWS credentials with minimum required permissions
2. **Rotate Credentials**: Regularly rotate AWS access keys
3. **Use Environments**: Consider using GitHub Environments for production deployments with additional protection rules
4. **Review Logs**: Regularly review deployment logs for any security issues

## Advanced Configuration

### Using Terraform Backend

For production deployments, consider using a remote Terraform backend (S3 + DynamoDB):

```hcl
# Add to terraform/main.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "statistic-service/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
    encrypt        = true
  }
}
```

Then update `.github/workflows/deploy.yml` to remove `-backend=false` flag.

### Using GitHub Environments

1. Create a GitHub Environment (Settings → Environments → New environment)
2. Add environment-specific secrets
3. Update workflow to use the environment:

```yaml
jobs:
  deploy:
    environment: production  # Add this line
    name: Deploy to AWS
    runs-on: ubuntu-latest
```

## Support

For issues or questions:
- Check the GitHub Actions logs
- Review the Terraform documentation
- Consult AWS CloudWatch logs for Lambda errors
