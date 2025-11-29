#!/bin/bash
# Setup S3 backend for Terraform state
# Run this ONCE before using Terraform with the S3 backend

BUCKET_NAME="statistic-service-terraform-state"
REGION="us-east-1"
TABLE_NAME="terraform-state-lock"

echo "Setting up Terraform remote state backend..."

# Create S3 bucket for state
echo "Creating S3 bucket: $BUCKET_NAME..."
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$REGION" 2>/dev/null || echo "Bucket already exists or error occurred"

# Enable versioning on the bucket
echo "Enabling versioning on S3 bucket..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

# Enable server-side encryption
echo "Enabling encryption on S3 bucket..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
echo "Blocking public access to S3 bucket..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create DynamoDB table for state locking
echo "Creating DynamoDB table for state locking: $TABLE_NAME..."
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>/dev/null || echo "Table already exists or error occurred"

echo ""
echo "✅ Backend setup complete!"
echo "Now you can run 'terraform init' to migrate your state to S3"
