# Terraform State Backend Setup

## Problem
When running Terraform in CI/CD, you were getting "resource already exists" errors because each workflow run starts with a fresh state file.

## Solution
We've configured a **remote S3 backend** to store Terraform state persistently across CI/CD runs.

## One-Time Setup (Run Locally ONCE)

### Option 1: Using PowerShell (Windows)
```powershell
cd terraform
.\setup-backend.ps1
```

### Option 2: Using Bash (Linux/Mac/Git Bash)
```bash
cd terraform
chmod +x setup-backend.sh
./setup-backend.sh
```

This will create:
- **S3 Bucket**: `statistic-service-terraform-state` (with encryption & versioning)
- **DynamoDB Table**: `terraform-state-lock` (for state locking)

## Import Existing Resources

After setting up the backend, you need to import your existing AWS resources into the Terraform state:

### Using PowerShell:
```powershell
cd terraform
terraform init -reconfigure  # Migrate to S3 backend
.\import-resources.ps1       # Import existing resources
```

### Using Bash:
```bash
cd terraform
terraform init -reconfigure  # Migrate to S3 backend
chmod +x import-resources.sh
./import-resources.sh        # Import existing resources
```

## Verify Setup

Check that state is now in S3:
```bash
aws s3 ls s3://statistic-service-terraform-state/
terraform state list  # Should show all imported resources
```

## What Happens Next

1. ✅ Your local Terraform state moves to S3
2. ✅ Existing resources are imported into that state
3. ✅ CI/CD will use the same S3 state
4. ✅ No more "resource already exists" errors!

## Important Notes

- **Run setup-backend script only ONCE** (creates S3 & DynamoDB)
- **Run import-resources script only ONCE** (imports existing AWS resources)
- **Commit the updated main.tf** with backend configuration to Git
- After this, all Terraform operations will use S3 as the backend
